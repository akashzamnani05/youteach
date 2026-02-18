import { Request, Response } from 'express';
export declare class StudentCourseController {
    static getAllCourses(req: Request, res: Response): Promise<void>;
    static getEnrolledCourses(req: Request, res: Response): Promise<void>;
    static getCourseById(req: Request, res: Response): Promise<void>;
    static enrollInCourse(req: Request, res: Response): Promise<void>;
    static unenrollFromCourse(req: Request, res: Response): Promise<void>;
    static updateLastAccessed(req: Request, res: Response): Promise<void>;
    static updateProgress(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=student-course.controller.d.ts.map