"use strict";
// src/routes/student-course.routes.ts
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const student_course_controller_1 = require("../controllers/student-course.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_middleware_1.authenticate);
// Get all courses (with enrollment status)
router.get('/', student_course_controller_1.StudentCourseController.getAllCourses);
// Get enrolled courses
router.get('/enrolled', student_course_controller_1.StudentCourseController.getEnrolledCourses);
// Get single course by ID
router.get('/:id', student_course_controller_1.StudentCourseController.getCourseById);
// Enroll in a course
router.post('/:id/enroll', student_course_controller_1.StudentCourseController.enrollInCourse);
// Unenroll from a course
router.delete('/:id/enroll', student_course_controller_1.StudentCourseController.unenrollFromCourse);
// Update last accessed timestamp
router.patch('/:id/last-accessed', student_course_controller_1.StudentCourseController.updateLastAccessed);
// Update course progress
router.patch('/:id/progress', student_course_controller_1.StudentCourseController.updateProgress);
exports.default = router;
//# sourceMappingURL=student-course.routes.js.map