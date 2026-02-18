import { StudentWebinarWithRegistration } from '../types';
export declare class StudentWebinarService {
    static getWebinarsForStudent(studentProfileId: string): Promise<StudentWebinarWithRegistration[]>;
    static getRegisteredWebinars(studentProfileId: string): Promise<StudentWebinarWithRegistration[]>;
    static getWebinarById(webinarId: string, studentProfileId: string): Promise<StudentWebinarWithRegistration | null>;
    static registerForWebinar(webinarId: string, studentProfileId: string): Promise<{
        registration_id: string;
    }>;
    static unregisterFromWebinar(webinarId: string, studentProfileId: string): Promise<boolean>;
    static getUpcomingWebinars(studentProfileId: string): Promise<StudentWebinarWithRegistration[]>;
}
//# sourceMappingURL=student-webinar.service.d.ts.map