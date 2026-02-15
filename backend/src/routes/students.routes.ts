// src/routes/students.routes.ts

import { Router } from 'express';
import { StudentsController } from '../controllers/students.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import {
  validateStudentSignup,
  handleValidationErrors,
} from '../middleware/validation.middleware';

const router = Router();

// All routes require teacher authentication
router.use(authenticate);
router.use(authorize('teacher'));

// GET /api/students - Get all students for logged-in teacher
router.get('/', StudentsController.getStudents);

// GET /api/students/:id - Get single student by ID
router.get('/:id', StudentsController.getStudentById);



// POST /api/students - Create new student
router.post(
  '/',
  validateStudentSignup,
  handleValidationErrors,
  StudentsController.createStudent
);

// DELETE /api/students/:id - Delete student
router.delete('/:id', StudentsController.deleteStudent);

export default router;