// src/controllers/dashboard.controller.ts

import { Request, Response } from 'express';
import { DashboardService } from '../services/dashboard.service';
import { AuthService } from '../services/auth.service';

export class DashboardController {
  // GET /api/dashboard
  static async getDashboard(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const userWithRole = await AuthService.getUserWithRole(userId);
      if (!userWithRole) {
        res.status(401).json({ success: false, message: 'User not found' });
        return;
      }

      if (userWithRole.role === 'teacher') {
        if (!userWithRole.teacher_profile_id) {
          res.status(403).json({ success: false, message: 'Teacher profile not found' });
          return;
        }
        const data = await DashboardService.getTeacherDashboard(userWithRole.teacher_profile_id);
        res.status(200).json({ success: true, data });
      } else {
        const data = await DashboardService.getStudentDashboard(userId);
        res.status(200).json({ success: true, data });
      }
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to load dashboard' });
    }
  }
}
