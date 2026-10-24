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

The backend is a small Express API using Node's built-in SQLite driver. Passwords are hashed with bcrypt and auth uses short-lived JWT bearer tokens. The backend requires Node 22.5+. SQLite data must live on persistent storage in production; do not run the Render service without a persistent disk, because deploys or instance replacement can lose its local database.

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

### Render API

The API can be deployed as a Render **Web Service** from this repository with root directory `backend`, build command `npm ci`, and start command `npm start`. The backend uses Render's assigned `PORT` and already exposes `GET /api/health`.

**Storage is a deployment prerequisite:** this service uses SQLite, so attach a persistent disk mounted at `/var/data` and set `DATABASE_PATH=/var/data/qiskit-fall-fest.sqlite`. Render persistent disks require a paid instance. Do not deploy the API without persistent storage or point it at an unverified local database. No `render.yaml` is included while persistent storage is deferred, to avoid a configuration that appears deployable but risks losing registrations. Render's free web services spin down after 15 minutes without inbound traffic and can take about a minute to wake; their filesystems are ephemeral. A paid instance avoids this free-tier sleep behavior, but does not guarantee 100% uptime.

Set these variables in the Render service's Environment dashboard (never commit real values):

- `DATABASE_PATH=/var/data/qiskit-fall-fest.sqlite`
- `JWT_SECRET`: a new or intentionally preserved random secret of at least 32 characters; changing it invalidates existing tokens.
- `FRONTEND_URL`: the exact deployed frontend origin, such as `https://your-site.vercel.app` (no path); comma-separate additional allowed origins.
- `ADMIN_EMAIL` and `ADMIN_PASSWORD`: the existing admin identity/strong password. The API ensures the configured admin account on startup; use the existing credentials when preserving the same database.
- `PORT` is assigned by Render; do not set a fixed production value.

The repository does not reveal the live Railway database path or prove that its production data matches the existing local SQLite file. Before cutover, identify and back up the actual Railway database, then copy/restore that database to the Render disk while the API is stopped. Verify its users and submissions and test login against the restored copy before sending traffic to Render. Do not remove Railway's volume/service or change its data until the Render copy and application behavior have been verified. SQLite WAL databases must be backed up consistently (use SQLite's backup mechanism or stop writes and checkpoint/close the database first); copying only the main `.sqlite` file while writes are active may omit committed data.

### Vercel frontend

1. Import the repository into Vercel with the project root set to this folder.
2. Set the output to the project root (the site is static; no build command is needed).
3. `api-config.js` selects `https://ibm-qiskit-event-2026.onrender.com/api` for deployed sites and `http://localhost:4000/api` for local development. Redeploy the frontend after changing this configuration.
4. Set the exact Vercel origin in Render's `FRONTEND_URL` and redeploy the API if it changes.

Keep the current Railway deployment and its data available as a rollback until registration, login, authenticated requests, database reads/writes, and CORS have all been checked against Render. After cutover, monitor both services before deciding when to stop the old service; do not delete its database or volume as part of the initial migration.

Never commit `.env`, database files, passwords, or JWT secrets.

The site is a zero-build static frontend. Edit `index.html`, `app.js`, and `styles.css` for event content and visual changes.

## Content update points

- Event status and metadata: announcement bar and hero metadata in `index.html`
- Countdown target: `target` in `app.js`
- Schedule: `sessions` array in `app.js`
- Registration: `interestForm` is connected to `POST /api/interest`; replace it with the official registration form URL when finalized
- Speakers, organizer details, gallery, statistics and archive materials: replace marked placeholders in `index.html`
- External learning links: resource list in `index.html`
