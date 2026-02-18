"use strict";
// src/routes/student-course-content.routes.ts
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const student_course_content_controller_1 = require("../controllers/student-course-content.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_middleware_1.authenticate);
// Get all modules of a course
router.get('/course/:courseId/modules', student_course_content_controller_1.StudentCourseContentController.getModulesByCourse);
// Get all content of a module
router.get('/module/:moduleId/content', student_course_content_controller_1.StudentCourseContentController.getContentByModule);
// Get full course content (modules + content organized)
router.get('/course/:courseId/content', student_course_content_controller_1.StudentCourseContentController.getAllContentByCourse);
exports.default = router;
//# sourceMappingURL=student-course-content.routes.js.map