"use strict";
// src/routes/module.routes.ts
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const course_controller_1 = require("../controllers/course.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_middleware_1.authenticate);
// ========== MODULE ROUTES ==========
// GET /api/modules/:id - Get single module by ID
router.get('/:id', course_controller_1.CourseController.getModuleById);
// POST /api/modules - Create new module
router.post('/', course_controller_1.CourseController.createModule);
// PUT /api/modules/:id - Update module
router.put('/:id', course_controller_1.CourseController.updateModule);
// DELETE /api/modules/:id - Delete module
router.delete('/:id', course_controller_1.CourseController.deleteModule);
exports.default = router;
//# sourceMappingURL=module.routes.js.map