// src/routes/google-oauth.routes.ts

import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { GoogleOAuthController } from '../controllers/google-oauth.controller';

const router = Router();

// GET /api/auth/google/connect — redirects teacher to Google consent screen
router.get('/connect', authenticate, authorize('teacher'), GoogleOAuthController.connect);

// GET /api/auth/google/callback — Google redirects here after teacher grants access
// Note: no authenticate middleware here because this is a browser redirect from Google
router.get('/callback', GoogleOAuthController.callback);

// GET /api/auth/google/status — returns { connected, email? }
router.get('/status', authenticate, GoogleOAuthController.getStatus);

// POST /api/auth/google/disconnect — revokes token + removes from DB
router.post('/disconnect', authenticate, authorize('teacher'), GoogleOAuthController.disconnect);

export default router;
