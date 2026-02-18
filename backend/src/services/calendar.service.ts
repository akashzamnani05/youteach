// src/services/calendar.service.ts

import { query } from '../config/database';
import { CalendarEvent } from '../types/calendar.types';

export class CalendarService {
  /**
   * Teacher: all their webinars + all batch sessions in [start, end].
   */
  static async getTeacherEvents(
    teacherProfileId: string,
    start: string,
    end: string
  ): Promise<CalendarEvent[]> {
    // 1. Webinars
    const webinars = await query<CalendarEvent>(
      `SELECT
         w.id,
         'webinar' AS type,
         w.title,
         w.description,
         DATE_FORMAT(w.scheduled_at, '%Y-%m-%d') AS date,
         DATE_FORMAT(w.scheduled_at, '%H:%i') AS start_time,
         w.duration_minutes,
         w.meeting_link,
         w.meeting_password,
         w.status
       FROM webinars w
       WHERE w.teacher_id = ?
         AND DATE(w.scheduled_at) BETWEEN ? AND ?
         AND w.status != 'cancelled'
       ORDER BY w.scheduled_at ASC`,
      [teacherProfileId, start, end]
    );

    // 2. Batch sessions
    const sessions = await query<CalendarEvent>(
      `SELECT
         bs.id,
         'batch_session' AS type,
         b.name AS title,
         b.description,
         DATE_FORMAT(bs.session_date, '%Y-%m-%d') AS date,
         DATE_FORMAT(b.class_time, '%H:%i') AS start_time,
         b.duration_minutes,
         b.meeting_link,
         NULL AS meeting_password,
         NULL AS status,
         b.name AS batch_name,
         b.id AS batch_id
       FROM batch_sessions bs
       JOIN batches b ON bs.batch_id = b.id
       WHERE b.teacher_profile_id = ?
         AND bs.session_date BETWEEN ? AND ?
       ORDER BY bs.session_date ASC, b.class_time ASC`,
      [teacherProfileId, start, end]
    );

    return [...webinars, ...sessions];
  }

  /**
   * Student: registered webinars + batch sessions from batches they belong to.
   */
  static async getStudentEvents(
    userId: string,
    start: string,
    end: string
  ): Promise<CalendarEvent[]> {
    // 1. Registered webinars
    const webinars = await query<CalendarEvent>(
      `SELECT
         w.id,
         'webinar' AS type,
         w.title,
         w.description,
         DATE_FORMAT(w.scheduled_at, '%Y-%m-%d') AS date,
         DATE_FORMAT(w.scheduled_at, '%H:%i') AS start_time,
         w.duration_minutes,
         w.meeting_link,
         w.meeting_password,
         w.status,
         u.full_name AS teacher_name
       FROM webinar_registrations wr
       JOIN webinars w ON wr.webinar_id = w.id
       JOIN student_profiles sp ON wr.student_id = sp.id
       JOIN teacher_profiles tp ON w.teacher_id = tp.id
       JOIN users u ON tp.user_id = u.id
       WHERE sp.user_id = ?
         AND DATE(w.scheduled_at) BETWEEN ? AND ?
         AND w.status != 'cancelled'
       ORDER BY w.scheduled_at ASC`,
      [userId, start, end]
    );

    // 2. Batch sessions (from batches the student is in)
    const sessions = await query<CalendarEvent>(
      `SELECT
         bs.id,
         'batch_session' AS type,
         b.name AS title,
         b.description,
         DATE_FORMAT(bs.session_date, '%Y-%m-%d') AS date,
         DATE_FORMAT(b.class_time, '%H:%i') AS start_time,
         b.duration_minutes,
         b.meeting_link,
         NULL AS meeting_password,
         NULL AS status,
         b.name AS batch_name,
         b.id AS batch_id,
         u.full_name AS teacher_name
       FROM batch_students bst
       JOIN batch_sessions bs ON bs.batch_id = bst.batch_id
       JOIN batches b ON bs.batch_id = b.id
       JOIN teacher_profiles tp ON b.teacher_profile_id = tp.id
       JOIN users u ON tp.user_id = u.id
       WHERE bst.student_user_id = ?
         AND bs.session_date BETWEEN ? AND ?
       ORDER BY bs.session_date ASC, b.class_time ASC`,
      [userId, start, end]
    );

    return [...webinars, ...sessions];
  }
}
