// src/controllers/google-oauth.controller.ts

import { Request, Response } from 'express';
import { GoogleOAuthService } from '../services/google-oauth.service';
import { AuthService } from '../services/auth.service';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

export class GoogleOAuthController {
  // GET /api/auth/google/connect
  // Redirects the teacher to the Google consent screen
  static async connect(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const userWithRole = await AuthService.getUserWithRole(userId);
      if (!userWithRole?.teacher_profile_id) {
        res.status(403).json({ success: false, message: 'Teacher profile not found' });
        return;
      }

      const authUrl = GoogleOAuthService.getAuthUrl(userWithRole.teacher_profile_id);
      res.redirect(authUrl);
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to generate auth URL' });
    }
  }

  // GET /api/auth/google/callback?code=...&state=teacherProfileId
  // Google redirects here after the teacher grants access
  static async callback(req: Request, res: Response): Promise<void> {
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

      await GoogleOAuthService.handleCallback(
        code as string,
        teacherProfileId as string
      );

      res.redirect(`${FRONTEND_URL}/teacher/settings?google=connected`);
    } catch (error: any) {
      console.error('Google OAuth callback error:', error);
      res.redirect(`${FRONTEND_URL}/teacher/settings?google=error&reason=token_exchange_failed`);
    }
  }

  // GET /api/auth/google/status
  // Returns whether the teacher's YouTube account is connected
  static async getStatus(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const userWithRole = await AuthService.getUserWithRole(userId);
      if (!userWithRole?.teacher_profile_id) {
        res.status(200).json({ success: true, data: { connected: false } });
        return;
      }

      const status = await GoogleOAuthService.getConnectionStatus(userWithRole.teacher_profile_id);
      res.status(200).json({ success: true, data: status });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to get status' });
    }
  }

  // POST /api/auth/google/disconnect
  // Revokes and removes the teacher's Google connection
  static async disconnect(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const userWithRole = await AuthService.getUserWithRole(userId);
      if (!userWithRole?.teacher_profile_id) {
        res.status(403).json({ success: false, message: 'Teacher profile not found' });
        return;
      }

      await GoogleOAuthService.disconnectGoogle(userWithRole.teacher_profile_id);
      res.status(200).json({ success: true, message: 'YouTube account disconnected' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to disconnect' });
    }
  }
}
