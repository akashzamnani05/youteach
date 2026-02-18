export interface CalendarEvent {
    id: string;
    type: 'webinar' | 'batch_session';
    title: string;
    description?: string | null;
    date: string;
    start_time: string;
    duration_minutes: number;
    meeting_link?: string | null;
    meeting_password?: string | null;
    status?: string;
    batch_name?: string;
    batch_id?: string;
    teacher_name?: string;
}
//# sourceMappingURL=calendar.types.d.ts.map