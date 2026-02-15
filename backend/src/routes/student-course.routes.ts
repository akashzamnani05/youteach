// src/routes/student-course.routes.ts

import { Router } from 'express';
import { StudentCourseController } from '../controllers/student-course.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all courses (with enrollment status)
router.get('/', StudentCourseController.getAllCourses);

// Get enrolled courses
router.get('/enrolled', StudentCourseController.getEnrolledCourses);

// Get single course by ID
router.get('/:id', StudentCourseController.getCourseById);

// Enroll in a course
router.post('/:id/enroll', StudentCourseController.enrollInCourse);

// Unenroll from a course
router.delete('/:id/enroll', StudentCourseController.unenrollFromCourse);

// Update last accessed timestamp
router.patch('/:id/last-accessed', StudentCourseController.updateLastAccessed);

// Update course progress
router.patch('/:id/progress', StudentCourseController.updateProgress);

export default router;