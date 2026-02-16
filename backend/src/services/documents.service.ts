// src/services/documents.service.ts

import { v4 as uuidv4 } from 'uuid';
import { query, queryOne } from '../config/database';
import { StorageService } from './storage.service';
import {
  DocumentFolder,
  DocumentFile,
  BreadcrumbItem,
  FolderContents,
  UploadUrlResponse,
  SaveFileParams,
  AccessibleTeacher,
} from '../types/documents.types';

export class DocumentsService {
  // ========== SCOPE VALIDATION ==========

  // Returns true if the student (by userId) is enrolled in at least one course by this teacher
  static async validateStudentAccess(
    userId: string,
    teacherProfileId: string
  ): Promise<boolean> {
    const row = await queryOne<{ cnt: number }>(
      `SELECT COUNT(*) as cnt
       FROM enrollments e
       JOIN student_profiles sp ON sp.id = e.student_id
       JOIN courses c ON c.id = e.course_id
       WHERE sp.user_id = ? AND c.teacher_id = ?`,
      [userId, teacherProfileId]
    );
    return (row?.cnt ?? 0) > 0;
  }

  // Returns all teachers a student is enrolled with (for the teacher picker UI)
  static async getAccessibleTeachers(userId: string): Promise<AccessibleTeacher[]> {
    return query<AccessibleTeacher>(
      `SELECT DISTINCT
         tp.id AS teacher_profile_id,
         u.full_name AS teacher_name
       FROM enrollments e
       JOIN student_profiles sp ON sp.id = e.student_id
       JOIN courses c ON c.id = e.course_id
       JOIN teacher_profiles tp ON tp.id = c.teacher_id
       JOIN users u ON u.id = tp.user_id
       WHERE sp.user_id = ?
       ORDER BY u.full_name ASC`,
      [userId]
    );
  }

  // ========== FOLDER CONTENTS ==========

  static async getFolderContents(
    folderId: string | null,
    teacherProfileId: string
  ): Promise<FolderContents> {
    const folders = await query<DocumentFolder>(
      `SELECT * FROM document_folders
       WHERE teacher_profile_id = ? AND parent_folder_id <=> ?
       ORDER BY name ASC`,
      [teacherProfileId, folderId]
    );

    const files = await query<DocumentFile>(
      `SELECT * FROM document_files
       WHERE teacher_profile_id = ? AND folder_id <=> ?
       ORDER BY name ASC`,
      [teacherProfileId, folderId]
    );

    const breadcrumb = await DocumentsService.buildBreadcrumb(folderId, teacherProfileId);

    return { folders, files, breadcrumb };
  }

  static async buildBreadcrumb(
    folderId: string | null,
    teacherProfileId: string
  ): Promise<BreadcrumbItem[]> {
    const crumbs: BreadcrumbItem[] = [{ id: null, name: 'Documents' }];
    if (!folderId) return crumbs;

    const ancestors: BreadcrumbItem[] = [];
    let currentId: string | null = folderId;

    while (currentId) {
      const folder = await queryOne<DocumentFolder>(
        `SELECT id, name, parent_folder_id FROM document_folders
         WHERE id = ? AND teacher_profile_id = ?`,
        [currentId, teacherProfileId]
      );
      if (!folder) break;
      ancestors.unshift({ id: folder.id, name: folder.name });
      currentId = folder.parent_folder_id;
    }

    return [...crumbs, ...ancestors];
  }

  // ========== FOLDERS ==========

  static async createFolder(
    name: string,
    parentFolderId: string | null,
    userId: string,
    teacherProfileId: string
  ): Promise<DocumentFolder> {
    if (!name || !name.trim()) throw new Error('Folder name is required');

    if (parentFolderId) {
      const parent = await queryOne<DocumentFolder>(
        `SELECT id FROM document_folders WHERE id = ? AND teacher_profile_id = ?`,
        [parentFolderId, teacherProfileId]
      );
      if (!parent) throw new Error('Parent folder not found');
    }

    const folderId = uuidv4();

    await query(
      `INSERT INTO document_folders
         (id, name, teacher_profile_id, parent_folder_id, created_by_user_id)
       VALUES (?, ?, ?, ?, ?)`,
      [folderId, name.trim(), teacherProfileId, parentFolderId ?? null, userId]
    );

    return (await queryOne<DocumentFolder>(
      `SELECT * FROM document_folders WHERE id = ?`,
      [folderId]
    ))!;
  }

