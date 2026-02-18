"use strict";
// src/routes/google-oauth.routes.ts
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const google_oauth_controller_1 = require("../controllers/google-oauth.controller");
const router = (0, express_1.Router)();
// GET /api/auth/google/connect — redirects teacher to Google consent screen
router.get('/connect', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('teacher'), google_oauth_controller_1.GoogleOAuthController.connect);
// GET /api/auth/google/callback — Google redirects here after teacher grants access
// Note: no authenticate middleware here because this is a browser redirect from Google
router.get('/callback', google_oauth_controller_1.GoogleOAuthController.callback);
// GET /api/auth/google/status — returns { connected, email? }
router.get('/status', auth_middleware_1.authenticate, google_oauth_controller_1.GoogleOAuthController.getStatus);
// POST /api/auth/google/disconnect — revokes token + removes from DB
router.post('/disconnect', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('teacher'), google_oauth_controller_1.GoogleOAuthController.disconnect);
exports.default = router;
//# sourceMappingURL=google-oauth.routes.js.map