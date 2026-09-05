import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db, ensureAdmin } from './database.js';

const app = express();
const port = Number(process.env.PORT || 4000);
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret || jwtSecret.length < 32) throw new Error('JWT_SECRET must be at least 32 characters long.');

const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:4173').split(',').map((value) => value.trim()).filter(Boolean);
app.use(helmet());
app.use(cors({ origin: allowedOrigins, credentials: false }));
app.use(express.json({ limit: '20kb' }));
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false }));

const publicUser = ({ id, name, email, role, created_at }) => ({ id, name, email, role, createdAt: created_at });
const cleanEmail = (email) => typeof email === 'string' ? email.trim().toLowerCase() : '';
const validEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const issueToken = (user) => jwt.sign({ sub: user.id, role: user.role }, jwtSecret, { expiresIn: '2h' });

function auth(required = true) {
  return (req, res, next) => {
    const header = req.get('authorization');
    if (!header?.startsWith('Bearer ')) return required ? res.status(401).json({ error: 'Authentication required.' }) : next();
    try {
      req.auth = jwt.verify(header.slice(7), jwtSecret);
      next();
    } catch {
      return res.status(401).json({ error: 'Invalid or expired token.' });
    }
  };
}
function adminOnly(req, res, next) {
  if (req.auth?.role !== 'admin') return res.status(403).json({ error: 'Administrator access required.' });
  next();
}
function parsePayload(payload) {
  try { return JSON.parse(payload); } catch { return {}; }
}
function submissionView(row) {
  return { id: row.id, userId: row.user_id, email: row.email, kind: row.kind, payload: parsePayload(row.payload), status: row.status, createdAt: row.created_at, updatedAt: row.updated_at };
}

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'qiskit-fall-fest-api' }));

