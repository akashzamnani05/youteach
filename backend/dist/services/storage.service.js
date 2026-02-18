"use strict";
// src/services/storage.service.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageService = void 0;
const firebase_config_1 = require("../config/firebase.config");
class StorageService {
    // Generate a signed PUT URL for browser-direct upload
    static async getUploadUrl(storagePath, mimeType) {
        const expiryMinutes = parseInt(process.env.FIREBASE_SIGNED_URL_EXPIRY_MINUTES || '15', 10);
        const file = firebase_config_1.storageBucket.file(storagePath);
        const [signedUrl] = await file.getSignedUrl({
            action: 'write',
            expires: Date.now() + expiryMinutes * 60 * 1000,
            contentType: mimeType,
        });
        return signedUrl;
    }
    // Generate a signed GET URL for download (fresh each call)
    static async getDownloadUrl(storagePath, expiryMinutes = 15) {
        const file = firebase_config_1.storageBucket.file(storagePath);
        const [signedUrl] = await file.getSignedUrl({
            action: 'read',
            expires: Date.now() + expiryMinutes * 60 * 1000,
        });
        return signedUrl;
    }
    // Delete a file from GCS
    static async deleteFile(storagePath) {
        const file = firebase_config_1.storageBucket.file(storagePath);
        await file.delete({ ignoreNotFound: true });
    }
    // Build the GCS object path — includes teacherProfileId for per-teacher isolation
    // Path: documents/{teacherProfileId}/{folderId|root}/{fileId}-{safeFilename}
    static buildStoragePath(fileId, teacherProfileId, folderId, filename) {
        const safe = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
        const folder = folderId ? folderId : 'root';
        return `documents/${teacherProfileId}/${folder}/${fileId}-${safe}`;
    }
}
exports.StorageService = StorageService;
//# sourceMappingURL=storage.service.js.map