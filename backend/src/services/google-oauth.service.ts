// src/services/google-oauth.service.ts

import { google } from 'googleapis';
import { query, queryOne } from '../config/database';
import { encrypt, decrypt } from '../utils/encryption.utils';

const REDIRECT_URI =
  process.env.YOUTUBE_REDIRECT_URI || 'http://localhost:5001/api/auth/google/callback';

const SCOPES = [
  'https://www.googleapis.com/auth/youtube.upload',
  'https://www.googleapis.com/auth/youtube',
  'https://www.googleapis.com/auth/userinfo.email',
];

function createOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.YOUTUBE_CLIENT_ID,
    process.env.YOUTUBE_CLIENT_SECRET,
    REDIRECT_URI
  );
}

interface GoogleTokenRow {
  google_email: string;
  access_token: string;
  refresh_token: string;
  token_expiry: Date;
}

export class GoogleOAuthService {
  /**
   * Generate the Google consent URL for a teacher.
   * teacherProfileId is passed as state so the callback knows which teacher this is for.
   */
  static getAuthUrl(teacherProfileId: string): string {
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
  static async handleCallback(code: string, teacherProfileId: string): Promise<string> {
    const oauth2Client = createOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.refresh_token) {
      throw new Error(
        'No refresh token returned. The teacher may need to revoke access and reconnect.'
      );
    }

    // Fetch Google email
    oauth2Client.setCredentials(tokens);
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data } = await oauth2.userinfo.get();
    const googleEmail = data.email || '';

    // Calculate token expiry (default 1 hour if not provided)
    const expiryMs = tokens.expiry_date || Date.now() + 3600 * 1000;
    const tokenExpiry = new Date(expiryMs);

    // Encrypt both tokens before storing
    const encryptedAccess = encrypt(tokens.access_token!);
    const encryptedRefresh = encrypt(tokens.refresh_token);
    const scopesStr = SCOPES.join(' ');

    // Upsert into teacher_google_tokens
    await query(
      `INSERT INTO teacher_google_tokens
         (teacher_profile_id, google_email, access_token, refresh_token, token_expiry, scopes)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         google_email   = VALUES(google_email),
         access_token   = VALUES(access_token),
         refresh_token  = VALUES(refresh_token),
         token_expiry   = VALUES(token_expiry),
         scopes         = VALUES(scopes),
         updated_at     = CURRENT_TIMESTAMP`,
      [
        teacherProfileId,
        googleEmail,
        encryptedAccess,
        encryptedRefresh,
        tokenExpiry,
        scopesStr,
      ]
    );

    return googleEmail;
  }

  /**
   * Return a ready-to-use OAuth2 client for the given teacher.
   * Auto-refreshes the access token if it has expired.
   */
  static async getTeacherOAuth2Client(teacherProfileId: string) {
    const row = await queryOne<GoogleTokenRow>(
      `SELECT google_email, access_token, refresh_token, token_expiry
       FROM teacher_google_tokens
       WHERE teacher_profile_id = ?`,
      [teacherProfileId]
    );

    if (!row) {
      throw new Error('YouTube account not connected. Please connect in Settings.');
    }

    const refreshToken = decrypt(row.refresh_token);
    let accessToken = decrypt(row.access_token);
    let tokenExpiry = new Date(row.token_expiry);

    const oauth2Client = createOAuth2Client();

    // If access token has expired, refresh it
    if (tokenExpiry <= new Date()) {
      oauth2Client.setCredentials({ refresh_token: refreshToken });
      const { credentials } = await oauth2Client.refreshAccessToken();

      accessToken = credentials.access_token!;
      tokenExpiry = new Date(credentials.expiry_date || Date.now() + 3600 * 1000);

      // Update access token in DB
      await query(
        `UPDATE teacher_google_tokens
         SET access_token = ?, token_expiry = ?, updated_at = CURRENT_TIMESTAMP
         WHERE teacher_profile_id = ?`,
        [encrypt(accessToken), tokenExpiry, teacherProfileId]
      );
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
  static async getConnectionStatus(
    teacherProfileId: string
  ): Promise<{ connected: boolean; email?: string }> {
    const row = await queryOne<{ google_email: string }>(
      `SELECT google_email FROM teacher_google_tokens WHERE teacher_profile_id = ?`,
      [teacherProfileId]
    );

    if (!row) return { connected: false };
    return { connected: true, email: row.google_email };
  }

  /**
   * Revokes the teacher's Google token and removes the DB row.
   */
  static async disconnectGoogle(teacherProfileId: string): Promise<void> {
    const row = await queryOne<{ refresh_token: string }>(
      `SELECT refresh_token FROM teacher_google_tokens WHERE teacher_profile_id = ?`,
      [teacherProfileId]
    );

    if (row) {
      try {
        const refreshToken = decrypt(row.refresh_token);
        const oauth2Client = createOAuth2Client();
        await oauth2Client.revokeToken(refreshToken);
      } catch {
        // Revocation may fail if token is already invalid — still clean up DB
      }

      await query(
        `DELETE FROM teacher_google_tokens WHERE teacher_profile_id = ?`,
        [teacherProfileId]
      );
    }
  }
}
