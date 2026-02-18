"use strict";
// src/controllers/google-oauth.controller.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleOAuthController = void 0;
const google_oauth_service_1 = require("../services/google-oauth.service");
const auth_service_1 = require("../services/auth.service");
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
class GoogleOAuthController {
    // GET /api/auth/google/connect
    // Redirects the teacher to the Google consent screen
    static async connect(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }
            const userWithRole = await auth_service_1.AuthService.getUserWithRole(userId);
            if (!userWithRole?.teacher_profile_id) {
                res.status(403).json({ success: false, message: 'Teacher profile not found' });
                return;
            }
            const authUrl = google_oauth_service_1.GoogleOAuthService.getAuthUrl(userWithRole.teacher_profile_id);
            res.redirect(authUrl);
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message || 'Failed to generate auth URL' });
        }
    }
    // GET /api/auth/google/callback?code=...&state=teacherProfileId
    // Google redirects here after the teacher grants access
    static async callback(req, res) {
        try {
            const { code, state: teacherProfileId, error } = req.query;
            if (error) {
                res.redirect(`${FRONTEND_URL}/teacher/settings?google=error&reason=${error}`);
                return;
            }
            if (!code || !teacherProfileId) {
                res.redirect(`${FRONTEND_URL}/teacher/settings?google=error&reason=missing_params`);
                return;
            }
            await google_oauth_service_1.GoogleOAuthService.handleCallback(code, teacherProfileId);
            res.redirect(`${FRONTEND_URL}/teacher/settings?google=connected`);
        }
        catch (error) {
            console.error('Google OAuth callback error:', error);
            res.redirect(`${FRONTEND_URL}/teacher/settings?google=error&reason=token_exchange_failed`);
        }
    }
    // GET /api/auth/google/status
    // Returns whether the teacher's YouTube account is connected
    static async getStatus(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }
            const userWithRole = await auth_service_1.AuthService.getUserWithRole(userId);
            if (!userWithRole?.teacher_profile_id) {
                res.status(200).json({ success: true, data: { connected: false } });
                return;
            }
            const status = await google_oauth_service_1.GoogleOAuthService.getConnectionStatus(userWithRole.teacher_profile_id);
            res.status(200).json({ success: true, data: status });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message || 'Failed to get status' });
        }
    }
    // POST /api/auth/google/disconnect
    // Revokes and removes the teacher's Google connection
    static async disconnect(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }
            const userWithRole = await auth_service_1.AuthService.getUserWithRole(userId);
            if (!userWithRole?.teacher_profile_id) {
                res.status(403).json({ success: false, message: 'Teacher profile not found' });
                return;
            }
            await google_oauth_service_1.GoogleOAuthService.disconnectGoogle(userWithRole.teacher_profile_id);
            res.status(200).json({ success: true, message: 'YouTube account disconnected' });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message || 'Failed to disconnect' });
        }
    }
}
exports.GoogleOAuthController = GoogleOAuthController;
//# sourceMappingURL=google-oauth.controller.js.map