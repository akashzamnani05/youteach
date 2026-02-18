# YouTube Plan: Upload Videos to Teacher's Own YouTube Channel

## Context

**Current:** All course videos upload to YOUR single YouTube channel using one hardcoded OAuth refresh token in `.env`. Every teacher's videos land on the same channel.

**Goal:** Each teacher connects their own Google/YouTube account via OAuth. When they upload a course video, it goes to THEIR YouTube channel. Your app acts as an OAuth client that requests permission to upload on the teacher's behalf.

---

## Architecture Overview

```
Current:  Teacher → Upload → YOUR YouTube channel (single refresh token in .env)
New:      Teacher → Google Login → Grant YouTube permission → Upload → THEIR YouTube channel (per-teacher tokens in DB)
```

---

## Token Basics

- **Refresh token** — long-lived (permanent until revoked). Stored encrypted in DB. Used to get new access tokens.
- **Access token** — short-lived (~1 hour). Used for actual YouTube API calls. Auto-refreshed using the refresh token when it expires.

---

## Step-by-Step Implementation

### Step 1: Google Cloud Console Setup (Manual — not code)

Since your previous app was deleted, you need to create everything fresh.

#### 1a. Create a New Project

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Click the project dropdown at the top → **New Project**
3. Name it (e.g. `youteach`) → **Create**
4. Make sure the new project is selected in the dropdown

#### 1b. Enable the YouTube Data API

1. Go to **APIs & Services → Library**
2. Search for `YouTube Data API v3`
3. Click it → **Enable**

#### 1c. Configure the OAuth Consent Screen

1. Go to **APIs & Services → OAuth consent screen**
2. Choose **External** (allows any Google account) → **Create**
3. Fill in:
   - **App name**: your app name (e.g. `YouTeach`)
   - **User support email**: your email
   - **Developer contact email**: your email
4. Click **Save and Continue**
5. On the **Scopes** step → click **Add or Remove Scopes** → search and add:
   - `https://www.googleapis.com/auth/youtube.upload`
   - `https://www.googleapis.com/auth/youtube`
   - `https://www.googleapis.com/auth/userinfo.email`
6. Click **Update** → **Save and Continue**
7. On the **Test users** step → add your own Gmail address (required while app is in "Testing" mode)
8. Click **Save and Continue** → **Back to Dashboard**

> **Note:** While in Testing mode, only email addresses you add as test users can connect. To allow any teacher's Google account, you'll need to submit the app for Google verification later (production step).

#### 1d. Create OAuth 2.0 Credentials (Client ID & Secret)

1. Go to **APIs & Services → Credentials**
2. Click **+ Create Credentials** → **OAuth client ID**
3. Application type: **Web application**
4. Name it (e.g. `YouTeach Web Client`)
5. Under **Authorized redirect URIs** → click **+ Add URI** → add:
   - `http://localhost:5000/api/auth/google/callback` (for local dev)
   - Add your production URL here too when you deploy
6. Click **Create**
7. A popup shows your **Client ID** and **Client Secret** — copy both
8. Add them to your `backend/.env`:
   ```
   YOUTUBE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
   YOUTUBE_CLIENT_SECRET=GOCSPX-your-secret-here
   ```

> These two values are YOUR app's identity. They stay fixed — teachers don't get their own. Every teacher uses your app's client ID to authenticate, but they authorize with their own Google accounts.

---

### Step 2: Database Changes

**New table** — stores each teacher's Google OAuth tokens:

