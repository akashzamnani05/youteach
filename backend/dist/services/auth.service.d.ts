import { UserWithRole, LoginCredentials, TeacherSignupData, StudentSignupData, AuthTokens } from '../types';
export declare class AuthService {
    static login(credentials: LoginCredentials): Promise<{
        user: UserWithRole;
        tokens: AuthTokens;
    }>;
    static signupTeacher(data: TeacherSignupData): Promise<{
        user: UserWithRole;
        tokens: AuthTokens;
    }>;
    static signupStudent(data: StudentSignupData): Promise<{
        user: UserWithRole;
        tokens: AuthTokens;
    }>;
    static createStudentForTeacher(data: StudentSignupData, teacherId: string): Promise<{
        user: UserWithRole;
        password: string;
    }>;
    static getUserWithRole(userId: string): Promise<UserWithRole | null>;
    static refreshTokens(userId: string, email: string, role: 'teacher' | 'student' | 'none'): Promise<AuthTokens>;
}
//# sourceMappingURL=auth.service.d.ts.map