"use strict";
// src/routes/webinar.routes.ts
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const webinar_controller_1 = require("../controllers/webinar.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const router = (0, express_1.Router)();
// All webinar routes require teacher authentication
router.use(auth_middleware_1.authenticate);
router.use((0, auth_middleware_1.authorize)('teacher'));
// GET /api/webinars - Get all webinars for logged-in teacher
router.get('/', webinar_controller_1.WebinarController.getAllWebinars);
// GET /api/webinars/upcoming - Get upcoming webinars
router.get('/upcoming', webinar_controller_1.WebinarController.getUpcomingWebinars);
// GET /api/webinars/:id - Get single webinar by ID
router.get('/:id', webinar_controller_1.WebinarController.getWebinarById);
// GET /api/webinars/:id/students - Get registered students for a webinar
router.get('/:id/students', webinar_controller_1.WebinarController.getRegisteredStudents);
// POST /api/webinars - Create new webinar
router.post('/', validation_middleware_1.validateCreateWebinar, validation_middleware_1.handleValidationErrors, webinar_controller_1.WebinarController.createWebinar);
// PUT /api/webinars/:id - Update webinar
router.put('/:id', validation_middleware_1.validateUpdateWebinar, validation_middleware_1.handleValidationErrors, webinar_controller_1.WebinarController.updateWebinar);
// DELETE /api/webinars/:id - Delete webinar
router.delete('/:id', webinar_controller_1.WebinarController.deleteWebinar);
exports.default = router;
//# sourceMappingURL=webinar.routes.js.map