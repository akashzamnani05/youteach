export interface TeacherDashboardData {
    stats: {
        totalCourses: number;
        totalStudents: number;
        upcomingWebinarsCount: number;
    };
    upcomingWebinars: {
        id: string;
        title: string;
        scheduled_at: string;
        duration_minutes: number;
        meeting_link: string | null;
        registration_count: number;
    }[];
    upcomingBatchSessions: {
        id: string;
        batch_id: string;
        batch_name: string;
        session_date: string;
        class_time: string;
        duration_minutes: number;
        meeting_link: string;
        student_count: number;
    }[];
}
export interface StudentDashboardData {
    stats: {
        enrolledCourses: number;
        upcomingWebinarsCount: number;
    };
    enrolledCourses: {
        id: string;
        title: string;
        thumbnail_url: string | null;
        progress_percentage: number;
        teacher_name: string;
        last_accessed_at: string | null;
    }[];
    upcomingWebinars: {
        id: string;
        title: string;
        scheduled_at: string;
        duration_minutes: number;
        meeting_link: string | null;
        teacher_name: string;
    }[];
    upcomingBatchSessions: {
        id: string;
        batch_id: string;
        batch_name: string;
        session_date: string;
        class_time: string;
        duration_minutes: number;
        meeting_link: string;
        teacher_name: string;
    }[];
}
export declare class DashboardService {
    static getTeacherDashboard(teacherProfileId: string): Promise<TeacherDashboardData>;
    static getStudentDashboard(userId: string): Promise<StudentDashboardData>;
}
//# sourceMappingURL=dashboard.service.d.ts.map