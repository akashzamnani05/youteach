// src/services/student-webinar.service.ts

import { query, queryOne, transaction } from '../config/database';
import { StudentWebinarWithRegistration } from '../types';

export class StudentWebinarService {
  // Get all webinars from student's teacher with registration status
  static async getWebinarsForStudent(
    studentProfileId: string
  ): Promise<StudentWebinarWithRegistration[]> {
    const webinars = await query<any>(
      `SELECT 
        w.*,
        u.full_name as teacher_name,
        wr.id as registration_id,
        CASE WHEN wr.id IS NOT NULL THEN TRUE ELSE FALSE END as is_registered
       FROM webinars w
       JOIN teacher_profiles tp ON w.teacher_id = tp.id
       JOIN users u ON tp.user_id = u.id
       JOIN student_profiles sp ON sp.teacher_id = tp.id
       LEFT JOIN webinar_registrations wr ON w.id = wr.webinar_id AND wr.student_id = ?
       WHERE sp.id = ?
       ORDER BY w.scheduled_at DESC`,
      [studentProfileId, studentProfileId]
    );

    return webinars.map((w) => ({
      ...w,
      is_registered: Boolean(w.is_registered),
    }));
  }

  // Get registered webinars for student
  static async getRegisteredWebinars(
    studentProfileId: string
  ): Promise<StudentWebinarWithRegistration[]> {
    const webinars = await query<any>(
      `SELECT 
        w.*,
        u.full_name as teacher_name,
        wr.id as registration_id,
        TRUE as is_registered
       FROM webinars w
       JOIN teacher_profiles tp ON w.teacher_id = tp.id
       JOIN users u ON tp.user_id = u.id
       JOIN webinar_registrations wr ON w.id = wr.webinar_id
       WHERE wr.student_id = ?
       ORDER BY w.scheduled_at DESC`,
      [studentProfileId]
    );

    return webinars.map((w) => ({
      ...w,
      is_registered: true,
    }));
  }

  // Get single webinar by ID with registration status
  static async getWebinarById(
    webinarId: string,
    studentProfileId: string
  ): Promise<StudentWebinarWithRegistration | null> {
    const webinar = await queryOne<any>(
      `SELECT 
        w.*,
        u.full_name as teacher_name,
        wr.id as registration_id,
        CASE WHEN wr.id IS NOT NULL THEN TRUE ELSE FALSE END as is_registered
       FROM webinars w
       JOIN teacher_profiles tp ON w.teacher_id = tp.id
       JOIN users u ON tp.user_id = u.id
       JOIN student_profiles sp ON sp.teacher_id = tp.id
       LEFT JOIN webinar_registrations wr ON w.id = wr.webinar_id AND wr.student_id = ?
       WHERE w.id = ? AND sp.id = ?`,
      [studentProfileId, webinarId, studentProfileId]
    );

    if (!webinar) return null;

    return {
      ...webinar,
      is_registered: Boolean(webinar.is_registered),
    };
  }

  // Register for a webinar
  static async registerForWebinar(
    webinarId: string,
    studentProfileId: string
  ): Promise<{ registration_id: string }> {
    return await transaction(async (connection) => {
      // Check if webinar exists and belongs to student's teacher
      const [webinarRows] = await connection.execute(
        `SELECT w.id, w.max_participants
         FROM webinars w
         JOIN teacher_profiles tp ON w.teacher_id = tp.id
         JOIN student_profiles sp ON sp.teacher_id = tp.id
         WHERE w.id = ? AND sp.id = ?`,
        [webinarId, studentProfileId]
      );

      if ((webinarRows as any[]).length === 0) {
        throw new Error('Webinar not found or not available for this student');
      }

      const webinar = (webinarRows as any[])[0];

      // Check if already registered
      const [existingReg] = await connection.execute(
        'SELECT id FROM webinar_registrations WHERE webinar_id = ? AND student_id = ?',
        [webinarId, studentProfileId]
      );

      if ((existingReg as any[]).length > 0) {
        throw new Error('Already registered for this webinar');
      }

      // Check max participants limit
      if (webinar.max_participants) {
        const [countRows] = await connection.execute(
          'SELECT COUNT(*) as count FROM webinar_registrations WHERE webinar_id = ?',
          [webinarId]
        );
        const currentCount = (countRows as any[])[0].count;

        if (currentCount >= webinar.max_participants) {
          throw new Error('Webinar is full');
        }
      }

      // Insert registration
      await connection.execute(
        `INSERT INTO webinar_registrations (webinar_id, student_id, attended, attendance_duration_minutes)
         VALUES (?, ?, FALSE, 0)`,
        [webinarId, studentProfileId]
      );

      // Get the created registration
      const [registrationRows] = await connection.execute(
        'SELECT id FROM webinar_registrations WHERE webinar_id = ? AND student_id = ? ORDER BY created_at DESC LIMIT 1',
        [webinarId, studentProfileId]
      );

      return {
        registration_id: (registrationRows as any[])[0].id,
      };
    });
  }

  // Unregister from a webinar
  static async unregisterFromWebinar(
    webinarId: string,
    studentProfileId: string
  ): Promise<boolean> {
    return await transaction(async (connection) => {
      // Check if registration exists
      const [registrationRows] = await connection.execute(
        'SELECT id FROM webinar_registrations WHERE webinar_id = ? AND student_id = ?',
        [webinarId, studentProfileId]
      );

      if ((registrationRows as any[]).length === 0) {
        throw new Error('Not registered for this webinar');
      }

      // Delete registration
      await connection.execute(
        'DELETE FROM webinar_registrations WHERE webinar_id = ? AND student_id = ?',
        [webinarId, studentProfileId]
      );

      return true;
    });
  }

  // Get upcoming webinars for student
  static async getUpcomingWebinars(
    studentProfileId: string
  ): Promise<StudentWebinarWithRegistration[]> {
    const webinars = await query<any>(
      `SELECT 
        w.*,
        u.full_name as teacher_name,
        wr.id as registration_id,
        CASE WHEN wr.id IS NOT NULL THEN TRUE ELSE FALSE END as is_registered
       FROM webinars w
       JOIN teacher_profiles tp ON w.teacher_id = tp.id
       JOIN users u ON tp.user_id = u.id
       JOIN student_profiles sp ON sp.teacher_id = tp.id
       LEFT JOIN webinar_registrations wr ON w.id = wr.webinar_id AND wr.student_id = ?
       WHERE sp.id = ? AND w.scheduled_at > NOW()
       ORDER BY w.scheduled_at ASC`,
      [studentProfileId, studentProfileId]
    );

    return webinars.map((w) => ({
      ...w,
      is_registered: Boolean(w.is_registered),
    }));
  }
}