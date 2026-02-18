"use strict";
// src/routes/students.routes.ts
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const students_controller_1 = require("../controllers/students.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const router = (0, express_1.Router)();
// All routes require teacher authentication
router.use(auth_middleware_1.authenticate);
router.use((0, auth_middleware_1.authorize)('teacher'));
// GET /api/students - Get all students for logged-in teacher
router.get('/', students_controller_1.StudentsController.getStudents);
// GET /api/students/:id - Get single student by ID
router.get('/:id', students_controller_1.StudentsController.getStudentById);
// POST /api/students - Create new student
router.post('/', validation_middleware_1.validateStudentSignup, validation_middleware_1.handleValidationErrors, students_controller_1.StudentsController.createStudent);
// DELETE /api/students/:id - Delete student
router.delete('/:id', students_controller_1.StudentsController.deleteStudent);
exports.default = router;
//# sourceMappingURL=students.routes.js.map