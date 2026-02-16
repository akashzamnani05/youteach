// src/services/storage.service.ts

import { storageBucket } from '../config/firebase.config';

export class StorageService {
  // Generate a signed PUT URL for browser-direct upload
  static async getUploadUrl(storagePath: string, mimeType: string): Promise<string> {
    const expiryMinutes = parseInt(
      process.env.FIREBASE_SIGNED_URL_EXPIRY_MINUTES || '15',
      10
    );

    const file = storageBucket.file(storagePath);

    const [signedUrl] = await file.getSignedUrl({
      action: 'write',
      expires: Date.now() + expiryMinutes * 60 * 1000,
      contentType: mimeType,
    });

    return signedUrl;
  }

  // Generate a signed GET URL for download (fresh each call)
  static async getDownloadUrl(
    storagePath: string,
    expiryMinutes: number = 15
  ): Promise<string> {
    const file = storageBucket.file(storagePath);

    const [signedUrl] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + expiryMinutes * 60 * 1000,
    });

    return signedUrl;
  }

  // Delete a file from GCS
  static async deleteFile(storagePath: string): Promise<void> {
    const file = storageBucket.file(storagePath);
    await file.delete({ ignoreNotFound: true });
  }

  // Build the GCS object path — includes teacherProfileId for per-teacher isolation
  // Path: documents/{teacherProfileId}/{folderId|root}/{fileId}-{safeFilename}
  static buildStoragePath(
    fileId: string,
    teacherProfileId: string,
    folderId: string | null,
    filename: string
  ): string {
    const safe = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const folder = folderId ? folderId : 'root';
    return `documents/${teacherProfileId}/${folder}/${fileId}-${safe}`;
  }
}
