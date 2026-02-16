// src/routes/batches.routes.ts

import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { BatchesController } from '../controllers/batches.controller';

const router = Router();

router.use(authenticate);

// Must be before /:id to avoid Express matching "teacher-students" as :id
router.get('/teacher-students', BatchesController.getTeacherStudents);

// Batch CRUD
router.get('/', BatchesController.getBatches);
router.post('/', BatchesController.createBatch);
router.get('/:id', BatchesController.getBatch);
router.put('/:id', BatchesController.updateBatch);
router.delete('/:id', BatchesController.deleteBatch);

// Students in batch
router.get('/:id/students', BatchesController.getBatchStudents);
router.post('/:id/students', BatchesController.addStudent);
router.delete('/:id/students/:studentUserId', BatchesController.removeStudent);

// Sessions
router.get('/:id/sessions', BatchesController.getBatchSessions);
router.post('/:id/sessions', BatchesController.createSessions);

export default router;
