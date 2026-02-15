// src/routes/student-course-content.routes.ts

import { Router } from 'express';
import { StudentCourseContentController } from '../controllers/student-course-content.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all modules of a course
router.get(
  '/course/:courseId/modules',
  StudentCourseContentController.getModulesByCourse
);

// Get all content of a module
router.get(
  '/module/:moduleId/content',
  StudentCourseContentController.getContentByModule
);

// Get full course content (modules + content organized)
router.get(
  '/course/:courseId/content',
  StudentCourseContentController.getAllContentByCourse
);

export default router;
