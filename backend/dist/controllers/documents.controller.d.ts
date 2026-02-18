import { Request, Response } from 'express';
export declare class DocumentsController {
    private static resolveScope;
    static getAccessibleTeachers(req: Request, res: Response): Promise<void>;
    static getFolderContents(req: Request, res: Response): Promise<void>;
    static createFolder(req: Request, res: Response): Promise<void>;
    static renameFolder(req: Request, res: Response): Promise<void>;
    static deleteFolder(req: Request, res: Response): Promise<void>;
    static requestUploadUrl(req: Request, res: Response): Promise<void>;
    static saveFile(req: Request, res: Response): Promise<void>;
    static getDownloadUrl(req: Request, res: Response): Promise<void>;
    static renameFile(req: Request, res: Response): Promise<void>;
    static deleteFile(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=documents.controller.d.ts.map