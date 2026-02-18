import { Request, Response } from 'express';
export declare class AuthController {
    static login(req: Request, res: Response): Promise<void>;
    static signupTeacher(req: Request, res: Response): Promise<void>;
    static signupStudent(req: Request, res: Response): Promise<void>;
    static createStudent(req: Request, res: Response): Promise<void>;
    static refreshToken(req: Request, res: Response): Promise<void>;
    static getCurrentUser(req: Request, res: Response): Promise<void>;
    static logout(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=auth.controller.d.ts.map