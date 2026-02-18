"use strict";
// src/controllers/webinar.controller.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebinarController = void 0;
const webinar_service_1 = require("../services/webinar.service");
const auth_service_1 = require("../services/auth.service");
class WebinarController {
    // Get all webinars for logged-in teacher
    static async getAllWebinars(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                });
                return;
            }
            // Get teacher profile
            const userWithRole = await auth_service_1.AuthService.getUserWithRole(userId);
            if (!userWithRole || !userWithRole.teacher_profile_id) {
                res.status(403).json({
                    success: false,
                    message: 'Teacher profile not found',
                });
                return;
            }
            const webinars = await webinar_service_1.WebinarService.getWebinarsByTeacher(userWithRole.teacher_profile_id);
            res.status(200).json({
                success: true,
                message: 'Webinars retrieved successfully',
                data: {
                    webinars,
                    count: webinars.length,
                },
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch webinars',
            });
        }
    }
    // Get single webinar by ID
    static async getWebinarById(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                });
                return;
            }
            // Get teacher profile
            const userWithRole = await auth_service_1.AuthService.getUserWithRole(userId);
            if (!userWithRole || !userWithRole.teacher_profile_id) {
                res.status(403).json({
                    success: false,
                    message: 'Teacher profile not found',
                });
                return;
            }
            const webinar = await webinar_service_1.WebinarService.getWebinarById(id, userWithRole.teacher_profile_id);
            if (!webinar) {
                res.status(404).json({
                    success: false,
                    message: 'Webinar not found',
                });
                return;
            }
            res.status(200).json({
                success: true,
                message: 'Webinar retrieved successfully',
                data: { webinar },
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch webinar',
            });
        }
    }
    // Create new webinar
    static async createWebinar(req, res) {
        try {
            const data = req.body;
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                });
                return;
            }
            // Get teacher profile
            const userWithRole = await auth_service_1.AuthService.getUserWithRole(userId);
            if (!userWithRole || !userWithRole.teacher_profile_id) {
                res.status(403).json({
                    success: false,
                    message: 'Teacher profile not found',
                });
                return;
            }
            const webinar = await webinar_service_1.WebinarService.createWebinar(data, userWithRole.teacher_profile_id);
            res.status(201).json({
                success: true,
                message: 'Webinar created successfully',
                data: { webinar },
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to create webinar',
            });
        }
    }
    // Update webinar
    static async updateWebinar(req, res) {
        try {
            const { id } = req.params;
            const data = req.body;
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                });
                return;
            }
            // Get teacher profile
            const userWithRole = await auth_service_1.AuthService.getUserWithRole(userId);
            if (!userWithRole || !userWithRole.teacher_profile_id) {
                res.status(403).json({
                    success: false,
                    message: 'Teacher profile not found',
                });
                return;
            }
            const webinar = await webinar_service_1.WebinarService.updateWebinar(id, userWithRole.teacher_profile_id, data);
            res.status(200).json({
                success: true,
                message: 'Webinar updated successfully',
                data: { webinar },
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to update webinar',
            });
        }
    }
    // Delete webinar
    static async deleteWebinar(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                });
                return;
            }
            // Get teacher profile
            const userWithRole = await auth_service_1.AuthService.getUserWithRole(userId);
            if (!userWithRole || !userWithRole.teacher_profile_id) {
                res.status(403).json({
                    success: false,
                    message: 'Teacher profile not found',
                });
                return;
            }
            await webinar_service_1.WebinarService.deleteWebinar(id, userWithRole.teacher_profile_id);
            res.status(200).json({
                success: true,
                message: 'Webinar deleted successfully',
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to delete webinar',
            });
        }
    }
    // Get upcoming webinars
    static async getUpcomingWebinars(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                });
                return;
            }
            // Get teacher profile
            const userWithRole = await auth_service_1.AuthService.getUserWithRole(userId);
            if (!userWithRole || !userWithRole.teacher_profile_id) {
                res.status(403).json({
                    success: false,
                    message: 'Teacher profile not found',
                });
                return;
            }
            const webinars = await webinar_service_1.WebinarService.getUpcomingWebinars(userWithRole.teacher_profile_id);
            res.status(200).json({
                success: true,
                message: 'Upcoming webinars retrieved successfully',
                data: {
                    webinars,
                    count: webinars.length,
                },
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch upcoming webinars',
            });
        }
    }
    // Get registered students for a webinar
    static async getRegisteredStudents(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                });
                return;
            }
            // Get teacher profile
            const userWithRole = await auth_service_1.AuthService.getUserWithRole(userId);
            if (!userWithRole || !userWithRole.teacher_profile_id) {
                res.status(403).json({
                    success: false,
                    message: 'Teacher profile not found',
                });
                return;
            }
            const students = await webinar_service_1.WebinarService.getRegisteredStudents(id, userWithRole.teacher_profile_id);
            res.status(200).json({
                success: true,
                message: 'Registered students retrieved successfully',
                data: {
                    students,
                    count: students.length,
                },
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to fetch registered students',
            });
        }
    }
}
exports.WebinarController = WebinarController;
//# sourceMappingURL=webinar.controller.js.map