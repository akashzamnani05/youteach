"use strict";
// src/services/documents.service.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentsService = void 0;
const uuid_1 = require("uuid");
const database_1 = require("../config/database");
const storage_service_1 = require("./storage.service");
class DocumentsService {
    // ========== SCOPE VALIDATION ==========
    // Returns true if the student (by userId) is enrolled in at least one course by this teacher
    static async validateStudentAccess(userId, teacherProfileId) {
        const row = await (0, database_1.queryOne)(`SELECT COUNT(*) as cnt
       FROM enrollments e
       JOIN student_profiles sp ON sp.id = e.student_id
       JOIN courses c ON c.id = e.course_id
       WHERE sp.user_id = ? AND c.teacher_id = ?`, [userId, teacherProfileId]);
        return (row?.cnt ?? 0) > 0;
    }
    // Returns all teachers a student is enrolled with (for the teacher picker UI)
    static async getAccessibleTeachers(userId) {
        return (0, database_1.query)(`SELECT DISTINCT
         tp.id AS teacher_profile_id,
         u.full_name AS teacher_name
       FROM enrollments e
       JOIN student_profiles sp ON sp.id = e.student_id
       JOIN courses c ON c.id = e.course_id
       JOIN teacher_profiles tp ON tp.id = c.teacher_id
       JOIN users u ON u.id = tp.user_id
       WHERE sp.user_id = ?
       ORDER BY u.full_name ASC`, [userId]);
    }
    // ========== FOLDER CONTENTS ==========
    static async getFolderContents(folderId, teacherProfileId) {
        const folders = await (0, database_1.query)(`SELECT * FROM document_folders
       WHERE teacher_profile_id = ? AND parent_folder_id <=> ?
       ORDER BY name ASC`, [teacherProfileId, folderId]);
        const files = await (0, database_1.query)(`SELECT * FROM document_files
       WHERE teacher_profile_id = ? AND folder_id <=> ?
       ORDER BY name ASC`, [teacherProfileId, folderId]);
        const breadcrumb = await DocumentsService.buildBreadcrumb(folderId, teacherProfileId);
        return { folders, files, breadcrumb };
    }
    static async buildBreadcrumb(folderId, teacherProfileId) {
        const crumbs = [{ id: null, name: 'Documents' }];
        if (!folderId)
            return crumbs;
        const ancestors = [];
        let currentId = folderId;
        while (currentId) {
            const folder = await (0, database_1.queryOne)(`SELECT id, name, parent_folder_id FROM document_folders
         WHERE id = ? AND teacher_profile_id = ?`, [currentId, teacherProfileId]);
            if (!folder)
                break;
            ancestors.unshift({ id: folder.id, name: folder.name });
            currentId = folder.parent_folder_id;
        }
        return [...crumbs, ...ancestors];
    }
    // ========== FOLDERS ==========
    static async createFolder(name, parentFolderId, userId, teacherProfileId) {
        if (!name || !name.trim())
            throw new Error('Folder name is required');
        if (parentFolderId) {
            const parent = await (0, database_1.queryOne)(`SELECT id FROM document_folders WHERE id = ? AND teacher_profile_id = ?`, [parentFolderId, teacherProfileId]);
            if (!parent)
                throw new Error('Parent folder not found');
        }
        const folderId = (0, uuid_1.v4)();
        await (0, database_1.query)(`INSERT INTO document_folders
         (id, name, teacher_profile_id, parent_folder_id, created_by_user_id)
       VALUES (?, ?, ?, ?, ?)`, [folderId, name.trim(), teacherProfileId, parentFolderId ?? null, userId]);
        return (await (0, database_1.queryOne)(`SELECT * FROM document_folders WHERE id = ?`, [folderId]));
    }
    static async renameFolder(folderId, name, teacherProfileId) {
        if (!name || !name.trim())
            throw new Error('Folder name is required');
        const existing = await (0, database_1.queryOne)(`SELECT id FROM document_folders WHERE id = ? AND teacher_profile_id = ?`, [folderId, teacherProfileId]);
        if (!existing)
            throw new Error('Folder not found');
        await (0, database_1.query)(`UPDATE document_folders SET name = ? WHERE id = ? AND teacher_profile_id = ?`, [name.trim(), folderId, teacherProfileId]);
        return (await (0, database_1.queryOne)(`SELECT * FROM document_folders WHERE id = ?`, [folderId]));
    }
    static async deleteFolder(folderId, teacherProfileId) {
        const existing = await (0, database_1.queryOne)(`SELECT id FROM document_folders WHERE id = ? AND teacher_profile_id = ?`, [folderId, teacherProfileId]);
        if (!existing)
            throw new Error('Folder not found');
        const descendantFiles = await (0, database_1.query)(`WITH RECURSIVE folder_tree AS (
         SELECT id FROM document_folders WHERE id = ?
         UNION ALL
         SELECT f.id FROM document_folders f
         INNER JOIN folder_tree ft ON f.parent_folder_id = ft.id
       )
       SELECT df.storage_path
       FROM document_files df
       WHERE df.folder_id IN (SELECT id FROM folder_tree)`, [folderId]);
        await (0, database_1.query)(`DELETE FROM document_folders WHERE id = ?`, [folderId]);
        for (const file of descendantFiles) {
            await storage_service_1.StorageService.deleteFile(file.storage_path);
        }
    }
    // ========== FILES ==========
    static async requestUploadUrl(filename, mimeType, sizeBytes, folderId, userId, teacherProfileId) {
        if (folderId) {
            const folder = await (0, database_1.queryOne)(`SELECT id FROM document_folders WHERE id = ? AND teacher_profile_id = ?`, [folderId, teacherProfileId]);
            if (!folder)
                throw new Error('Folder not found');
        }
        const fileId = (0, uuid_1.v4)();
        const storagePath = storage_service_1.StorageService.buildStoragePath(fileId, teacherProfileId, folderId, filename);
        const signedUrl = await storage_service_1.StorageService.getUploadUrl(storagePath, mimeType);
        return { file_id: fileId, signed_url: signedUrl, storage_path: storagePath };
    }
    static async saveFile(params, teacherProfileId) {
        const { file_id, name, original_filename, mime_type, size_bytes, folder_id, storage_path, uploaded_by_user_id, } = params;
        const downloadUrl = await storage_service_1.StorageService.getDownloadUrl(storage_path, 60 * 24 * 365 // 1 year
        );
        await (0, database_1.query)(`INSERT INTO document_files
         (id, name, original_filename, mime_type, size_bytes, teacher_profile_id,
          folder_id, uploaded_by_user_id, storage_path, download_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
            file_id,
            name,
            original_filename,
            mime_type,
            size_bytes,
            teacherProfileId,
            folder_id ?? null,
            uploaded_by_user_id,
            storage_path,
            downloadUrl,
        ]);
        return (await (0, database_1.queryOne)(`SELECT * FROM document_files WHERE id = ?`, [file_id]));
    }
    static async getDownloadUrl(fileId, teacherProfileId) {
        const file = await (0, database_1.queryOne)(`SELECT id, original_filename, storage_path FROM document_files
       WHERE id = ? AND teacher_profile_id = ?`, [fileId, teacherProfileId]);
        if (!file)
            throw new Error('File not found');
        const downloadUrl = await storage_service_1.StorageService.getDownloadUrl(file.storage_path);
        return { download_url: downloadUrl, filename: file.original_filename };
    }
    static async renameFile(fileId, name, teacherProfileId) {
        if (!name || !name.trim())
            throw new Error('File name is required');
        const existing = await (0, database_1.queryOne)(`SELECT id FROM document_files WHERE id = ? AND teacher_profile_id = ?`, [fileId, teacherProfileId]);
        if (!existing)
            throw new Error('File not found');
        await (0, database_1.query)(`UPDATE document_files SET name = ? WHERE id = ? AND teacher_profile_id = ?`, [name.trim(), fileId, teacherProfileId]);
        return (await (0, database_1.queryOne)(`SELECT * FROM document_files WHERE id = ?`, [fileId]));
    }
    static async deleteFile(fileId, teacherProfileId) {
        const file = await (0, database_1.queryOne)(`SELECT id, storage_path FROM document_files WHERE id = ? AND teacher_profile_id = ?`, [fileId, teacherProfileId]);
        if (!file)
            throw new Error('File not found');
        await (0, database_1.query)(`DELETE FROM document_files WHERE id = ?`, [fileId]);
        await storage_service_1.StorageService.deleteFile(file.storage_path);
    }
}
exports.DocumentsService = DocumentsService;
//# sourceMappingURL=documents.service.js.map