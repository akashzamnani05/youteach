"use strict";
// src/controllers/student-webinar.controller.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentWebinarController = void 0;
const student_webinar_service_1 = require("../services/student-webinar.service");
const auth_service_1 = require("../services/auth.service");
class StudentWebinarController {
    // Get all webinars for logged-in student
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
            // Get student profile
            const userWithRole = await auth_service_1.AuthService.getUserWithRole(userId);
            if (!userWithRole || !userWithRole.student_profile_id) {
                res.status(403).json({
                    success: false,
                    message: 'Student profile not found',
                });
                return;
            }
            const webinars = await student_webinar_service_1.StudentWebinarService.getWebinarsForStudent(userWithRole.student_profile_id);
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
    // Get registered webinars for logged-in student
    static async getRegisteredWebinars(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                });
                return;
            }
            // Get student profile
            const userWithRole = await auth_service_1.AuthService.getUserWithRole(userId);
            if (!userWithRole || !userWithRole.student_profile_id) {
                res.status(403).json({
                    success: false,
                    message: 'Student profile not found',
                });
                return;
            }
            const webinars = await student_webinar_service_1.StudentWebinarService.getRegisteredWebinars(userWithRole.student_profile_id);
            res.status(200).json({
                success: true,
                message: 'Registered webinars retrieved successfully',
                data: {
                    webinars,
                    count: webinars.length,
                },
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch registered webinars',
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
            // Get student profile
            const userWithRole = await auth_service_1.AuthService.getUserWithRole(userId);
            if (!userWithRole || !userWithRole.student_profile_id) {
                res.status(403).json({
                    success: false,
                    message: 'Student profile not found',
                });
                return;
            }
            const webinar = await student_webinar_service_1.StudentWebinarService.getWebinarById(id, userWithRole.student_profile_id);
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
    // Register for a webinar
    static async registerForWebinar(req, res) {
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
            // Get student profile
            const userWithRole = await auth_service_1.AuthService.getUserWithRole(userId);
            if (!userWithRole || !userWithRole.student_profile_id) {
                res.status(403).json({
                    success: false,
                    message: 'Student profile not found',
                });
                return;
            }
            const result = await student_webinar_service_1.StudentWebinarService.registerForWebinar(id, userWithRole.student_profile_id);
            res.status(200).json({
                success: true,
                message: 'Successfully registered for webinar',
                data: result,
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to register for webinar',
            });
        }
    }
    // Unregister from a webinar
    static async unregisterFromWebinar(req, res) {
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
            // Get student profile
            const userWithRole = await auth_service_1.AuthService.getUserWithRole(userId);
            if (!userWithRole || !userWithRole.student_profile_id) {
                res.status(403).json({
                    success: false,
                    message: 'Student profile not found',
                });
                return;
            }
            await student_webinar_service_1.StudentWebinarService.unregisterFromWebinar(id, userWithRole.student_profile_id);
            res.status(200).json({
                success: true,
                message: 'Successfully unregistered from webinar',
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to unregister from webinar',
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
            // Get student profile
            const userWithRole = await auth_service_1.AuthService.getUserWithRole(userId);
            if (!userWithRole || !userWithRole.student_profile_id) {
                res.status(403).json({
                    success: false,
                    message: 'Student profile not found',
                });
                return;
            }
            const webinars = await student_webinar_service_1.StudentWebinarService.getUpcomingWebinars(userWithRole.student_profile_id);
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
}
exports.StudentWebinarController = StudentWebinarController;
//# sourceMappingURL=student-webinar.controller.js.map