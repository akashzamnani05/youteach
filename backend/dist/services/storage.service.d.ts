export declare class StorageService {
    static getUploadUrl(storagePath: string, mimeType: string): Promise<string>;
    static getDownloadUrl(storagePath: string, expiryMinutes?: number): Promise<string>;
    static deleteFile(storagePath: string): Promise<void>;
    static buildStoragePath(fileId: string, teacherProfileId: string, folderId: string | null, filename: string): string;
}
//# sourceMappingURL=storage.service.d.ts.map