import { Request, Response } from 'express';
export declare class CourseController {
    static getAllCourses(req: Request, res: Response): Promise<void>;
    static getCourseById(req: Request, res: Response): Promise<void>;
    static createCourse(req: Request, res: Response): Promise<void>;
    static updateCourse(req: Request, res: Response): Promise<void>;
    static deleteCourse(req: Request, res: Response): Promise<void>;
    static getModulesByCourse(req: Request, res: Response): Promise<void>;
    static getModuleById(req: Request, res: Response): Promise<void>;
    static createModule(req: Request, res: Response): Promise<void>;
    static updateModule(req: Request, res: Response): Promise<void>;
    static deleteModule(req: Request, res: Response): Promise<void>;
    static reorderModules(req: Request, res: Response): Promise<void>;
    static getEnrolledStudents(req: Request, res: Response): Promise<void>;
    static getEnrollmentStats(req: Request, res: Response): Promise<void>;
    static getEnrolledStudentById(req: Request, res: Response): Promise<void>;
    static unenrollStudent(req: Request, res: Response): Promise<void>;
    static uploadThumbnail(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=course.controller.d.ts.map