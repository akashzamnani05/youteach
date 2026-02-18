export declare class GoogleOAuthService {
    /**
     * Generate the Google consent URL for a teacher.
     * teacherProfileId is passed as state so the callback knows which teacher this is for.
     */
    static getAuthUrl(teacherProfileId: string): string;
    /**
     * Exchange the auth code for tokens and save them to the DB.
     * Called from the OAuth callback endpoint.
     */
    static handleCallback(code: string, teacherProfileId: string): Promise<string>;
    /**
     * Return a ready-to-use OAuth2 client for the given teacher.
     * Auto-refreshes the access token if it has expired.
     */
    static getTeacherOAuth2Client(teacherProfileId: string): Promise<import("google-auth-library").OAuth2Client>;
    /**
     * Returns whether a teacher has connected their YouTube account.
     */
    static getConnectionStatus(teacherProfileId: string): Promise<{
        connected: boolean;
        email?: string;
    }>;
    /**
     * Revokes the teacher's Google token and removes the DB row.
     */
    static disconnectGoogle(teacherProfileId: string): Promise<void>;
}
//# sourceMappingURL=google-oauth.service.d.ts.map