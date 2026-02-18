export interface User {
    id: string;
    email: string;
    full_name: string;
    phone?: string;
    profile_picture_url?: string;
    is_active: boolean;
    email_verified: boolean;
    created_at: Date;
    updated_at: Date;
}
export interface TeacherProfile {
    id: string;
    user_id: string;
    bio?: string;
    headline?: string;
    specializations?: string[];
    experience_years?: number;
    qualifications?: string;
    website_slug: string;
    rating: number;
    total_students: number;
    total_courses: number;
    is_verified: boolean;
    hourly_rate?: number;
    social_links?: Record<string, string>;
    created_at: Date;
    updated_at: Date;
}
export interface StudentProfile {
    id: string;
    user_id: string;
    teacher_id: string | null;
    date_of_birth?: Date;
    interests?: string[];
    education_level?: string;
    bio?: string;
    created_at: Date;
    updated_at: Date;
}
export interface UserWithRole extends User {
    role: 'teacher' | 'student' | 'none';
    teacher_profile_id?: string;
    student_profile_id?: string;
    website_slug?: string;
}
export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}
export interface TokenPayload {
    userId: string;
    email: string;
    role: 'teacher' | 'student' | 'none';
}
export interface LoginCredentials {
    email: string;
    password: string;
    rememberMe?: boolean;
}
export interface SignupData {
    email: string;
    password: string;
    full_name: string;
    phone?: string;
}
export interface TeacherSignupData extends SignupData {
    bio?: string;
    headline?: string;
    specializations?: string[];
    experience_years?: number;
    hourly_rate?: number;
}
export interface StudentSignupData extends SignupData {
    date_of_birth?: string;
    interests?: string[];
    education_level?: string;
}
export interface TeacherCreateStudentData {
    email: string;
    password: string;
    full_name: string;
    phone?: string;
    date_of_birth?: string;
    interests?: string[];
    education_level?: string;
    teacher_id: string;
}
export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
}
export interface ApiError {
    success: false;
    message: string;
    errors?: Array<{
        field: string;
        message: string;
    }>;
}
declare global {
    namespace Express {
        interface Request {
            user?: TokenPayload;
        }
    }
}
export interface Webinar {
    id: string;
    teacher_id: string;
    course_id?: string | null;
    title: string;
    description?: string;
    scheduled_at: Date;
    duration_minutes: number;
    meeting_link?: string;
    meeting_password?: string;
    max_participants?: number;
    is_recorded: boolean;
    recording_youtube_id?: string;
    status: 'scheduled' | 'live' | 'completed' | 'cancelled';
    reminder_sent: boolean;
    created_at: Date;
    updated_at: Date;
}
export interface CreateWebinarData {
    title: string;
    description?: string;
    scheduled_at: string;
    duration_minutes: number;
    meeting_link: string;
    meeting_password?: string;
    max_participants?: number;
    is_recorded?: boolean;
    course_id?: string;
}
export interface UpdateWebinarData {
    title?: string;
    description?: string;
    scheduled_at?: string;
    duration_minutes?: number;
    meeting_link?: string;
    meeting_password?: string;
    max_participants?: number;
    is_recorded?: boolean;
    status?: 'scheduled' | 'live' | 'completed' | 'cancelled';
}
export interface WebinarRegistration {
    id: string;
    webinar_id: string;
    student_id: string;
    registered_at: Date;
    attended: boolean;
    attendance_duration_minutes: number;
    created_at: Date;
}
export interface StudentWebinarWithRegistration extends Webinar {
    is_registered: boolean;
    registration_id?: string;
    teacher_name?: string;
}
//# sourceMappingURL=index.d.ts.map