import { Announcement, CreateAnnouncementData, UpdateAnnouncementData } from '../types/announcements.types';
export declare class AnnouncementsService {
    static getByTeacher(teacherProfileId: string): Promise<Announcement[]>;
    static getForStudent(userId: string): Promise<Announcement[]>;
    static create(data: CreateAnnouncementData, teacherProfileId: string): Promise<Announcement>;
    static update(id: string, teacherProfileId: string, data: UpdateAnnouncementData): Promise<Announcement>;
    static delete(id: string, teacherProfileId: string): Promise<void>;
}
//# sourceMappingURL=announcements.service.d.ts.map