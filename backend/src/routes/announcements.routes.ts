// src/routes/announcements.routes.ts

import { Router } from 'express';
import { AnnouncementsController } from '../controllers/announcements.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/announcements
// Teacher: their own announcements. Student: their teacher's announcements.
router.get('/', AnnouncementsController.getAnnouncements);

// POST /api/announcements  (teacher only — enforced in controller)
router.post('/', AnnouncementsController.createAnnouncement);

// PUT /api/announcements/:id  (teacher only)
router.put('/:id', AnnouncementsController.updateAnnouncement);

// DELETE /api/announcements/:id  (teacher only)
router.delete('/:id', AnnouncementsController.deleteAnnouncement);

export default router;
