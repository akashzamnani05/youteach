"use strict";
// src/services/google-oauth.service.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleOAuthService = void 0;
const googleapis_1 = require("googleapis");
const database_1 = require("../config/database");
const encryption_utils_1 = require("../utils/encryption.utils");
const REDIRECT_URI = process.env.YOUTUBE_REDIRECT_URI || 'http://localhost:5001/api/auth/google/callback';
const SCOPES = [
    'https://www.googleapis.com/auth/youtube.upload',
    'https://www.googleapis.com/auth/youtube',
    'https://www.googleapis.com/auth/userinfo.email',
];
function createOAuth2Client() {
    return new googleapis_1.google.auth.OAuth2(process.env.YOUTUBE_CLIENT_ID, process.env.YOUTUBE_CLIENT_SECRET, REDIRECT_URI);
}
class GoogleOAuthService {
    /**
     * Generate the Google consent URL for a teacher.
     * teacherProfileId is passed as state so the callback knows which teacher this is for.
     */
    static getAuthUrl(teacherProfileId) {
        const oauth2Client = createOAuth2Client();
        return oauth2Client.generateAuthUrl({
            access_type: 'offline',
            prompt: 'consent', // always get refresh token
            scope: SCOPES,
            state: teacherProfileId,
        });
    }
    /**
     * Exchange the auth code for tokens and save them to the DB.
     * Called from the OAuth callback endpoint.
     */
    static async handleCallback(code, teacherProfileId) {
        const oauth2Client = createOAuth2Client();
        const { tokens } = await oauth2Client.getToken(code);
        if (!tokens.refresh_token) {
            throw new Error('No refresh token returned. The teacher may need to revoke access and reconnect.');
        }
        // Fetch Google email
        oauth2Client.setCredentials(tokens);
        const oauth2 = googleapis_1.google.oauth2({ version: 'v2', auth: oauth2Client });
        const { data } = await oauth2.userinfo.get();
        const googleEmail = data.email || '';
        // Calculate token expiry (default 1 hour if not provided)
        const expiryMs = tokens.expiry_date || Date.now() + 3600 * 1000;
        const tokenExpiry = new Date(expiryMs);
        // Encrypt both tokens before storing
        const encryptedAccess = (0, encryption_utils_1.encrypt)(tokens.access_token);
        const encryptedRefresh = (0, encryption_utils_1.encrypt)(tokens.refresh_token);
        const scopesStr = SCOPES.join(' ');
        // Upsert into teacher_google_tokens
        await (0, database_1.query)(`INSERT INTO teacher_google_tokens
         (teacher_profile_id, google_email, access_token, refresh_token, token_expiry, scopes)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         google_email   = VALUES(google_email),
         access_token   = VALUES(access_token),
         refresh_token  = VALUES(refresh_token),
         token_expiry   = VALUES(token_expiry),
         scopes         = VALUES(scopes),
         updated_at     = CURRENT_TIMESTAMP`, [
            teacherProfileId,
            googleEmail,
            encryptedAccess,
            encryptedRefresh,
            tokenExpiry,
            scopesStr,
        ]);
        return googleEmail;
    }
    /**
     * Return a ready-to-use OAuth2 client for the given teacher.
     * Auto-refreshes the access token if it has expired.
     */
    static async getTeacherOAuth2Client(teacherProfileId) {
        const row = await (0, database_1.queryOne)(`SELECT google_email, access_token, refresh_token, token_expiry
       FROM teacher_google_tokens
       WHERE teacher_profile_id = ?`, [teacherProfileId]);
        if (!row) {
            throw new Error('YouTube account not connected. Please connect in Settings.');
        }
        const refreshToken = (0, encryption_utils_1.decrypt)(row.refresh_token);
        let accessToken = (0, encryption_utils_1.decrypt)(row.access_token);
        let tokenExpiry = new Date(row.token_expiry);
        const oauth2Client = createOAuth2Client();
        // If access token has expired, refresh it
        if (tokenExpiry <= new Date()) {
            oauth2Client.setCredentials({ refresh_token: refreshToken });
            const { credentials } = await oauth2Client.refreshAccessToken();
            accessToken = credentials.access_token;
            tokenExpiry = new Date(credentials.expiry_date || Date.now() + 3600 * 1000);
            // Update access token in DB
            await (0, database_1.query)(`UPDATE teacher_google_tokens
         SET access_token = ?, token_expiry = ?, updated_at = CURRENT_TIMESTAMP
         WHERE teacher_profile_id = ?`, [(0, encryption_utils_1.encrypt)(accessToken), tokenExpiry, teacherProfileId]);
        }
        oauth2Client.setCredentials({
            access_token: accessToken,
            refresh_token: refreshToken,
        });
        return oauth2Client;
    }
    /**
     * Returns whether a teacher has connected their YouTube account.
     */
    static async getConnectionStatus(teacherProfileId) {
        const row = await (0, database_1.queryOne)(`SELECT google_email FROM teacher_google_tokens WHERE teacher_profile_id = ?`, [teacherProfileId]);
        if (!row)
            return { connected: false };
        return { connected: true, email: row.google_email };
    }
    /**
     * Revokes the teacher's Google token and removes the DB row.
     */
    static async disconnectGoogle(teacherProfileId) {
        const row = await (0, database_1.queryOne)(`SELECT refresh_token FROM teacher_google_tokens WHERE teacher_profile_id = ?`, [teacherProfileId]);
        if (row) {
            try {
                const refreshToken = (0, encryption_utils_1.decrypt)(row.refresh_token);
                const oauth2Client = createOAuth2Client();
                await oauth2Client.revokeToken(refreshToken);
            }
            catch {
                // Revocation may fail if token is already invalid — still clean up DB
            }
            await (0, database_1.query)(`DELETE FROM teacher_google_tokens WHERE teacher_profile_id = ?`, [teacherProfileId]);
        }
    }
}
exports.GoogleOAuthService = GoogleOAuthService;
//# sourceMappingURL=google-oauth.service.js.map