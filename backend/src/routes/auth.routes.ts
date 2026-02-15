// src/routes/auth.routes.ts

import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate, verifyRefresh } from '../middleware/auth.middleware';
import {
  validateLogin,
  validateTeacherSignup,
  handleValidationErrors,
  
} from '../middleware/validation.middleware';

const router = Router();

// POST /api/auth/login - Login (both teacher and student)
router.post(
  '/login',
  validateLogin,
  handleValidationErrors,
  AuthController.login
);

// POST /api/auth/signup/teacher - Teacher signup
router.post(
  '/signup/teacher',
  validateTeacherSignup,
  handleValidationErrors,
  AuthController.signupTeacher
);

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
router.post('/refresh', verifyRefresh, AuthController.refreshToken);

// GET /api/auth/me - Get current user
router.get('/me', authenticate, AuthController.getCurrentUser);

// POST /api/auth/logout - Logout
router.post('/logout', AuthController.logout);

export default router;