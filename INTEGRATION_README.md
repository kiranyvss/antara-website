# Antara + Appointment Module

This version keeps the existing Antara Next.js/React portal and integrates the appointment scheduler as a separate FastAPI backend.

## Architecture

Browser -> Next.js (port 3000) -> `/backend-api/*` rewrite -> FastAPI (port 8000) -> SQLite

The rewrite means the React application does not need to know the backend port and avoids browser CORS issues during normal local development.

## Run on Windows

### 1. Start backend

Open PowerShell:

```powershell
cd backend
python -m venv .venv
.venv\\Scripts\\activate
python -m pip install -r requirements.txt
copy .env.example .env
# Edit .env and set ADMIN_PASSWORD to your own password
python scripts\\seed.py
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### 2. Start existing Antara portal

Open another PowerShell in the project root:

```powershell
npm install
npm run dev
```

Open `http://localhost:3000`.

Admin page: `http://localhost:3000/admin`

## What was integrated

- Existing Antara design and staff data remain in the Next.js frontend.
- The booking panel now loads appointment types from the backend.
- Date selection is enabled.
- Available slots are calculated from counsellor weekly availability, holidays, leave and existing appointments.
- Booking is revalidated by the backend immediately before saving.
- Client name, age, gender, phone and optional email are stored.
- Staff IDs use the existing Antara values (`S001`, `S002`, etc.), so the frontend and database refer to the same counsellors.
- Admin page allows working-hour rules, leave, holidays and appointment cancellation.

## Important

The starter uses a simple admin password/token for local development. Before production, add HTTPS, proper authentication/session management, audit logging, backups, privacy/consent controls, rate limiting and security review.

## Counsellor availability admin screen

The `/admin` page is now included in the Next.js app. Sign in with the backend `ADMIN_PASSWORD` and manage:

- Weekly working-hour windows per counsellor (multiple windows per day supported)
- Counsellor leave, including partial-day leave
- Clinic holidays
- Existing appointments and cancellations

The booking page uses the backend availability calculation, so weekly hours, leave, holidays and booked appointments all affect the slots shown to clients.

### Vercel deployment

The FastAPI backend is a separate service. Set the Vercel project environment variable `BACKEND_URL` to the deployed FastAPI base URL (for example, `https://api.example.com`). Do not leave it pointing to `127.0.0.1` in production.

Set the backend `CORS_ORIGINS` to the deployed Antara website origin. For production, use a persistent PostgreSQL database rather than the local SQLite default, and use a strong `ADMIN_PASSWORD` stored as a secret/environment variable.
