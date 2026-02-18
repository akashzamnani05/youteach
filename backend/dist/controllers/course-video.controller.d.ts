import { Request, Response } from 'express';
export declare class CourseVideoController {
    static getVideosByModule(req: Request, res: Response): Promise<void>;
    static getVideosByCourse(req: Request, res: Response): Promise<void>;
    static getVideoById(req: Request, res: Response): Promise<void>;
    static uploadVideo(req: Request, res: Response): Promise<void>;
    static updateVideo(req: Request, res: Response): Promise<void>;
    static deleteVideo(req: Request, res: Response): Promise<void>;
    static reorderVideos(req: Request, res: Response): Promise<void>;
    static moveVideo(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=course-video.controller.d.ts.map