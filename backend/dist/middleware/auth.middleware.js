"use strict";
// src/middleware/auth.middleware.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.verifyRefresh = exports.authenticate = void 0;
const jwt_utils_1 = require("../utils/jwt.utils");
// Authenticate middleware - verifies JWT token
const authenticate = (req, res, next) => {
    try {
        // Get token from Authorization header or cookie
        const authHeader = req.headers.authorization;
        const tokenFromHeader = authHeader?.startsWith('Bearer ')
            ? authHeader.substring(7)
            : null;
        const tokenFromCookie = req.cookies?.accessToken;
        const token = tokenFromHeader || tokenFromCookie;
        if (!token) {
            res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
            return;
        }
        // Verify token
        const payload = (0, jwt_utils_1.verifyAccessToken)(token);
        if (!payload) {
            res.status(401).json({
                success: false,
                message: 'Invalid or expired token',
            });
            return;
        }
        // Attach user to request
        req.user = payload;
        next();
    }
    catch (error) {
        res.status(401).json({
            success: false,
            message: 'Authentication failed',
        });
    }
};
exports.authenticate = authenticate;
// Verify refresh token middleware
const verifyRefresh = (req, res, next) => {
    try {
        const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
        if (!refreshToken) {
            res.status(401).json({
                success: false,
                message: 'Refresh token required',
            });
            return;
        }
        const payload = (0, jwt_utils_1.verifyRefreshToken)(refreshToken);
        if (!payload) {
            res.status(401).json({
                success: false,
                message: 'Invalid or expired refresh token',
            });
            return;
        }
        req.user = payload;
        next();
    }
    catch (error) {
        res.status(401).json({
            success: false,
            message: 'Refresh token verification failed',
        });
    }
};
exports.verifyRefresh = verifyRefresh;
// Role-based authorization middleware
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
            return;
        }
        if (!roles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                message: 'Insufficient permissions',
            });
            return;
        }
        next();
    };
};
exports.authorize = authorize;
//# sourceMappingURL=auth.middleware.js.map