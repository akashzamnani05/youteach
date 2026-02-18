"use strict";
// src/controllers/dashboard.controller.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardController = void 0;
const dashboard_service_1 = require("../services/dashboard.service");
const auth_service_1 = require("../services/auth.service");
class DashboardController {
    // GET /api/dashboard
    static async getDashboard(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }
            const userWithRole = await auth_service_1.AuthService.getUserWithRole(userId);
            if (!userWithRole) {
                res.status(401).json({ success: false, message: 'User not found' });
                return;
            }
            if (userWithRole.role === 'teacher') {
                if (!userWithRole.teacher_profile_id) {
                    res.status(403).json({ success: false, message: 'Teacher profile not found' });
                    return;
                }
                const data = await dashboard_service_1.DashboardService.getTeacherDashboard(userWithRole.teacher_profile_id);
                res.status(200).json({ success: true, data });
            }
            else {
                const data = await dashboard_service_1.DashboardService.getStudentDashboard(userId);
                res.status(200).json({ success: true, data });
            }
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message || 'Failed to load dashboard' });
        }
    }
}
exports.DashboardController = DashboardController;
//# sourceMappingURL=dashboard.controller.js.map