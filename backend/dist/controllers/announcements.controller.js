"use strict";
// src/controllers/announcements.controller.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnnouncementsController = void 0;
const announcements_service_1 = require("../services/announcements.service");
const auth_service_1 = require("../services/auth.service");
class AnnouncementsController {
    // GET /api/announcements
    // Teacher → returns their own announcements.
    // Student → returns their teacher's announcements.
    static async getAnnouncements(req, res) {
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
            let announcements;
            if (userWithRole.role === 'teacher') {
                if (!userWithRole.teacher_profile_id) {
                    res.status(403).json({ success: false, message: 'Teacher profile not found' });
                    return;
                }
                announcements = await announcements_service_1.AnnouncementsService.getByTeacher(userWithRole.teacher_profile_id);
            }
            else {
                // Student
                announcements = await announcements_service_1.AnnouncementsService.getForStudent(userId);
            }
            res.status(200).json({
                success: true,
                message: 'Announcements retrieved successfully',
                data: { announcements, count: announcements.length },
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch announcements',
            });
        }
    }
    // POST /api/announcements — teacher only
    static async createAnnouncement(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }
            const userWithRole = await auth_service_1.AuthService.getUserWithRole(userId);
            if (!userWithRole || !userWithRole.teacher_profile_id) {
                res.status(403).json({ success: false, message: 'Only teachers can create announcements' });
                return;
            }
            const { title, description } = req.body;
            if (!title || !title.trim()) {
                res.status(400).json({ success: false, message: 'Title is required' });
                return;
            }
            if (!description || !description.trim()) {
                res.status(400).json({ success: false, message: 'Description is required' });
                return;
            }
            const announcement = await announcements_service_1.AnnouncementsService.create({ title, description }, userWithRole.teacher_profile_id);
            res.status(201).json({
                success: true,
                message: 'Announcement created successfully',
                data: { announcement },
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to create announcement',
            });
        }
    }
    // PUT /api/announcements/:id — teacher only
    static async updateAnnouncement(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }
            const userWithRole = await auth_service_1.AuthService.getUserWithRole(userId);
            if (!userWithRole || !userWithRole.teacher_profile_id) {
                res.status(403).json({ success: false, message: 'Only teachers can edit announcements' });
                return;
            }
            const { id } = req.params;
            const { title, description } = req.body;
            const announcement = await announcements_service_1.AnnouncementsService.update(id, userWithRole.teacher_profile_id, { title, description });
            res.status(200).json({
                success: true,
                message: 'Announcement updated successfully',
                data: { announcement },
            });
        }
        catch (error) {
            const status = error.message.includes('not found') ? 404 : 400;
            res.status(status).json({
                success: false,
                message: error.message || 'Failed to update announcement',
            });
        }
    }
    // DELETE /api/announcements/:id — teacher only
    static async deleteAnnouncement(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }
            const userWithRole = await auth_service_1.AuthService.getUserWithRole(userId);
            if (!userWithRole || !userWithRole.teacher_profile_id) {
                res.status(403).json({ success: false, message: 'Only teachers can delete announcements' });
                return;
            }
            const { id } = req.params;
            await announcements_service_1.AnnouncementsService.delete(id, userWithRole.teacher_profile_id);
            res.status(200).json({
                success: true,
                message: 'Announcement deleted successfully',
            });
        }
        catch (error) {
            const status = error.message.includes('not found') ? 404 : 400;
            res.status(status).json({
                success: false,
                message: error.message || 'Failed to delete announcement',
            });
        }
    }
}
exports.AnnouncementsController = AnnouncementsController;
//# sourceMappingURL=announcements.controller.js.map