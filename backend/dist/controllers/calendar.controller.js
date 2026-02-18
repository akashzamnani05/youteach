"use strict";
// src/controllers/calendar.controller.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalendarController = void 0;
const calendar_service_1 = require("../services/calendar.service");
const auth_service_1 = require("../services/auth.service");
class CalendarController {
    // GET /api/calendar/events?start=YYYY-MM-DD&end=YYYY-MM-DD
    static async getEvents(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }
            const { start, end } = req.query;
            if (!start || !end) {
                res.status(400).json({ success: false, message: 'start and end query params are required (YYYY-MM-DD)' });
                return;
            }
            const userWithRole = await auth_service_1.AuthService.getUserWithRole(userId);
            if (!userWithRole) {
                res.status(401).json({ success: false, message: 'User not found' });
                return;
            }
            let events;
            if (userWithRole.role === 'teacher') {
                if (!userWithRole.teacher_profile_id) {
                    res.status(403).json({ success: false, message: 'Teacher profile not found' });
                    return;
                }
                events = await calendar_service_1.CalendarService.getTeacherEvents(userWithRole.teacher_profile_id, start, end);
            }
            else {
                events = await calendar_service_1.CalendarService.getStudentEvents(userId, start, end);
            }
            res.status(200).json({ success: true, message: 'Events retrieved', data: { events } });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message || 'Failed to get events' });
        }
    }
}
exports.CalendarController = CalendarController;
//# sourceMappingURL=calendar.controller.js.map