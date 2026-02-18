import { StudentSignupData } from '../types';
interface Student {
    id: string;
    user_id: string;
    teacher_id: string;
    email: string;
    full_name: string;
    phone?: string;
    date_of_birth?: string;
    interests?: string[];
    education_level?: string;
    bio?: string;
    is_active: boolean;
    email_verified: boolean;
    created_at: Date;
}
export declare class StudentsService {
    static getStudentsByTeacherId(teacherId: string): Promise<Student[]>;
    static getStudentById(studentId: string, teacherId: string): Promise<Student | null>;
    static createStudent(data: StudentSignupData, teacherId: string): Promise<{
        student: Student;
        password: string;
    }>;
    static deleteStudent(studentId: string, teacherId: string): Promise<boolean>;
    static getStudentCount(teacherId: string): Promise<number>;
}
export {};
//# sourceMappingURL=students.service.d.ts.map