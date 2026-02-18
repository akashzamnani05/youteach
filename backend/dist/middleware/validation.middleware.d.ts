import { Request, Response, NextFunction } from 'express';
import { ValidationChain } from 'express-validator';
export declare const handleValidationErrors: (req: Request, res: Response, next: NextFunction) => void;
export declare const validateLogin: ValidationChain[];
export declare const validateTeacherSignup: ValidationChain[];
export declare const validateStudentSignup: ValidationChain[];
export declare const validateCreateWebinar: ValidationChain[];
export declare const validateUpdateWebinar: ValidationChain[];
//# sourceMappingURL=validation.middleware.d.ts.map