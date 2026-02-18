import { Request, Response } from 'express';
export declare class StudentWebinarController {
    static getAllWebinars(req: Request, res: Response): Promise<void>;
    static getRegisteredWebinars(req: Request, res: Response): Promise<void>;
    static getWebinarById(req: Request, res: Response): Promise<void>;
    static registerForWebinar(req: Request, res: Response): Promise<void>;
    static unregisterFromWebinar(req: Request, res: Response): Promise<void>;
    static getUpcomingWebinars(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=student-webinar.controller.d.ts.map