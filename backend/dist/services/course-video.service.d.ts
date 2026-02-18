import { CourseVideo, CreateCourseVideoData, UpdateCourseVideoData } from '../types/course-video.types';
export declare class CourseVideoService {
    static getVideosByModule(moduleId: string, teacherId: string): Promise<CourseVideo[]>;
    static getVideosByCourse(courseId: string, teacherId: string): Promise<CourseVideo[]>;
    static getVideoById(videoId: string, teacherId: string): Promise<CourseVideo | null>;
    static createVideoEntry(data: CreateCourseVideoData, teacherId: string): Promise<CourseVideo>;
    static updateVideoEntry(videoId: string, teacherId: string, data: UpdateCourseVideoData): Promise<CourseVideo>;
    static deleteVideoEntry(videoId: string, teacherId: string): Promise<boolean>;
    static getVideoCount(courseId: string): Promise<number>;
    static reorderVideos(moduleId: string, teacherProfileId: string, videos: {
        id: string;
        order_index: number;
    }[]): Promise<void>;
    static moveVideo(videoId: string, teacherProfileId: string, newModuleId: string, newOrderIndex: number): Promise<any>;
}
//# sourceMappingURL=course-video.service.d.ts.map