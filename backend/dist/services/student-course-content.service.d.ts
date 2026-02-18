interface CourseContent {
    id: string;
    module_id: string;
    content_type: string;
    title: string;
    description?: string;
    youtube_video_id?: string;
    google_drive_file_id?: string;
    content_url?: string;
    text_content?: string;
    duration_minutes?: number;
    file_size_mb?: number;
    order_index: number;
    is_free_preview: boolean;
    created_at: Date;
    updated_at: Date;
}
interface CourseModule {
    id: string;
    course_id: string;
    title: string;
    description?: string;
    order_index: number;
    created_at: Date;
    updated_at: Date;
}
export declare class StudentCourseContentService {
    static getModulesByCourse(courseId: string, studentId: string): Promise<CourseModule[]>;
    static getContentByModule(moduleId: string, studentId: string): Promise<CourseContent[]>;
    static getAllContentByCourse(courseId: string, studentId: string): Promise<{
        content: CourseContent[];
        id: string;
        course_id: string;
        title: string;
        description?: string;
        order_index: number;
        created_at: Date;
        updated_at: Date;
    }[]>;
}
export {};
//# sourceMappingURL=student-course-content.service.d.ts.map