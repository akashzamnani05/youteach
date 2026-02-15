// src/routes/course.routes.ts

import { Router } from 'express';
import { CourseController } from '../controllers/course.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// ========== COURSE ROUTES ==========

// GET /api/courses - Get all courses for logged-in teacher
router.get('/', CourseController.getAllCourses);

// GET /api/courses/:courseId/modules - Get all modules for a course
router.get('/:courseId/modules', CourseController.getModulesByCourse);

// GET /api/courses/:id - Get single course by ID
router.get('/:id', CourseController.getCourseById);

// POST /api/courses - Create new course
router.post('/', CourseController.createCourse);

// PUT /api/courses/:id - Update course
router.put('/:id', CourseController.updateCourse);

// DELETE /api/courses/:id - Delete course
router.delete('/:id', CourseController.deleteCourse);
// Reorder modules
router.put('/:id/reorder-modules', CourseController.reorderModules);



// ========================================
// ADD TO: src/routes/course.routes.ts
// ========================================

// Get all enrolled students for a course
router.get('/:id/students', CourseController.getEnrolledStudents);

// Get enrollment statistics for a course
router.get('/:id/stats', CourseController.getEnrollmentStats);

// Get single enrolled student details
router.get('/:id/students/:studentId', CourseController.getEnrolledStudentById);

// Unenroll student from course (teacher action)
router.delete('/:id/students/:studentId', CourseController.unenrollStudent);

export default router;