// lib/documents.ts

import apiClient from './api';
import {
  DocumentFolder,
  DocumentFile,
  FolderContents,
  AccessibleTeacher,
} from '../types/documents.types';

export const documentsApi = {
  // GET /api/documents/accessible-teachers
  // Students call this to get the list of teachers they're enrolled with.
  getAccessibleTeachers: async (): Promise<AccessibleTeacher[]> => {
    const response = await apiClient.get('/documents/accessible-teachers');
    return response.data.data.teachers;
  },

  // GET /api/documents/contents?folderId=&scopeTeacherId=
  // scopeTeacherId is required for students; omit for teacher accounts (backend auto-scopes).
  getFolderContents: async (
    folderId?: string | null,
    scopeTeacherId?: string | null
  ): Promise<FolderContents> => {
    const params: Record<string, string> = {};
    if (folderId) params.folderId = folderId;
    if (scopeTeacherId) params.scopeTeacherId = scopeTeacherId;
    const response = await apiClient.get('/documents/contents', { params });
    return response.data.data;
  },

  // POST /api/documents/folders
  createFolder: async (
    name: string,
    parentFolderId?: string | null,
    scopeTeacherId?: string | null
  ): Promise<DocumentFolder> => {
    const response = await apiClient.post('/documents/folders', {
      name,
      parent_folder_id: parentFolderId ?? null,
      scopeTeacherId: scopeTeacherId ?? undefined,
    });
    return response.data.data.folder;
  },

  // PUT /api/documents/folders/:id
  renameFolder: async (
    folderId: string,
    name: string,
    scopeTeacherId?: string | null
  ): Promise<DocumentFolder> => {
    const response = await apiClient.put(`/documents/folders/${folderId}`, {
      name,
      scopeTeacherId: scopeTeacherId ?? undefined,
    });
    return response.data.data.folder;
  },

  // DELETE /api/documents/folders/:id
  deleteFolder: async (folderId: string, scopeTeacherId?: string | null): Promise<void> => {
    const params: Record<string, string> = {};
    if (scopeTeacherId) params.scopeTeacherId = scopeTeacherId;
    await apiClient.delete(`/documents/folders/${folderId}`, { params });
  },

  // Full 3-step upload: request URL → PUT bytes to GCS via XHR → save metadata
  uploadFile: async (params: {
    file: File;
    folderId?: string | null;
    scopeTeacherId?: string | null;
    onProgress?: (pct: number) => void;
  }): Promise<DocumentFile> => {
    const { file, folderId, scopeTeacherId, onProgress } = params;

    // Step 1 — get signed PUT URL from backend
    const urlRes = await apiClient.post('/documents/files/upload-url', {
      filename: file.name,
      mime_type: file.type || 'application/octet-stream',
      size_bytes: file.size,
      folder_id: folderId ?? null,
      scopeTeacherId: scopeTeacherId ?? undefined,
    });

    const { file_id, signed_url, storage_path } = urlRes.data.data;

    // Step 2 — PUT file bytes directly to GCS (XHR for progress)
    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      if (onProgress) {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            onProgress(Math.round((e.loaded / e.total) * 100));
          }
        });
      }

      xhr.open('PUT', signed_url);
      xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`GCS upload failed: ${xhr.status} ${xhr.statusText}`));
        }
      };

      xhr.onerror = () => reject(new Error('Network error during upload'));
      xhr.send(file);
    });

    // Step 3 — save metadata to MySQL via backend
    const saveRes = await apiClient.post('/documents/files', {
      file_id,
      filename: file.name,
      original_filename: file.name,
      mime_type: file.type || 'application/octet-stream',
      size_bytes: file.size,
      folder_id: folderId ?? null,
      storage_path,
      scopeTeacherId: scopeTeacherId ?? undefined,
    });

    return saveRes.data.data.file;
  },

  // GET /api/documents/files/:id/download → triggers browser download
  downloadFile: async (
    fileId: string,
    displayName?: string,
    scopeTeacherId?: string | null
  ): Promise<void> => {
    const params: Record<string, string> = {};
    if (scopeTeacherId) params.scopeTeacherId = scopeTeacherId;
    const response = await apiClient.get(`/documents/files/${fileId}/download`, { params });
    const { download_url, filename } = response.data.data;

    const a = document.createElement('a');
    a.href = download_url;
    a.download = displayName || filename;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  },

  // PUT /api/documents/files/:id
  renameFile: async (
    fileId: string,
    name: string,
    scopeTeacherId?: string | null
  ): Promise<DocumentFile> => {
    const response = await apiClient.put(`/documents/files/${fileId}`, {
      name,
      scopeTeacherId: scopeTeacherId ?? undefined,
    });
    return response.data.data.file;
  },

  // DELETE /api/documents/files/:id
  deleteFile: async (fileId: string, scopeTeacherId?: string | null): Promise<void> => {
    const params: Record<string, string> = {};
    if (scopeTeacherId) params.scopeTeacherId = scopeTeacherId;
    await apiClient.delete(`/documents/files/${fileId}`, { params });
  },
};
