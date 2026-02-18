# Railway Deployment Guide

Deploying the teaching platform (Express backend + Next.js frontend + MySQL) to Railway Hobby plan.

> **Architecture on Railway:**
> - **Backend service** → `https://your-backend.railway.app`
> - **Frontend service** → `https://your-frontend.railway.app`
> - **MySQL plugin** → internal Railway database

---

## Phase 1 — Code Changes ✅ (Already done)

These are already applied to the codebase:

| Change | File | What |
|--------|------|------|
| ✅ Cross-domain cookies | `backend/src/controllers/auth.controller.ts` | `sameSite: 'none'` in production (was `'lax'`) |
| ✅ Backend Railway config | `backend/railway.toml` | Build + start commands |
| ✅ Frontend Railway config | `frontend/railway.toml` | Build + start commands |

---

## Phase 2 — Railway Project Setup

### Step 1: Push code to GitHub
Make sure your latest code is pushed to GitHub before connecting to Railway.

### Step 2: Create Railway Project
1. Go to https://railway.app → **New Project** → **Empty Project**
2. Name it `teaching-platform`

### Step 3: Add MySQL Database
1. In the project → click **+ New** → **Database** → **MySQL**
2. Wait for it to provision
3. Click the MySQL service → go to **Variables** tab
4. Note down these 5 values — you'll need them for the backend:
   - `MYSQLHOST`
   - `MYSQLPORT`
   - `MYSQLUSER`
   - `MYSQLPASSWORD`
   - `MYSQLDATABASE`
5. Click **Connect** (in the MySQL service) → open the MySQL shell or use a GUI like TablePlus
6. Copy-paste the entire contents of `database/mysql_schema.sql` and run it

### Step 4: Add Backend Service
1. In the project → click **+ New** → **GitHub Repo** → select your repo
2. In the service settings → **Settings** → set **Root Directory** = `/backend`
3. Railway will auto-detect Node.js and use `railway.toml`
4. Go to **Settings → Networking** → click **Generate Domain**
   - Note the domain, e.g. `teaching-backend-production.railway.app`
5. Set environment variables (see Phase 3 — Backend Variables below)
6. The service will auto-deploy

### Step 5: Add Frontend Service
1. In the project → click **+ New** → **GitHub Repo** → same repo
2. In the service settings → **Settings** → set **Root Directory** = `/frontend`
3. Go to **Settings → Networking** → click **Generate Domain**
   - Note the domain, e.g. `teaching-frontend-production.railway.app`
4. Set environment variables (see Phase 3 — Frontend Variables below)
5. The service will auto-deploy

---

## Phase 3 — Environment Variables

### Backend Service — set in Railway dashboard → Variables tab

```
NODE_ENV=production
PORT=5000

# MySQL — paste values from Railway MySQL service
DB_HOST=<MYSQLHOST>
DB_PORT=<MYSQLPORT>
DB_USER=<MYSQLUSER>
DB_PASSWORD=<MYSQLPASSWORD>
DB_NAME=<MYSQLDATABASE>

# Auth — use strong random strings (min 32 chars each)
JWT_ACCESS_SECRET=<generate a strong random string>
JWT_REFRESH_SECRET=<different strong random string>
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# CORS — set to your Railway FRONTEND domain
FRONTEND_URL=https://teaching-frontend-production.railway.app

# Do NOT set COOKIE_DOMAIN — leave it out entirely

# Encryption — same 64-char hex as your local .env
ENCRYPTION_KEY=<your existing ENCRYPTION_KEY value>

# YouTube OAuth
YOUTUBE_CLIENT_ID=<your client id>
YOUTUBE_CLIENT_SECRET=<your client secret>
YOUTUBE_REDIRECT_URI=https://teaching-backend-production.railway.app/api/auth/google/callback

# Firebase — same values as local .env
FIREBASE_PROJECT_ID=<your project id>
FIREBASE_PRIVATE_KEY_ID=<your key id>
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=<your client email>
FIREBASE_CLIENT_ID=<your client id>
FIREBASE_STORAGE_BUCKET=<your bucket name>
FIREBASE_SIGNED_URL_EXPIRY_MINUTES=60
```

> **FIREBASE_PRIVATE_KEY note:** In Railway, paste the key exactly as it appears in your local `.env` — with the literal `\n` characters. Railway handles the escaping correctly.

### Frontend Service — set in Railway dashboard → Variables tab

```
NEXT_PUBLIC_API_URL=https://teaching-backend-production.railway.app/api
NEXT_PUBLIC_SITE_URL=https://teaching-frontend-production.railway.app
```

---

## Phase 4 — External Services to Update

### 4A. Google Cloud Console — Add Production Redirect URI
1. Go to https://console.cloud.google.com → **APIs & Services** → **Credentials**
2. Open your OAuth 2.0 Client ID
3. Under **"Authorized redirect URIs"**, click **Add URI** and add:
   ```
   https://teaching-backend-production.railway.app/api/auth/google/callback
   ```
4. Click **Save**

### 4B. Firebase Storage CORS
After you know your final frontend URL, update `cors.json`:
```json
[
  {
    "origin": ["http://localhost:3000", "https://teaching-frontend-production.railway.app"],
    "method": ["PUT", "GET"],
    "responseHeader": ["Content-Type"],
    "maxAgeSeconds": 3600
  }
]
```
Then apply it (requires `gsutil` installed and authenticated):
```bash
gsutil cors set cors.json gs://YOUR_FIREBASE_BUCKET_NAME
```

---

## Phase 5 — Verification Checklist

Test these after both services are deployed and green:

- [ ] **Backend health:** `GET https://your-backend.railway.app/health` → returns 200
- [ ] **Frontend loads:** `https://your-frontend.railway.app` → shows the login page
- [ ] **Login works:** Sign in as teacher or student, check that you're redirected to dashboard
- [ ] **Cookies set:** Open DevTools → Application → Cookies → should see `accessToken` and `refreshToken` with `Secure` + `SameSite=None`
- [ ] **API calls work:** Dashboard loads data (tests DB connection)
- [ ] **Course creation:** Teacher creates a course with thumbnail (tests Firebase upload)
- [ ] **Student sees course:** Student logs in and sees the course (tests scoped DB query)
- [ ] **YouTube connect flow:** Teacher goes to Settings → Connect YouTube (tests OAuth redirect URI)

---

## Troubleshooting

| Problem | Likely cause | Fix |
|---------|-------------|-----|
| Build fails | TypeScript error | Check Railway build logs |
| 500 on all API calls | Missing env var | Check backend Variables tab — all DB vars present? |
| Login fails / 401 | CORS or cookie issue | Check `FRONTEND_URL` matches exact frontend domain |
| Cookies not sent | `sameSite` issue | Ensure `NODE_ENV=production` is set in backend |
| Firebase upload fails | CORS or credentials | Run `gsutil cors set` and verify env vars |
| YouTube OAuth 400 | Redirect URI mismatch | Check Google Cloud Console has the production URI |
| MySQL connection refused | Wrong DB host | Use `MYSQLHOST` from Railway MySQL service, not `localhost` |

---

## Re-deployment

Every `git push` to your connected branch triggers an automatic redeploy on Railway. No manual action needed after the initial setup.
