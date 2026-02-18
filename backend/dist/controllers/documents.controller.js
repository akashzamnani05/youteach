"use strict";
// src/controllers/documents.controller.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentsController = void 0;
const documents_service_1 = require("../services/documents.service");
const auth_service_1 = require("../services/auth.service");
class DocumentsController {
    // ========== SCOPE RESOLUTION ==========
    // Determines the teacher_profile_id scope for the current request.
    //
    //  - Teacher: always their own profile ID (ignores any frontend-provided scope)
    //  - Student: requires `scopeTeacherId` in query or body; validates enrollment
    //
    // Returns null + sets 4xx response if scope cannot be resolved.
    static async resolveScope(req, res) {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return null;
        }
        const userWithRole = await auth_service_1.AuthService.getUserWithRole(userId);
        if (!userWithRole) {
            res.status(401).json({ success: false, message: 'User not found' });
            return null;
        }
        if (userWithRole.role === 'teacher') {
            if (!userWithRole.teacher_profile_id) {
                res.status(403).json({ success: false, message: 'Teacher profile not found' });
                return null;
            }
            return userWithRole.teacher_profile_id;
        }
        // Student path — requires scopeTeacherId
        const scopeTeacherId = req.query.scopeTeacherId ||
            req.body?.scopeTeacherId ||
            null;
        if (!scopeTeacherId) {
            res.status(400).json({
                success: false,
                message: 'scopeTeacherId is required for students',
            });
            return null;
        }
        const hasAccess = await documents_service_1.DocumentsService.validateStudentAccess(userId, scopeTeacherId);
        if (!hasAccess) {
            res.status(403).json({
                success: false,
                message: 'You are not enrolled in any course by this teacher',
            });
            return null;
        }
        return scopeTeacherId;
    }
    // ========== ACCESSIBLE TEACHERS (students only) ==========
    // GET /api/documents/accessible-teachers
    static async getAccessibleTeachers(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }
            const teachers = await documents_service_1.DocumentsService.getAccessibleTeachers(userId);
            res.status(200).json({
                success: true,
                message: 'Accessible teachers retrieved successfully',
                data: { teachers },
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch accessible teachers',
            });
        }
    }
    // ========== CONTENTS ==========
    // GET /api/documents/contents?folderId=&scopeTeacherId=
    static async getFolderContents(req, res) {
        try {
            const teacherProfileId = await DocumentsController.resolveScope(req, res);
            if (!teacherProfileId)
                return;
            const folderId = req.query.folderId || null;
            const contents = await documents_service_1.DocumentsService.getFolderContents(folderId, teacherProfileId);
            res.status(200).json({
                success: true,
                message: 'Folder contents retrieved successfully',
                data: contents,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch folder contents',
            });
        }
    }
    // ========== FOLDERS ==========
    // POST /api/documents/folders
    static async createFolder(req, res) {
        try {
            const userId = req.user?.userId;
            const teacherProfileId = await DocumentsController.resolveScope(req, res);
            if (!teacherProfileId)
                return;
            const { name, parent_folder_id } = req.body;
            if (!name || !name.trim()) {
                res.status(400).json({ success: false, message: 'Folder name is required' });
                return;
            }
            const folder = await documents_service_1.DocumentsService.createFolder(name, parent_folder_id ?? null, userId, teacherProfileId);
            res.status(201).json({
                success: true,
                message: 'Folder created successfully',
                data: { folder },
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to create folder',
            });
        }
    }
    // PUT /api/documents/folders/:id
    static async renameFolder(req, res) {
        try {
            const teacherProfileId = await DocumentsController.resolveScope(req, res);
            if (!teacherProfileId)
                return;
            const { id } = req.params;
            const { name } = req.body;
            if (!name || !name.trim()) {
                res.status(400).json({ success: false, message: 'Folder name is required' });
                return;
            }
            const folder = await documents_service_1.DocumentsService.renameFolder(id, name, teacherProfileId);
            res.status(200).json({
                success: true,
                message: 'Folder renamed successfully',
                data: { folder },
            });
        }
        catch (error) {
            const status = error.message.includes('not found') ? 404 : 400;
            res.status(status).json({
                success: false,
                message: error.message || 'Failed to rename folder',
            });
        }
    }
    // DELETE /api/documents/folders/:id
    static async deleteFolder(req, res) {
        try {
            const teacherProfileId = await DocumentsController.resolveScope(req, res);
            if (!teacherProfileId)
                return;
            const { id } = req.params;
            await documents_service_1.DocumentsService.deleteFolder(id, teacherProfileId);
            res.status(200).json({
                success: true,
                message: 'Folder deleted successfully',
                data: {},
            });
        }
        catch (error) {
            const status = error.message.includes('not found') ? 404 : 400;
            res.status(status).json({
                success: false,
                message: error.message || 'Failed to delete folder',
            });
        }
    }
    // ========== FILES ==========
    // POST /api/documents/files/upload-url
    static async requestUploadUrl(req, res) {
        try {
            const userId = req.user?.userId;
            const teacherProfileId = await DocumentsController.resolveScope(req, res);
            if (!teacherProfileId)
                return;
            const { filename, mime_type, size_bytes, folder_id } = req.body;
            if (!filename || !mime_type || size_bytes === undefined) {
                res.status(400).json({
                    success: false,
                    message: 'filename, mime_type, and size_bytes are required',
                });
                return;
            }
            const result = await documents_service_1.DocumentsService.requestUploadUrl(filename, mime_type, size_bytes, folder_id ?? null, userId, teacherProfileId);
            res.status(200).json({
                success: true,
                message: 'Upload URL generated successfully',
                data: result,
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to generate upload URL',
            });
        }
    }
    // POST /api/documents/files
    static async saveFile(req, res) {
        try {
            const userId = req.user?.userId;
            const teacherProfileId = await DocumentsController.resolveScope(req, res);
            if (!teacherProfileId)
                return;
            const { file_id, filename, original_filename, mime_type, size_bytes, folder_id, storage_path, } = req.body;
            if (!file_id || !filename || !original_filename || !mime_type || !storage_path) {
                res.status(400).json({
                    success: false,
                    message: 'file_id, filename, original_filename, mime_type, and storage_path are required',
                });
                return;
            }
            const params = {
                file_id,
                name: filename,
                original_filename,
                mime_type,
                size_bytes: size_bytes || 0,
                folder_id: folder_id ?? null,
                storage_path,
                uploaded_by_user_id: userId,
            };
            const file = await documents_service_1.DocumentsService.saveFile(params, teacherProfileId);
            res.status(201).json({
                success: true,
                message: 'File saved successfully',
                data: { file },
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to save file',
            });
        }
    }
    // GET /api/documents/files/:id/download
    static async getDownloadUrl(req, res) {
        try {
            const teacherProfileId = await DocumentsController.resolveScope(req, res);
            if (!teacherProfileId)
                return;
            const { id } = req.params;
            const result = await documents_service_1.DocumentsService.getDownloadUrl(id, teacherProfileId);
            res.status(200).json({
                success: true,
                message: 'Download URL generated successfully',
                data: result,
            });
        }
        catch (error) {
            const status = error.message.includes('not found') ? 404 : 500;
            res.status(status).json({
                success: false,
                message: error.message || 'Failed to generate download URL',
            });
        }
    }
    // PUT /api/documents/files/:id
    static async renameFile(req, res) {
        try {
            const teacherProfileId = await DocumentsController.resolveScope(req, res);
            if (!teacherProfileId)
                return;
            const { id } = req.params;
            const { name } = req.body;
            if (!name || !name.trim()) {
                res.status(400).json({ success: false, message: 'File name is required' });
                return;
            }
            const file = await documents_service_1.DocumentsService.renameFile(id, name, teacherProfileId);
            res.status(200).json({
                success: true,
                message: 'File renamed successfully',
                data: { file },
            });
        }
        catch (error) {
            const status = error.message.includes('not found') ? 404 : 400;
            res.status(status).json({
                success: false,
                message: error.message || 'Failed to rename file',
            });
        }
    }
    // DELETE /api/documents/files/:id
    static async deleteFile(req, res) {
        try {
            const teacherProfileId = await DocumentsController.resolveScope(req, res);
            if (!teacherProfileId)
                return;
            const { id } = req.params;
            await documents_service_1.DocumentsService.deleteFile(id, teacherProfileId);
            res.status(200).json({
                success: true,
                message: 'File deleted successfully',
                data: {},
            });
        }
        catch (error) {
            const status = error.message.includes('not found') ? 404 : 400;
            res.status(status).json({
                success: false,
                message: error.message || 'Failed to delete file',
            });
        }
    }
}
exports.DocumentsController = DocumentsController;
//# sourceMappingURL=documents.controller.js.map