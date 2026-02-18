import { Request, Response } from 'express';
export declare class BatchesController {
    static getTeacherStudents(req: Request, res: Response): Promise<void>;
    static getBatches(req: Request, res: Response): Promise<void>;
    static createBatch(req: Request, res: Response): Promise<void>;
    static getBatch(req: Request, res: Response): Promise<void>;
    static updateBatch(req: Request, res: Response): Promise<void>;
    static deleteBatch(req: Request, res: Response): Promise<void>;
    static getBatchStudents(req: Request, res: Response): Promise<void>;
    static addStudent(req: Request, res: Response): Promise<void>;
    static removeStudent(req: Request, res: Response): Promise<void>;
    static getBatchSessions(req: Request, res: Response): Promise<void>;
    static createSessions(req: Request, res: Response): Promise<void>;
    static deleteSession(req: Request, res: Response): Promise<void>;
    static getSessionDetails(req: Request, res: Response): Promise<void>;
    static markAttendance(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=batches.controller.d.ts.map