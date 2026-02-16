// src/controllers/documents.controller.ts

import { Request, Response } from 'express';
import { DocumentsService } from '../services/documents.service';
import { AuthService } from '../services/auth.service';
import { SaveFileParams } from '../types/documents.types';

export class DocumentsController {
  // ========== SCOPE RESOLUTION ==========

  // Determines the teacher_profile_id scope for the current request.
  //
  //  - Teacher: always their own profile ID (ignores any frontend-provided scope)
  //  - Student: requires `scopeTeacherId` in query or body; validates enrollment
  //
  // Returns null + sets 4xx response if scope cannot be resolved.
  private static async resolveScope(
    req: Request,
    res: Response
  ): Promise<string | null> {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return null;
    }

    const userWithRole = await AuthService.getUserWithRole(userId);

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
    const scopeTeacherId =
      (req.query.scopeTeacherId as string) ||
      (req.body?.scopeTeacherId as string) ||
      null;

    if (!scopeTeacherId) {
      res.status(400).json({
        success: false,
        message: 'scopeTeacherId is required for students',
      });
      return null;
    }

    const hasAccess = await DocumentsService.validateStudentAccess(userId, scopeTeacherId);

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
  static async getAccessibleTeachers(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const teachers = await DocumentsService.getAccessibleTeachers(userId);

      res.status(200).json({
        success: true,
        message: 'Accessible teachers retrieved successfully',
        data: { teachers },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch accessible teachers',
      });
    }
  }

  // ========== CONTENTS ==========

  // GET /api/documents/contents?folderId=&scopeTeacherId=
  static async getFolderContents(req: Request, res: Response): Promise<void> {
    try {
      const teacherProfileId = await DocumentsController.resolveScope(req, res);
      if (!teacherProfileId) return;

      const folderId = (req.query.folderId as string) || null;

      const contents = await DocumentsService.getFolderContents(folderId, teacherProfileId);

      res.status(200).json({
        success: true,
        message: 'Folder contents retrieved successfully',
        data: contents,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch folder contents',
      });
    }
  }

  // ========== FOLDERS ==========

  // POST /api/documents/folders
  static async createFolder(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId!;
      const teacherProfileId = await DocumentsController.resolveScope(req, res);
      if (!teacherProfileId) return;

      const { name, parent_folder_id } = req.body;

      if (!name || !name.trim()) {
        res.status(400).json({ success: false, message: 'Folder name is required' });
        return;
      }

      const folder = await DocumentsService.createFolder(
        name,
        parent_folder_id ?? null,
        userId,
        teacherProfileId
      );

      res.status(201).json({
        success: true,
        message: 'Folder created successfully',
        data: { folder },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to create folder',
      });
    }
  }

  // PUT /api/documents/folders/:id
  static async renameFolder(req: Request, res: Response): Promise<void> {
    try {
      const teacherProfileId = await DocumentsController.resolveScope(req, res);
      if (!teacherProfileId) return;

      const { id } = req.params;
      const { name } = req.body;

      if (!name || !name.trim()) {
        res.status(400).json({ success: false, message: 'Folder name is required' });
        return;
      }

      const folder = await DocumentsService.renameFolder(id, name, teacherProfileId);

      res.status(200).json({
        success: true,
        message: 'Folder renamed successfully',
        data: { folder },
      });
    } catch (error: any) {
      const status = error.message.includes('not found') ? 404 : 400;
      res.status(status).json({
        success: false,
        message: error.message || 'Failed to rename folder',
      });
    }
  }

  // DELETE /api/documents/folders/:id
  static async deleteFolder(req: Request, res: Response): Promise<void> {
    try {
      const teacherProfileId = await DocumentsController.resolveScope(req, res);
      if (!teacherProfileId) return;

      const { id } = req.params;

      await DocumentsService.deleteFolder(id, teacherProfileId);

      res.status(200).json({
        success: true,
        message: 'Folder deleted successfully',
        data: {},
      });
    } catch (error: any) {
      const status = error.message.includes('not found') ? 404 : 400;
      res.status(status).json({
        success: false,
        message: error.message || 'Failed to delete folder',
      });
    }
  }

  // ========== FILES ==========

  // POST /api/documents/files/upload-url
  static async requestUploadUrl(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId!;
      const teacherProfileId = await DocumentsController.resolveScope(req, res);
      if (!teacherProfileId) return;

      const { filename, mime_type, size_bytes, folder_id } = req.body;

      if (!filename || !mime_type || size_bytes === undefined) {
        res.status(400).json({
          success: false,
          message: 'filename, mime_type, and size_bytes are required',
        });
        return;
      }

      const result = await DocumentsService.requestUploadUrl(
        filename,
        mime_type,
        size_bytes,
        folder_id ?? null,
        userId,
        teacherProfileId
      );

      res.status(200).json({
        success: true,
        message: 'Upload URL generated successfully',
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to generate upload URL',
      });
    }
  }

  // POST /api/documents/files
  static async saveFile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId!;
      const teacherProfileId = await DocumentsController.resolveScope(req, res);
      if (!teacherProfileId) return;

      const {
        file_id,
        filename,
        original_filename,
        mime_type,
        size_bytes,
        folder_id,
        storage_path,
      } = req.body;

      if (!file_id || !filename || !original_filename || !mime_type || !storage_path) {
        res.status(400).json({
          success: false,
          message: 'file_id, filename, original_filename, mime_type, and storage_path are required',
        });
        return;
      }

      const params: SaveFileParams = {
        file_id,
        name: filename,
        original_filename,
        mime_type,
        size_bytes: size_bytes || 0,
        folder_id: folder_id ?? null,
        storage_path,
        uploaded_by_user_id: userId,
      };

      const file = await DocumentsService.saveFile(params, teacherProfileId);

      res.status(201).json({
        success: true,
        message: 'File saved successfully',
        data: { file },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to save file',
      });
    }
  }

  // GET /api/documents/files/:id/download
  static async getDownloadUrl(req: Request, res: Response): Promise<void> {
    try {
      const teacherProfileId = await DocumentsController.resolveScope(req, res);
      if (!teacherProfileId) return;

      const { id } = req.params;

      const result = await DocumentsService.getDownloadUrl(id, teacherProfileId);

      res.status(200).json({
        success: true,
        message: 'Download URL generated successfully',
        data: result,
      });
    } catch (error: any) {
      const status = error.message.includes('not found') ? 404 : 500;
      res.status(status).json({
        success: false,
        message: error.message || 'Failed to generate download URL',
      });
    }
  }

  // PUT /api/documents/files/:id
  static async renameFile(req: Request, res: Response): Promise<void> {
    try {
      const teacherProfileId = await DocumentsController.resolveScope(req, res);
      if (!teacherProfileId) return;

      const { id } = req.params;
      const { name } = req.body;

      if (!name || !name.trim()) {
        res.status(400).json({ success: false, message: 'File name is required' });
        return;
      }

      const file = await DocumentsService.renameFile(id, name, teacherProfileId);

      res.status(200).json({
        success: true,
        message: 'File renamed successfully',
        data: { file },
      });
    } catch (error: any) {
      const status = error.message.includes('not found') ? 404 : 400;
      res.status(status).json({
        success: false,
        message: error.message || 'Failed to rename file',
      });
    }
  }

  // DELETE /api/documents/files/:id
  static async deleteFile(req: Request, res: Response): Promise<void> {
    try {
      const teacherProfileId = await DocumentsController.resolveScope(req, res);
      if (!teacherProfileId) return;

      const { id } = req.params;

      await DocumentsService.deleteFile(id, teacherProfileId);

      res.status(200).json({
        success: true,
        message: 'File deleted successfully',
        data: {},
      });
    } catch (error: any) {
      const status = error.message.includes('not found') ? 404 : 400;
      res.status(status).json({
        success: false,
        message: error.message || 'Failed to delete file',
      });
    }
  }
}
