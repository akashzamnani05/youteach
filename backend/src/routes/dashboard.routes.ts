// src/routes/dashboard.routes.ts

import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { DashboardController } from '../controllers/dashboard.controller';

const router = Router();

router.use(authenticate);

// GET /api/dashboard
router.get('/', DashboardController.getDashboard);

export default router;
