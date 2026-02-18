"use strict";
// src/controllers/student-course-content.controller.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentCourseContentController = void 0;
const student_course_content_service_1 = require("../services/student-course-content.service");
const auth_service_1 = require("../services/auth.service");
class StudentCourseContentController {
    // Get all modules for a course
    static async getModulesByCourse(req, res) {
        try {
            const { courseId } = req.params;
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
            const modules = await student_course_content_service_1.StudentCourseContentService.getModulesByCourse(courseId, userWithRole.student_profile_id);
            res.status(200).json({
                success: true,
                message: 'Modules retrieved successfully',
                data: {
                    modules,
                    count: modules.length,
                },
            });
        }
        catch (error) {
            res.status(error.message.includes('must be enrolled') ? 403 : 500).json({
                success: false,
                message: error.message || 'Failed to fetch modules',
            });
        }
    }
    // Get all content for a module
    static async getContentByModule(req, res) {
        try {
            const { moduleId } = req.params;
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
            const content = await student_course_content_service_1.StudentCourseContentService.getContentByModule(moduleId, userWithRole.student_profile_id);
            res.status(200).json({
                success: true,
                message: 'Content retrieved successfully',
                data: {
                    content,
                    count: content.length,
                },
            });
        }
        catch (error) {
            res.status(error.message.includes('must be enrolled') ? 403 : 500).json({
                success: false,
                message: error.message || 'Failed to fetch content',
            });
        }
    }
    // Get all content organized by modules for a course
    static async getAllContentByCourse(req, res) {
        try {
            const { courseId } = req.params;
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
            const modulesWithContent = await student_course_content_service_1.StudentCourseContentService.getAllContentByCourse(courseId, userWithRole.student_profile_id);
            res.status(200).json({
                success: true,
                message: 'Course content retrieved successfully',
                data: {
                    modules: modulesWithContent,
                    count: modulesWithContent.length,
                },
            });
        }
        catch (error) {
            res.status(error.message.includes('must be enrolled') ? 403 : 500).json({
                success: false,
                message: error.message || 'Failed to fetch course content',
            });
        }
    }
}
exports.StudentCourseContentController = StudentCourseContentController;
//# sourceMappingURL=student-course-content.controller.js.map