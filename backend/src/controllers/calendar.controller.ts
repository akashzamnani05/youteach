// src/controllers/calendar.controller.ts

import { Request, Response } from 'express';
import { CalendarService } from '../services/calendar.service';
import { AuthService } from '../services/auth.service';

export class CalendarController {
  // GET /api/calendar/events?start=YYYY-MM-DD&end=YYYY-MM-DD
  static async getEvents(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) { res.status(401).json({ success: false, message: 'Unauthorized' }); return; }

      const { start, end } = req.query;
      if (!start || !end) {
        res.status(400).json({ success: false, message: 'start and end query params are required (YYYY-MM-DD)' });
        return;
      }

      const userWithRole = await AuthService.getUserWithRole(userId);
      if (!userWithRole) { res.status(401).json({ success: false, message: 'User not found' }); return; }

      let events;
      if (userWithRole.role === 'teacher') {
        if (!userWithRole.teacher_profile_id) {
          res.status(403).json({ success: false, message: 'Teacher profile not found' }); return;
        }
        events = await CalendarService.getTeacherEvents(
          userWithRole.teacher_profile_id,
          start as string,
          end as string
        );
      } else {
        events = await CalendarService.getStudentEvents(
          userId,
          start as string,
          end as string
        );
      }

      res.status(200).json({ success: true, message: 'Events retrieved', data: { events } });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to get events' });
    }
  }
}