app.post('/api/auth/signup', async (req, res) => {
  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
  const email = cleanEmail(req.body?.email);
  const password = req.body?.password;
  if (name.length < 2 || name.length > 80 || !validEmail(email) || typeof password !== 'string' || password.length < 8 || password.length > 128) {
    return res.status(400).json({ error: 'Name, valid email, and password of 8-128 characters are required.' });
  }
  try {
    const passwordHash = await bcrypt.hash(password, 12);
    const result = db.prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)').run(name, email, passwordHash);
    const user = db.prepare('SELECT id, name, email, role, created_at FROM users WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ user: publicUser(user), token: issueToken(user) });
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') return res.status(409).json({ error: 'An account with that email already exists.' });
    res.status(500).json({ error: 'Could not create account.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const email = cleanEmail(req.body?.email);
  const password = req.body?.password;
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || typeof password !== 'string' || !(await bcrypt.compare(password, user.password_hash))) return res.status(401).json({ error: 'Invalid email or password.' });
  res.json({ user: publicUser(user), token: issueToken(user) });
});

app.post('/api/auth/logout', auth(), (_req, res) => res.status(204).end());
app.get('/api/auth/me', auth(), (req, res) => {
  const user = db.prepare('SELECT id, name, email, role, created_at FROM users WHERE id = ?').get(req.auth.sub);
  if (!user) return res.status(404).json({ error: 'User not found.' });
  res.json({ user: publicUser(user) });
});

app.post('/api/interest', auth(false), (req, res) => {
  const email = cleanEmail(req.body?.email);
  if (!validEmail(email)) return res.status(400).json({ error: 'A valid email is required.' });
  const payload = JSON.stringify({ source: 'website-interest-form' });
  const result = db.prepare('INSERT INTO submissions (user_id, email, kind, payload) VALUES (?, ?, ?, ?)').run(req.auth?.sub || null, email, 'interest', payload);
  res.status(201).json({ submission: { id: result.lastInsertRowid, email, kind: 'interest', status: 'new' } });
});

app.post('/api/submissions', auth(), (req, res) => {
  const kind = typeof req.body?.kind === 'string' ? req.body.kind.trim().slice(0, 40) : '';
  const payload = req.body?.payload;
  if (!kind || !payload || typeof payload !== 'object' || Array.isArray(payload)) return res.status(400).json({ error: 'A submission kind and object payload are required.' });
  const user = db.prepare('SELECT email FROM users WHERE id = ?').get(req.auth.sub);
  const result = db.prepare('INSERT INTO submissions (user_id, email, kind, payload) VALUES (?, ?, ?, ?)').run(req.auth.sub, user.email, kind, JSON.stringify(payload));
  res.status(201).json({ submission: submissionView(db.prepare('SELECT * FROM submissions WHERE id = ?').get(result.lastInsertRowid)) });
});

app.get('/api/submissions/me', auth(), (req, res) => {
  const rows = db.prepare('SELECT * FROM submissions WHERE user_id = ? ORDER BY created_at DESC').all(req.auth.sub);
  res.json({ submissions: rows.map(submissionView) });
});

app.get('/api/admin/users', auth(), adminOnly, (_req, res) => {
  const users = db.prepare('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC').all();
  res.json({ users: users.map(publicUser) });
});
app.patch('/api/admin/users/:id', auth(), adminOnly, (req, res) => {
  const id = Number(req.params.id);
  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : null;
  const role = req.body?.role;
  if (!Number.isInteger(id) || (name !== null && (name.length < 2 || name.length > 80)) || !['user', 'admin'].includes(role)) return res.status(400).json({ error: 'Valid name and role are required.' });
  const result = db.prepare('UPDATE users SET name = COALESCE(?, name), role = ? WHERE id = ?').run(name, role, id);
  if (!result.changes) return res.status(404).json({ error: 'User not found.' });
  res.json({ user: publicUser(db.prepare('SELECT id, name, email, role, created_at FROM users WHERE id = ?').get(id)) });
});
app.delete('/api/admin/users/:id', auth(), adminOnly, (req, res) => {
  const id = Number(req.params.id);
  if (id === req.auth.sub) return res.status(400).json({ error: 'You cannot delete your own admin account.' });
  const result = db.prepare('DELETE FROM users WHERE id = ?').run(id);
  if (!result.changes) return res.status(404).json({ error: 'User not found.' });
  res.status(204).end();
});
app.get('/api/admin/submissions', auth(), adminOnly, (_req, res) => {
  const rows = db.prepare('SELECT * FROM submissions ORDER BY created_at DESC').all();
  res.json({ submissions: rows.map(submissionView) });
});
app.patch('/api/admin/submissions/:id', auth(), adminOnly, (req, res) => {
  const status = req.body?.status;
  if (!['new', 'reviewed', 'archived'].includes(status)) return res.status(400).json({ error: 'Status must be new, reviewed, or archived.' });
  const result = db.prepare("UPDATE submissions SET status = ?, updated_at = datetime('now') WHERE id = ?").run(status, Number(req.params.id));
  if (!result.changes) return res.status(404).json({ error: 'Submission not found.' });
  res.json({ submission: submissionView(db.prepare('SELECT * FROM submissions WHERE id = ?').get(req.params.id)) });
});
app.delete('/api/admin/submissions/:id', auth(), adminOnly, (req, res) => {
  const result = db.prepare('DELETE FROM submissions WHERE id = ?').run(Number(req.params.id));
  if (!result.changes) return res.status(404).json({ error: 'Submission not found.' });
  res.status(204).end();
});




app.use((_req, res) => res.status(404).json({ error: 'Route not found.' }));
app.use((error, _req, res, _next) => res.status(error.type === 'entity.parse.failed' ? 400 : 500).json({ error: error.type === 'entity.parse.failed' ? 'Invalid JSON.' : 'Internal server error.' }));

ensureAdmin();
app.listen(port, () => console.log(`Qiskit Fall Fest API listening on port ${port}`));
