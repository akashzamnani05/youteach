import { Request, Response, NextFunction } from 'express';
import { TokenPayload } from '../types';
declare global {
    namespace Express {
        interface Request {
            user?: TokenPayload;
        }
    }
}
export declare const authenticate: (req: Request, res: Response, next: NextFunction) => void;
export declare const verifyRefresh: (req: Request, res: Response, next: NextFunction) => void;
export declare const authorize: (...roles: Array<"teacher" | "student">) => (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.middleware.d.ts.map