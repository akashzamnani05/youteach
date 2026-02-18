import { Request, Response } from 'express';
export declare class WebinarController {
    static getAllWebinars(req: Request, res: Response): Promise<void>;
    static getWebinarById(req: Request, res: Response): Promise<void>;
    static createWebinar(req: Request, res: Response): Promise<void>;
    static updateWebinar(req: Request, res: Response): Promise<void>;
    static deleteWebinar(req: Request, res: Response): Promise<void>;
    static getUpcomingWebinars(req: Request, res: Response): Promise<void>;
    static getRegisteredStudents(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=webinar.controller.d.ts.map