import { Request, Response } from 'express';
export declare class GoogleOAuthController {
    static connect(req: Request, res: Response): Promise<void>;
    static callback(req: Request, res: Response): Promise<void>;
    static getStatus(req: Request, res: Response): Promise<void>;
    static disconnect(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=google-oauth.controller.d.ts.map