  static async renameFolder(
    folderId: string,
    name: string,
    teacherProfileId: string
  ): Promise<DocumentFolder> {
    if (!name || !name.trim()) throw new Error('Folder name is required');

    const existing = await queryOne<DocumentFolder>(
      `SELECT id FROM document_folders WHERE id = ? AND teacher_profile_id = ?`,
      [folderId, teacherProfileId]
    );
    if (!existing) throw new Error('Folder not found');

    await query(
      `UPDATE document_folders SET name = ? WHERE id = ? AND teacher_profile_id = ?`,
      [name.trim(), folderId, teacherProfileId]
    );

    return (await queryOne<DocumentFolder>(
      `SELECT * FROM document_folders WHERE id = ?`, [folderId]
    ))!;
  }

  static async deleteFolder(folderId: string, teacherProfileId: string): Promise<void> {
    const existing = await queryOne<DocumentFolder>(
      `SELECT id FROM document_folders WHERE id = ? AND teacher_profile_id = ?`,
      [folderId, teacherProfileId]
    );
    if (!existing) throw new Error('Folder not found');

    const descendantFiles = await query<{ storage_path: string }>(
      `WITH RECURSIVE folder_tree AS (
         SELECT id FROM document_folders WHERE id = ?
         UNION ALL
         SELECT f.id FROM document_folders f
         INNER JOIN folder_tree ft ON f.parent_folder_id = ft.id
       )
       SELECT df.storage_path
       FROM document_files df
       WHERE df.folder_id IN (SELECT id FROM folder_tree)`,
      [folderId]
    );

    await query(`DELETE FROM document_folders WHERE id = ?`, [folderId]);

    for (const file of descendantFiles) {
      await StorageService.deleteFile(file.storage_path);
    }
  }

  // ========== FILES ==========

  static async requestUploadUrl(
    filename: string,
    mimeType: string,
    sizeBytes: number,
    folderId: string | null,
    userId: string,
    teacherProfileId: string
  ): Promise<UploadUrlResponse> {
    if (folderId) {
      const folder = await queryOne<DocumentFolder>(
        `SELECT id FROM document_folders WHERE id = ? AND teacher_profile_id = ?`,
        [folderId, teacherProfileId]
      );
      if (!folder) throw new Error('Folder not found');
    }

    const fileId = uuidv4();
    const storagePath = StorageService.buildStoragePath(fileId, teacherProfileId, folderId, filename);
    const signedUrl = await StorageService.getUploadUrl(storagePath, mimeType);

    return { file_id: fileId, signed_url: signedUrl, storage_path: storagePath };
  }

  static async saveFile(
    params: SaveFileParams,
    teacherProfileId: string
  ): Promise<DocumentFile> {
    const {
      file_id,
      name,
      original_filename,
      mime_type,
      size_bytes,
      folder_id,
      storage_path,
      uploaded_by_user_id,
    } = params;

    const downloadUrl = await StorageService.getDownloadUrl(
      storage_path,
      60 * 24 * 365 // 1 year
    );

    await query(
      `INSERT INTO document_files
         (id, name, original_filename, mime_type, size_bytes, teacher_profile_id,
          folder_id, uploaded_by_user_id, storage_path, download_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
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
      ]
    );

    return (await queryOne<DocumentFile>(
      `SELECT * FROM document_files WHERE id = ?`, [file_id]
    ))!;
  }

  static async getDownloadUrl(
    fileId: string,
    teacherProfileId: string
  ): Promise<{ download_url: string; filename: string }> {
    const file = await queryOne<DocumentFile>(
      `SELECT id, original_filename, storage_path FROM document_files
       WHERE id = ? AND teacher_profile_id = ?`,
      [fileId, teacherProfileId]
    );
    if (!file) throw new Error('File not found');

    const downloadUrl = await StorageService.getDownloadUrl(file.storage_path);
    return { download_url: downloadUrl, filename: file.original_filename };
  }

  static async renameFile(
    fileId: string,
    name: string,
    teacherProfileId: string
  ): Promise<DocumentFile> {
    if (!name || !name.trim()) throw new Error('File name is required');

    const existing = await queryOne<DocumentFile>(
      `SELECT id FROM document_files WHERE id = ? AND teacher_profile_id = ?`,
      [fileId, teacherProfileId]
    );
    if (!existing) throw new Error('File not found');

    await query(
      `UPDATE document_files SET name = ? WHERE id = ? AND teacher_profile_id = ?`,
      [name.trim(), fileId, teacherProfileId]
    );

    return (await queryOne<DocumentFile>(
      `SELECT * FROM document_files WHERE id = ?`, [fileId]
    ))!;
  }

  static async deleteFile(fileId: string, teacherProfileId: string): Promise<void> {
    const file = await queryOne<DocumentFile>(
      `SELECT id, storage_path FROM document_files WHERE id = ? AND teacher_profile_id = ?`,
      [fileId, teacherProfileId]
    );
    if (!file) throw new Error('File not found');

    await query(`DELETE FROM document_files WHERE id = ?`, [fileId]);
    await StorageService.deleteFile(file.storage_path);
  }
}