```sql
CREATE TABLE teacher_google_tokens (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    teacher_profile_id CHAR(36) NOT NULL UNIQUE,
    google_email VARCHAR(255) NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    token_expiry TIMESTAMP NOT NULL,
    scopes TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_profile_id) REFERENCES teacher_profiles(id) ON DELETE CASCADE,
    INDEX idx_teacher_google_teacher (teacher_profile_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Key points:**
- One row per teacher (UNIQUE on `teacher_profile_id`)
- `refresh_token` — permanent, stored encrypted, used to get fresh access tokens
- `access_token` — cached for ~1 hour, auto-refreshed when expired
- `google_email` for display ("Connected as: teacher@gmail.com")
- `token_expiry` to know when access token needs refreshing

**Run this SQL** on your database after creating the file.

---

### Step 3: Backend — Google OAuth Flow

#### 3a. NEW: `backend/src/utils/encryption.utils.ts`

AES-256-GCM encrypt/decrypt utility:
- `encrypt(plainText: string): string` — returns `iv:authTag:cipherText` (hex encoded)
- `decrypt(encrypted: string): string` — splits and decrypts
- Uses `ENCRYPTION_KEY` env var (32-byte hex string = 64 hex chars)

#### 3b. NEW: `backend/src/services/google-oauth.service.ts`

Methods:
- **`getAuthUrl(teacherProfileId)`** — generates Google OAuth consent URL
  - Scopes: `youtube.upload`, `youtube`, `userinfo.email`
  - `access_type: 'offline'`, `prompt: 'consent'` (forces refresh token every time)
  - Passes `teacherProfileId` in `state` param (for callback to know which teacher)
- **`handleCallback(code, teacherProfileId)`** — exchanges auth code for tokens
  - `oauth2Client.getToken(code)` → gets access_token + refresh_token
  - Fetches teacher's Google email via `googleapis.oauth2('v2').userinfo.get()`
  - Encrypts both tokens with `encryption.utils`
  - Upserts into `teacher_google_tokens` table (INSERT ON DUPLICATE KEY UPDATE)
- **`getTeacherOAuth2Client(teacherProfileId)`** — returns OAuth2 client with teacher's tokens
  - Reads encrypted tokens from DB
  - Decrypts them
  - If access token expired (`token_expiry < now`), uses refresh token to get a new access token, updates DB
  - Sets credentials on OAuth2Client, returns it ready to use
- **`getConnectionStatus(teacherProfileId)`** — returns `{ connected: boolean, email?: string }`
- **`disconnectGoogle(teacherProfileId)`** — revokes refresh token via Google API + deletes DB row

#### 3c. NEW: `backend/src/controllers/google-oauth.controller.ts`

Endpoints:
- `GET /api/auth/google/connect` — requires auth + teacher role → redirects to Google consent screen
- `GET /api/auth/google/callback` — Google redirects here with `?code=&state=`
  - Validates state matches authenticated teacher
  - Exchanges code for tokens, saves to DB
  - Redirects browser to `FRONTEND_URL/teacher/settings?google=connected`
- `GET /api/auth/google/status` — requires auth → returns `{ connected, email }`
- `POST /api/auth/google/disconnect` — requires auth + teacher → revokes + deletes

#### 3d. NEW: `backend/src/routes/google-oauth.routes.ts`

```typescript
router.get('/connect', authenticate, authorize('teacher'), GoogleOAuthController.connect);
router.get('/callback', authenticate, GoogleOAuthController.callback);
router.get('/status', authenticate, GoogleOAuthController.getStatus);
router.post('/disconnect', authenticate, authorize('teacher'), GoogleOAuthController.disconnect);
```

---

### Step 4: Modify YouTube Service

**File:** `backend/src/services/youtube.service.ts`

**Current:** Uses a single static `oauth2Client` with YOUR refresh token from `.env`.

**Change to:** Accept `teacherProfileId` in every method, get that teacher's OAuth client from `GoogleOAuthService`.

Updated method signatures:
```
uploadVideo(filePath, metadata, teacherProfileId)         // was: uploadVideo(filePath, metadata)
getVideoDetails(videoId, teacherProfileId)                 // was: getVideoDetails(videoId)
updateVideoMetadata(videoId, metadata, teacherProfileId)   // was: updateVideoMetadata(videoId, metadata)
deleteVideo(videoId, teacherProfileId)                     // was: deleteVideo(videoId)
```

Changes inside each method:
- Remove `private static oauth2Client` singleton
- Remove `getOAuth2Client()` method
- Remove `getAccessToken()` method
- Each call does: `const oauth2Client = await GoogleOAuthService.getTeacherOAuth2Client(teacherProfileId)`

---

### Step 5: Modify Video Upload Controller

**File:** `backend/src/controllers/course-video.controller.ts`

**In `uploadVideo()`:**
1. After getting `teacherProfileId`, add connection check:
   ```typescript
   const status = await GoogleOAuthService.getConnectionStatus(teacherProfileId);
   if (!status.connected) {
     res.status(403).json({ success: false, message: 'Connect your YouTube account in Settings first' });
     return;
   }
   ```
2. Pass `teacherProfileId` to YouTube calls:
   ```typescript
   YouTubeService.uploadVideo(filePath, metadata, teacherProfileId)
   YouTubeService.getVideoDetails(videoId, teacherProfileId)
   ```

**Same for `updateVideo()` and `deleteVideo()`** — pass `teacherProfileId` to all YouTube service calls.

---

### Step 6: Register Routes in `app.ts`

**File:** `backend/src/app.ts`

```typescript
import googleOAuthRoutes from './routes/google-oauth.routes';
// ...
app.use('/api/auth/google', googleOAuthRoutes);
```

---

### Step 7: Environment Variables

**Add to `.env`:**
```
ENCRYPTION_KEY=<run: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">
```

**Keep:**
```
YOUTUBE_CLIENT_ID=...       # Your app's OAuth client ID (stays the same)
YOUTUBE_CLIENT_SECRET=...   # Your app's OAuth client secret (stays the same)
```

**Remove after migration:**
```
YOUTUBE_REFRESH_TOKEN=...   # No longer needed — each teacher has their own
YOUTUBE_REDIRECT_URI=...    # Hardcode in google-oauth.service.ts instead
```

**Update `youtube.config.ts`:**
- Remove `refreshToken` from config
- Remove `redirectUri` (move to google-oauth service)
- Keep only `clientId`, `clientSecret`, and scopes
- Update `validateYoutubeConfig()` to only require `clientId` and `clientSecret`

---

### Step 8: Frontend — Teacher Settings (Connect YouTube)

**File:** `frontend/app/teacher/settings/page.tsx` (create or edit)

New section "YouTube Connection":
- Calls `GET /api/auth/google/status` on mount
- If not connected: shows "Connect YouTube Account" button
  - Button opens: `window.location.href = 'http://localhost:5000/api/auth/google/connect'`
  - (Must be a full page redirect since Google OAuth requires it)
- If connected: shows "Connected as teacher@gmail.com" with a "Disconnect" button
  - Disconnect calls `POST /api/auth/google/disconnect`

**NEW: `frontend/lib/google-oauth.ts`**
```typescript
export const googleOAuthApi = {
  getStatus: () => apiClient.get('/auth/google/status'),
  disconnect: () => apiClient.post('/auth/google/disconnect'),
  getConnectUrl: () => `${API_URL}/auth/google/connect`,
};
```

---

### Step 9: Frontend — Video Upload Guard

**File:** `frontend/components/VideoUploadForm.tsx`

Before rendering the upload form:
1. Fetch `googleOAuthApi.getStatus()`
2. If `connected === false`, render a warning banner instead of the form:
   ```
   "Connect your YouTube account to upload videos"
   [Go to Settings →]
   ```
3. If connected, show the upload form as normal

---

### Step 10: Cleanup

| Action | File |
|--------|------|
| Delete | `backend/scripts/get-youtube-token.ts` |
| Remove | `YOUTUBE_REFRESH_TOKEN` from `.env` |
| Remove | `YOUTUBE_REDIRECT_URI` from `.env` |
| Remove | `refreshToken` from `youtube.config.ts` |
| Update | `validateYoutubeConfig()` — only require `clientId` + `clientSecret` |

---

## Complete File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `database/mysql_schema.sql` | **Edit** | Add `teacher_google_tokens` table |
| `backend/src/utils/encryption.utils.ts` | **New** | AES-256-GCM encrypt/decrypt for tokens |
| `backend/src/services/google-oauth.service.ts` | **New** | Per-teacher OAuth flow + token management |
| `backend/src/controllers/google-oauth.controller.ts` | **New** | Connect/callback/status/disconnect endpoints |
| `backend/src/routes/google-oauth.routes.ts` | **New** | Route definitions |
| `backend/src/services/youtube.service.ts` | **Edit** | Use per-teacher OAuth client instead of singleton |
| `backend/src/config/youtube.config.ts` | **Edit** | Remove `refreshToken`, keep app credentials |
| `backend/src/controllers/course-video.controller.ts` | **Edit** | Add connection check + pass `teacherProfileId` |
| `backend/src/app.ts` | **Edit** | Register `/api/auth/google` routes |
| `backend/.env` | **Edit** | Add `ENCRYPTION_KEY`, remove `YOUTUBE_REFRESH_TOKEN` |
| `frontend/lib/google-oauth.ts` | **New** | API client for Google connection status/disconnect |
| `frontend/app/teacher/settings/page.tsx` | **New/Edit** | YouTube connection UI in settings |
| `frontend/components/VideoUploadForm.tsx` | **Edit** | Guard: require YouTube connection before upload |
| `backend/scripts/get-youtube-token.ts` | **Delete** | No longer needed |

---

## OAuth Flow (Visual)

```
 Teacher                    Your Backend                 Google
    |                            |                          |
    |-- Click "Connect YouTube"->|                          |
    |                            |-- Generate auth URL ---->|
    |<-- Redirect to Google -----|                          |
    |                            |                          |
    |------- Grant access --------------------------------->|
    |                            |                          |
    |                            |<--- Redirect with code --|
    |                            |                          |
    |                            |-- Exchange code -------->|
    |                            |<-- tokens:               |
    |                            |    refresh (permanent)   |
    |                            |    access  (~1 hour)     |
    |                            |                          |
    |                            |-- Encrypt & save to DB   |
    |                            |   teacher_google_tokens   |
    |                            |                          |
    |<-- Redirect to settings ---|                          |
    |   "Connected as X@gmail"   |                          |
    |                            |                          |
    |-- Upload video ----------->|                          |
    |                            |-- Load teacher's tokens  |
    |                            |-- If access expired:     |
    |                            |   use refresh token ---->|
    |                            |   <-- new access token   |
    |                            |-- Upload to YouTube ---->|
    |                            |   (teacher's channel)    |
    |<-- Video uploaded ---------|                          |
```

---

## Security Notes

- **Encrypt tokens at rest** — refresh tokens are permanent and powerful; never store plaintext in DB
- **State parameter** — include teacher ID + random nonce in OAuth `state` to prevent CSRF
- **HTTPS in production** — Google requires HTTPS for callback URLs in production
- **Auto-refresh** — access tokens expire in ~1 hour; transparently refresh using the permanent refresh token
- **Scope minimization** — only `youtube.upload` + `youtube` + `userinfo.email`
- **Revocation on disconnect** — call Google's revoke endpoint to invalidate the refresh token + delete from DB
- **Google verification** — app needs Google verification to go beyond 100 users (submit consent screen for review)
