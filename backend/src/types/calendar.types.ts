// src/types/calendar.types.ts

export interface CalendarEvent {
  id: string;
  type: 'webinar' | 'batch_session';
  title: string;
  description?: string | null;
  date: string;              // YYYY-MM-DD
  start_time: string;        // HH:MM
  duration_minutes: number;
  meeting_link?: string | null;
  meeting_password?: string | null;
  status?: string;
  // extra context
  batch_name?: string;
  batch_id?: string;
  teacher_name?: string;
}
