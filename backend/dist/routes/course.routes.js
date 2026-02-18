"use strict";
// src/routes/course.routes.ts
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const course_controller_1 = require("../controllers/course.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const upload_middleware_1 = require("../middleware/upload.middleware");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_middleware_1.authenticate);
// ========== COURSE ROUTES ==========
// GET /api/courses - Get all courses for logged-in teacher
router.get('/', course_controller_1.CourseController.getAllCourses);
// POST /api/courses/thumbnail - Upload course thumbnail to Firebase Storage
// Must be before /:id routes to avoid route conflict
router.post('/thumbnail', upload_middleware_1.uploadImage.single('thumbnail'), course_controller_1.CourseController.uploadThumbnail);
// GET /api/courses/:courseId/modules - Get all modules for a course
router.get('/:courseId/modules', course_controller_1.CourseController.getModulesByCourse);
// GET /api/courses/:id - Get single course by ID
router.get('/:id', course_controller_1.CourseController.getCourseById);
// POST /api/courses - Create new course
router.post('/', course_controller_1.CourseController.createCourse);
// PUT /api/courses/:id - Update course
router.put('/:id', course_controller_1.CourseController.updateCourse);
// DELETE /api/courses/:id - Delete course
router.delete('/:id', course_controller_1.CourseController.deleteCourse);
// Reorder modules
router.put('/:id/reorder-modules', course_controller_1.CourseController.reorderModules);
// Get all enrolled students for a course
router.get('/:id/students', course_controller_1.CourseController.getEnrolledStudents);
// Get enrollment statistics for a course
router.get('/:id/stats', course_controller_1.CourseController.getEnrollmentStats);
// Get single enrolled student details
router.get('/:id/students/:studentId', course_controller_1.CourseController.getEnrolledStudentById);
// Unenroll student from course (teacher action)
router.delete('/:id/students/:studentId', course_controller_1.CourseController.unenrollStudent);
exports.default = router;
//# sourceMappingURL=course.routes.js.map