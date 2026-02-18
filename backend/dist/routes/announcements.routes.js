"use strict";
// src/routes/announcements.routes.ts
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const announcements_controller_1 = require("../controllers/announcements.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_middleware_1.authenticate);
// GET /api/announcements
// Teacher: their own announcements. Student: their teacher's announcements.
router.get('/', announcements_controller_1.AnnouncementsController.getAnnouncements);
// POST /api/announcements  (teacher only — enforced in controller)
router.post('/', announcements_controller_1.AnnouncementsController.createAnnouncement);
// PUT /api/announcements/:id  (teacher only)
router.put('/:id', announcements_controller_1.AnnouncementsController.updateAnnouncement);
// DELETE /api/announcements/:id  (teacher only)
router.delete('/:id', announcements_controller_1.AnnouncementsController.deleteAnnouncement);
exports.default = router;
//# sourceMappingURL=announcements.routes.js.map