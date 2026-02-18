"use strict";
// src/routes/student-webinar.routes.ts
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const student_webinar_controller_1 = require("../controllers/student-webinar.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// All routes require student authentication
router.use(auth_middleware_1.authenticate);
router.use((0, auth_middleware_1.authorize)('student'));
// GET /api/student-webinars - Get all webinars for logged-in student
router.get('/', student_webinar_controller_1.StudentWebinarController.getAllWebinars);
// GET /api/student-webinars/registered - Get registered webinars
router.get('/registered', student_webinar_controller_1.StudentWebinarController.getRegisteredWebinars);
// GET /api/student-webinars/upcoming - Get upcoming webinars
router.get('/upcoming', student_webinar_controller_1.StudentWebinarController.getUpcomingWebinars);
// GET /api/student-webinars/:id - Get single webinar by ID
router.get('/:id', student_webinar_controller_1.StudentWebinarController.getWebinarById);
// POST /api/student-webinars/:id/register - Register for a webinar
router.post('/:id/register', student_webinar_controller_1.StudentWebinarController.registerForWebinar);
// DELETE /api/student-webinars/:id/unregister - Unregister from a webinar
router.delete('/:id/unregister', student_webinar_controller_1.StudentWebinarController.unregisterFromWebinar);
exports.default = router;
//# sourceMappingURL=student-webinar.routes.js.map