"use strict";
// src/routes/batches.routes.ts
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const batches_controller_1 = require("../controllers/batches.controller");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
// Must be before /:id to avoid Express matching "teacher-students" as :id
router.get('/teacher-students', batches_controller_1.BatchesController.getTeacherStudents);
// Batch CRUD
router.get('/', batches_controller_1.BatchesController.getBatches);
router.post('/', batches_controller_1.BatchesController.createBatch);
router.get('/:id', batches_controller_1.BatchesController.getBatch);
router.put('/:id', batches_controller_1.BatchesController.updateBatch);
router.delete('/:id', batches_controller_1.BatchesController.deleteBatch);
// Students in batch
router.get('/:id/students', batches_controller_1.BatchesController.getBatchStudents);
router.post('/:id/students', batches_controller_1.BatchesController.addStudent);
router.delete('/:id/students/:studentUserId', batches_controller_1.BatchesController.removeStudent);
// Sessions
router.get('/:id/sessions', batches_controller_1.BatchesController.getBatchSessions);
router.post('/:id/sessions', batches_controller_1.BatchesController.createSessions);
exports.default = router;
//# sourceMappingURL=batches.routes.js.map