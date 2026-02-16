// src/routes/documents.routes.ts

import { Router } from 'express';
import { DocumentsController } from '../controllers/documents.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// ========== ACCESSIBLE TEACHERS (students use this to get the teacher picker list) ==========

// GET /api/documents/accessible-teachers
router.get('/accessible-teachers', DocumentsController.getAccessibleTeachers);

// ========== CONTENTS ==========

// GET /api/documents/contents?folderId=&scopeTeacherId=  (scopeTeacherId required for students)
router.get('/contents', DocumentsController.getFolderContents);

// ========== FOLDERS ==========

// POST /api/documents/folders
router.post('/folders', DocumentsController.createFolder);

// PUT /api/documents/folders/:id
router.put('/folders/:id', DocumentsController.renameFolder);

// DELETE /api/documents/folders/:id
router.delete('/folders/:id', DocumentsController.deleteFolder);

// ========== FILES ==========

// POST /api/documents/files/upload-url  — must come before /files/:id
router.post('/files/upload-url', DocumentsController.requestUploadUrl);

// POST /api/documents/files
router.post('/files', DocumentsController.saveFile);

// GET /api/documents/files/:id/download
router.get('/files/:id/download', DocumentsController.getDownloadUrl);

// PUT /api/documents/files/:id
router.put('/files/:id', DocumentsController.renameFile);

// DELETE /api/documents/files/:id
router.delete('/files/:id', DocumentsController.deleteFile);

export default router;
