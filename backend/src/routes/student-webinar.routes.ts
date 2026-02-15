// src/routes/student-webinar.routes.ts

import { Router } from 'express';
import { StudentWebinarController } from '../controllers/student-webinar.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// All routes require student authentication
router.use(authenticate);
router.use(authorize('student'));

// GET /api/student-webinars - Get all webinars for logged-in student
router.get('/', StudentWebinarController.getAllWebinars);

// GET /api/student-webinars/registered - Get registered webinars
router.get('/registered', StudentWebinarController.getRegisteredWebinars);

// GET /api/student-webinars/upcoming - Get upcoming webinars
router.get('/upcoming', StudentWebinarController.getUpcomingWebinars);

// GET /api/student-webinars/:id - Get single webinar by ID
router.get('/:id', StudentWebinarController.getWebinarById);

// POST /api/student-webinars/:id/register - Register for a webinar
router.post('/:id/register', StudentWebinarController.registerForWebinar);

// DELETE /api/student-webinars/:id/unregister - Unregister from a webinar
router.delete('/:id/unregister', StudentWebinarController.unregisterFromWebinar);

export default router;