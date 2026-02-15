// src/routes/webinar.routes.ts

import { Router } from 'express';
import { WebinarController } from '../controllers/webinar.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import {
  validateCreateWebinar,
  validateUpdateWebinar,
  handleValidationErrors,
} from '../middleware/validation.middleware';

const router = Router();

// All webinar routes require teacher authentication
router.use(authenticate);
router.use(authorize('teacher'));

// GET /api/webinars - Get all webinars for logged-in teacher
router.get('/', WebinarController.getAllWebinars);

// GET /api/webinars/upcoming - Get upcoming webinars
router.get('/upcoming', WebinarController.getUpcomingWebinars);

// GET /api/webinars/:id - Get single webinar by ID
router.get('/:id', WebinarController.getWebinarById);

// GET /api/webinars/:id/students - Get registered students for a webinar
router.get('/:id/students', WebinarController.getRegisteredStudents);

// POST /api/webinars - Create new webinar
router.post(
  '/',
  validateCreateWebinar,
  handleValidationErrors,
  WebinarController.createWebinar
);

// PUT /api/webinars/:id - Update webinar
router.put(
  '/:id',
  validateUpdateWebinar,
  handleValidationErrors,
  WebinarController.updateWebinar
);

// DELETE /api/webinars/:id - Delete webinar
router.delete('/:id', WebinarController.deleteWebinar);

export default router;