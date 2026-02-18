"use strict";
// src/routes/documents.routes.ts
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const documents_controller_1 = require("../controllers/documents.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_middleware_1.authenticate);
// ========== ACCESSIBLE TEACHERS (students use this to get the teacher picker list) ==========
// GET /api/documents/accessible-teachers
router.get('/accessible-teachers', documents_controller_1.DocumentsController.getAccessibleTeachers);
// ========== CONTENTS ==========
// GET /api/documents/contents?folderId=&scopeTeacherId=  (scopeTeacherId required for students)
router.get('/contents', documents_controller_1.DocumentsController.getFolderContents);
// ========== FOLDERS ==========
// POST /api/documents/folders
router.post('/folders', documents_controller_1.DocumentsController.createFolder);
// PUT /api/documents/folders/:id
router.put('/folders/:id', documents_controller_1.DocumentsController.renameFolder);
// DELETE /api/documents/folders/:id
router.delete('/folders/:id', documents_controller_1.DocumentsController.deleteFolder);
// ========== FILES ==========
// POST /api/documents/files/upload-url  — must come before /files/:id
router.post('/files/upload-url', documents_controller_1.DocumentsController.requestUploadUrl);
// POST /api/documents/files
router.post('/files', documents_controller_1.DocumentsController.saveFile);
// GET /api/documents/files/:id/download
router.get('/files/:id/download', documents_controller_1.DocumentsController.getDownloadUrl);
// PUT /api/documents/files/:id
router.put('/files/:id', documents_controller_1.DocumentsController.renameFile);
// DELETE /api/documents/files/:id
router.delete('/files/:id', documents_controller_1.DocumentsController.deleteFile);
exports.default = router;
//# sourceMappingURL=documents.routes.js.map