"use strict";
// src/routes/batch-sessions.routes.ts
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const batches_controller_1 = require("../controllers/batches.controller");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
// GET    /api/batch-sessions/:sessionId           — session details + attendance list
router.get('/:sessionId', batches_controller_1.BatchesController.getSessionDetails);
// DELETE /api/batch-sessions/:sessionId           — delete a session (teacher only)
router.delete('/:sessionId', batches_controller_1.BatchesController.deleteSession);
// PUT    /api/batch-sessions/:sessionId/attendance — bulk mark attendance
router.put('/:sessionId/attendance', batches_controller_1.BatchesController.markAttendance);
exports.default = router;
//# sourceMappingURL=batch-sessions.routes.js.map