// src/routes/batch-sessions.routes.ts

import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { BatchesController } from '../controllers/batches.controller';

const router = Router();

router.use(authenticate);

// GET    /api/batch-sessions/:sessionId           — session details + attendance list
router.get('/:sessionId', BatchesController.getSessionDetails);

// DELETE /api/batch-sessions/:sessionId           — delete a session (teacher only)
router.delete('/:sessionId', BatchesController.deleteSession);

// PUT    /api/batch-sessions/:sessionId/attendance — bulk mark attendance
router.put('/:sessionId/attendance', BatchesController.markAttendance);

export default router;
