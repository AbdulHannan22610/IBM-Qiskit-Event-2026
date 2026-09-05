# Qiskit Fall Fest 2026

An interactive, content-first event hub for a local Qiskit Fall Fest chapter.

## Run locally

Start the API in one terminal:

```powershell
cd backend
Copy-Item .env.example .env
# Edit .env and set a JWT_SECRET with at least 32 characters.
npm install
npm run dev
```

Start the frontend in a second terminal:

```powershell
python -m http.server 4173
```

Open `http://localhost:4173`. The frontend reads its API URL from `api-config.js`, which defaults to `http://localhost:4000/api` for local development.

## Backend

The backend is a small Express API using Node's built-in SQLite driver. SQLite keeps local development free and simple; on Railway, attach a persistent volume and set `DATABASE_PATH=/data/qiskit-fall-fest.sqlite` so data survives deployments. Passwords are hashed with bcrypt and auth uses short-lived JWT bearer tokens. No paid services are required. The backend requires Node 22.5+.

### API endpoints

- `GET /api/health`
- `POST /api/auth/signup` with `{ name, email, password }`
- `POST /api/auth/login` with `{ email, password }`
- `POST /api/auth/logout` and `GET /api/auth/me` with `Authorization: Bearer <token>`
- `POST /api/interest` with `{ email }` (public, used by the existing website form)
- `POST /api/submissions` and `GET /api/submissions/me` (authenticated user submissions)
- `GET /api/admin/users`, `PATCH /api/admin/users/:id`, `DELETE /api/admin/users/:id`
- `GET /api/admin/submissions`, `PATCH /api/admin/submissions/:id`, `DELETE /api/admin/submissions/:id`

Admin access is created on startup from `ADMIN_EMAIL` and `ADMIN_PASSWORD`. Admin routes require a JWT whose role is `admin`; normal users receive `403`.

## Deployment

### Railway API

1. Create a Railway service from this repository and set the service root directory to `backend` (or configure the start command as `cd backend && npm start`).
2. Add a Railway volume mounted at `/data`.
3. Add variables: `PORT` (Railway provides this), `DATABASE_PATH=/data/qiskit-fall-fest.sqlite`, a random `JWT_SECRET` of 32+ characters, `FRONTEND_URL=https://your-vercel-domain.vercel.app`, `ADMIN_EMAIL`, and a strong `ADMIN_PASSWORD`.
4. Deploy and copy the generated Railway public URL.

### Vercel frontend

1. Import the repository into Vercel with the project root set to this folder.
2. Set the output to the project root (the site is static; no build command is needed).
3. Before deploying, edit `api-config.js` and set `window.API_BASE_URL` to `https://your-railway-domain/api`. This is the only frontend integration setting.
4. Put the final Vercel URL into Railway's `FRONTEND_URL` variable and redeploy the API.

Never commit `.env`, database files, passwords, or JWT secrets.

The site is a zero-build static frontend. Edit `index.html`, `app.js`, and `styles.css` for event content and visual changes.

## Content update points

- Event status and metadata: announcement bar and hero metadata in `index.html`
- Countdown target: `target` in `app.js`
- Schedule: `sessions` array in `app.js`
- Registration: `interestForm` is connected to `POST /api/interest`; replace it with the official registration form URL when finalized
- Speakers, organizer details, gallery, statistics and archive materials: replace marked placeholders in `index.html`
- External learning links: resource list in `index.html`
