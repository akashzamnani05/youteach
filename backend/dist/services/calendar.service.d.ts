import { CalendarEvent } from '../types/calendar.types';
export declare class CalendarService {
    /**
     * Teacher: all their webinars + all batch sessions in [start, end].
     */
    static getTeacherEvents(teacherProfileId: string, start: string, end: string): Promise<CalendarEvent[]>;
    /**
     * Student: registered webinars + batch sessions from batches they belong to.
     */
    static getStudentEvents(userId: string, start: string, end: string): Promise<CalendarEvent[]>;
}
//# sourceMappingURL=calendar.service.d.ts.map