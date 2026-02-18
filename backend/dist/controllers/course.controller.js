"use strict";
// src/controllers/course.controller.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseController = void 0;
const course_service_1 = require("../services/course.service");
const auth_service_1 = require("../services/auth.service");
const firebase_config_1 = require("../config/firebase.config");
const uuid_1 = require("uuid");
class CourseController {
    // ========== COURSES ==========
    // Get all courses for logged-in teacher
    static async getAllCourses(req, res) {
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
            const courses = await course_service_1.CourseService.getCoursesByTeacher(userWithRole.teacher_profile_id);
            res.status(200).json({
                success: true,
                message: 'Courses retrieved successfully',
                data: {
                    courses,
                    count: courses.length,
                },
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch courses',
            });
        }
    }
    // Get single course by ID
    static async getCourseById(req, res) {
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
            const course = await course_service_1.CourseService.getCourseById(id, userWithRole.teacher_profile_id);
            if (!course) {
                res.status(404).json({
                    success: false,
                    message: 'Course not found',
                });
                return;
            }
            res.status(200).json({
                success: true,
                message: 'Course retrieved successfully',
                data: { course },
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch course',
            });
        }
    }
    // Create new course
    static async createCourse(req, res) {
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
            // Validate required fields
            if (!data.title || !data.title.trim()) {
                res.status(400).json({
                    success: false,
                    message: 'Course title is required',
                });
                return;
            }
            const course = await course_service_1.CourseService.createCourse(data, userWithRole.teacher_profile_id);
            res.status(201).json({
                success: true,
                message: 'Course created successfully',
                data: { course },
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to create course',
            });
        }
    }
    // Update course
    static async updateCourse(req, res) {
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
            const course = await course_service_1.CourseService.updateCourse(id, userWithRole.teacher_profile_id, data);
            res.status(200).json({
                success: true,
                message: 'Course updated successfully',
                data: { course },
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to update course',
            });
        }
    }
    // Delete course
    static async deleteCourse(req, res) {
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
            await course_service_1.CourseService.deleteCourse(id, userWithRole.teacher_profile_id);
            res.status(200).json({
                success: true,
                message: 'Course deleted successfully',
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to delete course',
            });
        }
    }
    // ========== MODULES ==========
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
            // Get teacher profile
            const userWithRole = await auth_service_1.AuthService.getUserWithRole(userId);
            if (!userWithRole || !userWithRole.teacher_profile_id) {
                res.status(403).json({
                    success: false,
                    message: 'Teacher profile not found',
                });
                return;
            }
            const modules = await course_service_1.CourseService.getModulesByCourse(courseId, userWithRole.teacher_profile_id);
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
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch modules',
            });
        }
    }
    // Get single module by ID
    static async getModuleById(req, res) {
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
            const module = await course_service_1.CourseService.getModuleById(id, userWithRole.teacher_profile_id);
            if (!module) {
                res.status(404).json({
                    success: false,
                    message: 'Module not found',
                });
                return;
            }
            res.status(200).json({
                success: true,
                message: 'Module retrieved successfully',
                data: { module },
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch module',
            });
        }
    }
    // Create new module
    static async createModule(req, res) {
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
            // Validate required fields
            if (!data.course_id || !data.title || !data.title.trim()) {
                res.status(400).json({
                    success: false,
                    message: 'Course ID and module title are required',
                });
                return;
            }
            const module = await course_service_1.CourseService.createModule(data, userWithRole.teacher_profile_id);
            res.status(201).json({
                success: true,
                message: 'Module created successfully',
                data: { module },
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to create module',
            });
        }
    }
    // Update module
    static async updateModule(req, res) {
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
            const module = await course_service_1.CourseService.updateModule(id, userWithRole.teacher_profile_id, data);
            res.status(200).json({
                success: true,
                message: 'Module updated successfully',
                data: { module },
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to update module',
            });
        }
    }
    // Delete module
    static async deleteModule(req, res) {
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
            await course_service_1.CourseService.deleteModule(id, userWithRole.teacher_profile_id);
            res.status(200).json({
                success: true,
                message: 'Module deleted successfully',
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to delete module',
            });
        }
    }
    // Reorder modules
    static async reorderModules(req, res) {
        try {
            const { id: courseId } = req.params;
            const { modules } = req.body; // Array of { id: string, order_index: number }
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
            await course_service_1.CourseService.reorderModules(courseId, userWithRole.teacher_profile_id, modules);
            res.status(200).json({
                success: true,
                message: 'Modules reordered successfully',
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to reorder modules',
            });
        }
    }
    // ========================================
    // ADD TO: src/controllers/course.controller.ts
    // ========================================
    // Get all enrolled students for a course
    static async getEnrolledStudents(req, res) {
        try {
            const { id: courseId } = req.params;
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
            const students = await course_service_1.CourseService.getEnrolledStudents(courseId, userWithRole.teacher_profile_id);
            res.status(200).json({
                success: true,
                message: 'Enrolled students retrieved successfully',
                data: {
                    students,
                    count: students.length,
                },
            });
        }
        catch (error) {
            res.status(error.message.includes('unauthorized') ? 403 : 500).json({
                success: false,
                message: error.message || 'Failed to fetch enrolled students',
            });
        }
    }
    // Get enrollment statistics for a course
    static async getEnrollmentStats(req, res) {
        try {
            const { id: courseId } = req.params;
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
            const stats = await course_service_1.CourseService.getEnrollmentStats(courseId, userWithRole.teacher_profile_id);
            res.status(200).json({
                success: true,
                message: 'Enrollment statistics retrieved successfully',
                data: { stats },
            });
        }
        catch (error) {
            res.status(error.message.includes('unauthorized') ? 403 : 500).json({
                success: false,
                message: error.message || 'Failed to fetch enrollment statistics',
            });
        }
    }
    // Get single enrolled student details
    static async getEnrolledStudentById(req, res) {
        try {
            const { id: courseId, studentId } = req.params;
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
            const student = await course_service_1.CourseService.getEnrolledStudentById(courseId, studentId, userWithRole.teacher_profile_id);
            res.status(200).json({
                success: true,
                message: 'Student details retrieved successfully',
                data: { student },
            });
        }
        catch (error) {
            res.status(error.message.includes('not found') ? 404 : 500).json({
                success: false,
                message: error.message || 'Failed to fetch student details',
            });
        }
    }
    // Unenroll student from course
    static async unenrollStudent(req, res) {
        try {
            const { id: courseId, studentId } = req.params;
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
            await course_service_1.CourseService.unenrollStudent(courseId, studentId, userWithRole.teacher_profile_id);
            res.status(200).json({
                success: true,
                message: 'Student unenrolled successfully',
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to unenroll student',
            });
        }
    }
    // POST /api/courses/thumbnail — upload a course thumbnail to Firebase Storage
    static async uploadThumbnail(req, res) {
        try {
            if (!req.file) {
                res.status(400).json({ success: false, message: 'No image file provided' });
                return;
            }
            const ext = req.file.originalname.split('.').pop()?.toLowerCase() || 'jpg';
            const fileName = `course-thumbnails/${(0, uuid_1.v4)()}.${ext}`;
            const file = firebase_config_1.storageBucket.file(fileName);
            await file.save(req.file.buffer, {
                metadata: { contentType: req.file.mimetype },
            });
            await file.makePublic();
            const publicUrl = `https://storage.googleapis.com/${firebase_config_1.storageBucket.name}/${fileName}`;
            res.status(200).json({ success: true, data: { thumbnail_url: publicUrl } });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message || 'Failed to upload thumbnail' });
        }
    }
}
exports.CourseController = CourseController;
//# sourceMappingURL=course.controller.js.map