import { Webinar, CreateWebinarData, UpdateWebinarData } from '../types';
export declare class WebinarService {
    static getWebinarsByTeacher(teacherProfileId: string): Promise<Webinar[]>;
    static getWebinarById(webinarId: string, teacherProfileId: string): Promise<Webinar | null>;
    static createWebinar(data: CreateWebinarData, teacherProfileId: string): Promise<Webinar>;
    static updateWebinar(webinarId: string, teacherProfileId: string, data: UpdateWebinarData): Promise<Webinar>;
    static deleteWebinar(webinarId: string, teacherProfileId: string): Promise<boolean>;
    static getUpcomingWebinars(teacherProfileId: string): Promise<Webinar[]>;
    static getPastWebinars(teacherProfileId: string): Promise<Webinar[]>;
    static getRegisteredStudents(webinarId: string, teacherProfileId: string): Promise<any[]>;
}
//# sourceMappingURL=webinar.service.d.ts.map