// src/routes/module.routes.ts

import { Router } from 'express';
import { CourseController } from '../controllers/course.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// ========== MODULE ROUTES ==========

// GET /api/modules/:id - Get single module by ID
router.get('/:id', CourseController.getModuleById);

// POST /api/modules - Create new module
router.post('/', CourseController.createModule);

// PUT /api/modules/:id - Update module
router.put('/:id', CourseController.updateModule);

// DELETE /api/modules/:id - Delete module
router.delete('/:id', CourseController.deleteModule);

export default router;