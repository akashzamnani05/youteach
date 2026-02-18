import { DocumentFolder, DocumentFile, BreadcrumbItem, FolderContents, UploadUrlResponse, SaveFileParams, AccessibleTeacher } from '../types/documents.types';
export declare class DocumentsService {
    static validateStudentAccess(userId: string, teacherProfileId: string): Promise<boolean>;
    static getAccessibleTeachers(userId: string): Promise<AccessibleTeacher[]>;
    static getFolderContents(folderId: string | null, teacherProfileId: string): Promise<FolderContents>;
    static buildBreadcrumb(folderId: string | null, teacherProfileId: string): Promise<BreadcrumbItem[]>;
    static createFolder(name: string, parentFolderId: string | null, userId: string, teacherProfileId: string): Promise<DocumentFolder>;
    static renameFolder(folderId: string, name: string, teacherProfileId: string): Promise<DocumentFolder>;
    static deleteFolder(folderId: string, teacherProfileId: string): Promise<void>;
    static requestUploadUrl(filename: string, mimeType: string, sizeBytes: number, folderId: string | null, userId: string, teacherProfileId: string): Promise<UploadUrlResponse>;
    static saveFile(params: SaveFileParams, teacherProfileId: string): Promise<DocumentFile>;
    static getDownloadUrl(fileId: string, teacherProfileId: string): Promise<{
        download_url: string;
        filename: string;
    }>;
    static renameFile(fileId: string, name: string, teacherProfileId: string): Promise<DocumentFile>;
    static deleteFile(fileId: string, teacherProfileId: string): Promise<void>;
}
//# sourceMappingURL=documents.service.d.ts.map