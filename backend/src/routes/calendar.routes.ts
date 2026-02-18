// src/routes/calendar.routes.ts

import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { CalendarController } from '../controllers/calendar.controller';

const router = Router();

router.use(authenticate);

// GET /api/calendar/events?start=YYYY-MM-DD&end=YYYY-MM-DD
router.get('/events', CalendarController.getEvents);

export default router;
