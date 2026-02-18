"use strict";
// src/controllers/student-course.controller.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentCourseController = void 0;
const student_course_service_1 = require("../services/student-course.service");
const auth_service_1 = require("../services/auth.service");
class StudentCourseController {
    // Get all courses for logged-in student
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
            // Get student profile
            const userWithRole = await auth_service_1.AuthService.getUserWithRole(userId);
            if (!userWithRole || !userWithRole.student_profile_id) {
                res.status(403).json({
                    success: false,
                    message: 'Student profile not found',
                });
                return;
            }
            const courses = await student_course_service_1.StudentCourseService.getAllCoursesForStudent(userWithRole.student_profile_id);
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
    // Get enrolled courses for logged-in student
    static async getEnrolledCourses(req, res) {
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
            const courses = await student_course_service_1.StudentCourseService.getEnrolledCourses(userWithRole.student_profile_id);
            res.status(200).json({
                success: true,
                message: 'Enrolled courses retrieved successfully',
                data: {
                    courses,
                    count: courses.length,
                },
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch enrolled courses',
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
            // Get student profile
            const userWithRole = await auth_service_1.AuthService.getUserWithRole(userId);
            if (!userWithRole || !userWithRole.student_profile_id) {
                res.status(403).json({
                    success: false,
                    message: 'Student profile not found',
                });
                return;
            }
            const course = await student_course_service_1.StudentCourseService.getCourseById(id, userWithRole.student_profile_id);
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
    // Enroll in a course
    static async enrollInCourse(req, res) {
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
            const result = await student_course_service_1.StudentCourseService.enrollInCourse(id, userWithRole.student_profile_id);
            res.status(200).json({
                success: true,
                message: 'Successfully enrolled in course',
                data: result,
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to enroll in course',
            });
        }
    }
    // Unenroll from a course
    static async unenrollFromCourse(req, res) {
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
            await student_course_service_1.StudentCourseService.unenrollFromCourse(id, userWithRole.student_profile_id);
            res.status(200).json({
                success: true,
                message: 'Successfully unenrolled from course',
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to unenroll from course',
            });
        }
    }
    // Update last accessed timestamp
    static async updateLastAccessed(req, res) {
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
            await student_course_service_1.StudentCourseService.updateLastAccessed(id, userWithRole.student_profile_id);
            res.status(200).json({
                success: true,
                message: 'Last accessed timestamp updated',
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to update last accessed',
            });
        }
    }
    // Update course progress
    static async updateProgress(req, res) {
        try {
            const { id } = req.params;
            const { progress_percentage } = req.body;
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                });
                return;
            }
            // Validate progress percentage
            if (typeof progress_percentage !== 'number' || progress_percentage < 0 || progress_percentage > 100) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid progress percentage. Must be between 0 and 100',
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
            await student_course_service_1.StudentCourseService.updateProgress(id, userWithRole.student_profile_id, progress_percentage);
            res.status(200).json({
                success: true,
                message: 'Course progress updated successfully',
                data: { progress_percentage },
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to update progress',
            });
        }
    }
}
exports.StudentCourseController = StudentCourseController;
//# sourceMappingURL=student-course.controller.js.map