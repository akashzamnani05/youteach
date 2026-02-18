"use strict";
// src/routes/auth.routes.ts
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const router = (0, express_1.Router)();
// POST /api/auth/login - Login (both teacher and student)
router.post('/login', validation_middleware_1.validateLogin, validation_middleware_1.handleValidationErrors, auth_controller_1.AuthController.login);
// POST /api/auth/signup/teacher - Teacher signup
router.post('/signup/teacher', validation_middleware_1.validateTeacherSignup, validation_middleware_1.handleValidationErrors, auth_controller_1.AuthController.signupTeacher);
// DISABLED: Public student signup
// Students can only be created by teachers now
// router.post(
//   '/signup/student',
//   validateStudentSignup,
//   handleValidationErrors,
//   AuthController.signupStudent
// );
// POST /api/auth/create-student - Teacher creates a student (protected)
// router.post(
//   '/create-student',
//   authenticate,
//   authorize('teacher'),
//   validateStudentSignup,
//   handleValidationErrors,
//   AuthController.createStudent
// );
// POST /api/auth/refresh - Refresh access token
router.post('/refresh', auth_middleware_1.verifyRefresh, auth_controller_1.AuthController.refreshToken);
// GET /api/auth/me - Get current user
router.get('/me', auth_middleware_1.authenticate, auth_controller_1.AuthController.getCurrentUser);
// POST /api/auth/logout - Logout
router.post('/logout', auth_controller_1.AuthController.logout);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map