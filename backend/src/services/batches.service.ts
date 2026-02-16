// src/services/batches.service.ts

import { v4 as uuidv4 } from 'uuid';
import { query, queryOne } from '../config/database';
import {
  Batch,
  BatchStudent,
  BatchSession,
  AttendanceRecord,
  TeacherStudent,
  CreateBatchData,
  UpdateBatchData,
  CreateSessionsData,
  MarkAttendanceItem,
} from '../types/batches.types';

export class BatchesService {
  // ─── Helpers ──────────────────────────────────────────────────

  /** Generate session dates from CreateBatchData or CreateSessionsData */
  private static generateSessionDates(
    data: CreateBatchData | CreateSessionsData
  ): string[] {
    if (data.session_type === 'single') {
      if (!data.session_date) throw new Error('session_date is required for single session');
      return [data.session_date];
    }
    if (!data.start_date || !data.end_date)
      throw new Error('start_date and end_date are required for range');
    if (!data.days_of_week || data.days_of_week.length === 0)
      throw new Error('days_of_week is required for range');

    const dates: string[] = [];
    const current = new Date(data.start_date + 'T00:00:00');
    const end = new Date(data.end_date + 'T00:00:00');

    while (current <= end) {
      if (data.days_of_week.includes(current.getDay())) {
        // Use local-timezone date parts to avoid UTC offset shifting the date backward
        // (toISOString() would subtract 5.5 h for IST, changing Feb 16 00:00 IST → Feb 15 UTC)
        const yyyy = current.getFullYear();
        const mm   = String(current.getMonth() + 1).padStart(2, '0');
        const dd   = String(current.getDate()).padStart(2, '0');
        dates.push(`${yyyy}-${mm}-${dd}`);
      }
      current.setDate(current.getDate() + 1);
    }
    return dates;
  }

  // ─── Teacher's student roster ─────────────────────────────────

  static async getTeacherStudents(teacherProfileId: string): Promise<TeacherStudent[]> {
    return query<TeacherStudent>(
      `SELECT DISTINCT u.id AS user_id, u.full_name, u.email
       FROM enrollments e
       JOIN student_profiles sp ON e.student_id = sp.id
       JOIN users u ON sp.user_id = u.id
       JOIN courses c ON e.course_id = c.id
       WHERE c.teacher_id = ? AND e.status = 'active'
       ORDER BY u.full_name ASC`,
      [teacherProfileId]
    );
  }

  // ─── Batch CRUD ───────────────────────────────────────────────

  static async getTeacherBatches(teacherProfileId: string): Promise<Batch[]> {
    return query<Batch>(
      `SELECT b.*,
         (SELECT COUNT(*) FROM batch_students bs WHERE bs.batch_id = b.id) AS student_count,
         (SELECT COUNT(*) FROM batch_sessions bsess WHERE bsess.batch_id = b.id) AS session_count
       FROM batches b
       WHERE b.teacher_profile_id = ?
       ORDER BY b.created_at DESC`,
      [teacherProfileId]
    );
  }

  static async getStudentBatches(userId: string): Promise<Batch[]> {
    return query<Batch>(
      `SELECT b.*,
         u.full_name AS teacher_name,
         (SELECT COUNT(*) FROM batch_students bs2 WHERE bs2.batch_id = b.id) AS student_count,
         (SELECT bsess.session_date
          FROM batch_sessions bsess
          WHERE bsess.batch_id = b.id AND bsess.session_date >= CURDATE()
          ORDER BY bsess.session_date ASC LIMIT 1) AS next_session_date
       FROM batch_students bs
       JOIN batches b ON bs.batch_id = b.id
       JOIN teacher_profiles tp ON b.teacher_profile_id = tp.id
       JOIN users u ON tp.user_id = u.id
       WHERE bs.student_user_id = ?
       ORDER BY b.name ASC`,
      [userId]
    );
  }

  static async getBatch(batchId: string, teacherProfileId: string): Promise<Batch> {
    const batch = await queryOne<Batch>(
      `SELECT b.*,
         (SELECT COUNT(*) FROM batch_students bs WHERE bs.batch_id = b.id) AS student_count,
         (SELECT COUNT(*) FROM batch_sessions bsess WHERE bsess.batch_id = b.id) AS session_count
       FROM batches b
       WHERE b.id = ? AND b.teacher_profile_id = ?`,
      [batchId, teacherProfileId]
    );
    if (!batch) throw new Error('Batch not found');
    return batch;
  }

  static async createBatch(data: CreateBatchData, teacherProfileId: string): Promise<Batch> {
    const id = uuidv4();
    await query(
      `INSERT INTO batches (id, teacher_profile_id, name, description, meeting_link, class_time, duration_minutes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        teacherProfileId,
        data.name.trim(),
        data.description?.trim() || null,
        data.meeting_link.trim(),
        data.class_time,
        data.duration_minutes || 60,
      ]
    );

    // Add students
    for (const studentUserId of data.student_user_ids ?? []) {
      await query(
        `INSERT IGNORE INTO batch_students (id, batch_id, student_user_id) VALUES (?, ?, ?)`,
        [uuidv4(), id, studentUserId]
      );
    }

    // Create sessions
    const dates = BatchesService.generateSessionDates(data);
    for (const date of dates) {
      await query(
        `INSERT IGNORE INTO batch_sessions (id, batch_id, session_date) VALUES (?, ?, ?)`,
        [uuidv4(), id, date]
      );
    }

    const batch = await queryOne<Batch>(`SELECT * FROM batches WHERE id = ?`, [id]);
    return batch!;
  }

  static async updateBatch(
    batchId: string,
    teacherProfileId: string,
    data: UpdateBatchData
  ): Promise<Batch> {
    const existing = await queryOne<{ id: string }>(
      `SELECT id FROM batches WHERE id = ? AND teacher_profile_id = ?`,
      [batchId, teacherProfileId]
    );
    if (!existing) throw new Error('Batch not found');

    const fields: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name.trim()); }
    if (data.description !== undefined) { fields.push('description = ?'); values.push(data.description?.trim() || null); }
    if (data.meeting_link !== undefined) { fields.push('meeting_link = ?'); values.push(data.meeting_link.trim()); }
    if (data.class_time !== undefined) { fields.push('class_time = ?'); values.push(data.class_time); }
    if (data.duration_minutes !== undefined) { fields.push('duration_minutes = ?'); values.push(data.duration_minutes); }

    if (fields.length > 0) {
      values.push(batchId);
      await query(`UPDATE batches SET ${fields.join(', ')} WHERE id = ?`, values);
    }

    const batch = await queryOne<Batch>(`SELECT * FROM batches WHERE id = ?`, [batchId]);
    return batch!;
  }

  static async deleteBatch(batchId: string, teacherProfileId: string): Promise<void> {
    const existing = await queryOne<{ id: string }>(
      `SELECT id FROM batches WHERE id = ? AND teacher_profile_id = ?`,
      [batchId, teacherProfileId]
    );
    if (!existing) throw new Error('Batch not found');
    await query(`DELETE FROM batches WHERE id = ?`, [batchId]);
  }

  // ─── Student management ───────────────────────────────────────

  static async getBatchStudents(batchId: string, teacherProfileId: string): Promise<BatchStudent[]> {
    const batch = await queryOne<{ id: string }>(
      `SELECT id FROM batches WHERE id = ? AND teacher_profile_id = ?`,
      [batchId, teacherProfileId]
    );
    if (!batch) throw new Error('Batch not found');

    return query<BatchStudent>(
      `SELECT bs.*, u.full_name, u.email
       FROM batch_students bs
       JOIN users u ON bs.student_user_id = u.id
       WHERE bs.batch_id = ?
       ORDER BY u.full_name ASC`,
      [batchId]
    );
  }

  static async addStudent(
    batchId: string,
    studentUserId: string,
    teacherProfileId: string
  ): Promise<void> {
    const batch = await queryOne<{ id: string }>(
      `SELECT id FROM batches WHERE id = ? AND teacher_profile_id = ?`,
      [batchId, teacherProfileId]
    );
    if (!batch) throw new Error('Batch not found');

    // Verify student is enrolled with this teacher
    const enrolled = await queryOne<{ id: string }>(
      `SELECT e.id
       FROM enrollments e
       JOIN student_profiles sp ON e.student_id = sp.id
       JOIN courses c ON e.course_id = c.id
       WHERE sp.user_id = ? AND c.teacher_id = ? AND e.status = 'active'
       LIMIT 1`,
      [studentUserId, teacherProfileId]
    );
    if (!enrolled) throw new Error('Student is not enrolled with this teacher');

    await query(
      `INSERT IGNORE INTO batch_students (id, batch_id, student_user_id) VALUES (?, ?, ?)`,
      [uuidv4(), batchId, studentUserId]
    );
  }

  static async removeStudent(
    batchId: string,
    studentUserId: string,
    teacherProfileId: string
  ): Promise<void> {
    const batch = await queryOne<{ id: string }>(
      `SELECT id FROM batches WHERE id = ? AND teacher_profile_id = ?`,
      [batchId, teacherProfileId]
    );
    if (!batch) throw new Error('Batch not found');

    await query(
      `DELETE FROM batch_students WHERE batch_id = ? AND student_user_id = ?`,
      [batchId, studentUserId]
    );
  }

  // ─── Sessions ─────────────────────────────────────────────────

  static async getBatchSessions(batchId: string, teacherProfileId: string): Promise<BatchSession[]> {
    const batch = await queryOne<{ id: string }>(
      `SELECT id FROM batches WHERE id = ? AND teacher_profile_id = ?`,
      [batchId, teacherProfileId]
    );
    if (!batch) throw new Error('Batch not found');

    return query<BatchSession>(
      `SELECT * FROM batch_sessions WHERE batch_id = ? ORDER BY session_date ASC`,
      [batchId]
    );
  }

  static async createSessions(
    batchId: string,
    data: CreateSessionsData,
    teacherProfileId: string
  ): Promise<BatchSession[]> {
    const batch = await queryOne<{ id: string }>(
      `SELECT id FROM batches WHERE id = ? AND teacher_profile_id = ?`,
      [batchId, teacherProfileId]
    );
    if (!batch) throw new Error('Batch not found');

    const dates = BatchesService.generateSessionDates(data);
    if (dates.length === 0) throw new Error('No valid dates generated for the given range and days');

    for (const date of dates) {
      await query(
        `INSERT IGNORE INTO batch_sessions (id, batch_id, session_date) VALUES (?, ?, ?)`,
        [uuidv4(), batchId, date]
      );
    }

    return query<BatchSession>(
      `SELECT * FROM batch_sessions WHERE batch_id = ? AND session_date IN (${dates.map(() => '?').join(',')}) ORDER BY session_date ASC`,
      [batchId, ...dates]
    );
  }

  static async deleteSession(sessionId: string, teacherProfileId: string): Promise<void> {
    const session = await queryOne<{ id: string }>(
      `SELECT bs.id FROM batch_sessions bs
       JOIN batches b ON bs.batch_id = b.id
       WHERE bs.id = ? AND b.teacher_profile_id = ?`,
      [sessionId, teacherProfileId]
    );
    if (!session) throw new Error('Session not found');
    await query(`DELETE FROM batch_sessions WHERE id = ?`, [sessionId]);
  }

  // ─── Attendance ───────────────────────────────────────────────

  static async getSessionWithAttendance(
    sessionId: string,
    teacherProfileId: string
  ): Promise<{ session: BatchSession; batch: Batch; attendance: AttendanceRecord[] }> {
    const session = await queryOne<BatchSession>(
      `SELECT bs.*
       FROM batch_sessions bs
       JOIN batches b ON bs.batch_id = b.id
       WHERE bs.id = ? AND b.teacher_profile_id = ?`,
      [sessionId, teacherProfileId]
    );
    if (!session) throw new Error('Session not found');

    const batch = await queryOne<Batch>(`SELECT * FROM batches WHERE id = ?`, [session.batch_id]);

    const attendance = await query<AttendanceRecord>(
      `SELECT
         ba.id,
         ? AS session_id,
         bstu.student_user_id,
         COALESCE(ba.status, 'absent') AS status,
         ba.marked_at,
         u.full_name,
         u.email
       FROM batch_students bstu
       JOIN users u ON bstu.student_user_id = u.id
       LEFT JOIN batch_attendance ba
         ON ba.session_id = ? AND ba.student_user_id = bstu.student_user_id
       WHERE bstu.batch_id = ?
       ORDER BY u.full_name ASC`,
      [sessionId, sessionId, session.batch_id]
    );

    return { session, batch: batch!, attendance };
  }

  static async markAttendance(
    sessionId: string,
    records: MarkAttendanceItem[],
    teacherProfileId: string
  ): Promise<void> {
    const session = await queryOne<{ id: string }>(
      `SELECT bs.id
       FROM batch_sessions bs
       JOIN batches b ON bs.batch_id = b.id
       WHERE bs.id = ? AND b.teacher_profile_id = ?`,
      [sessionId, teacherProfileId]
    );
    if (!session) throw new Error('Session not found');

    for (const record of records) {
      await query(
        `INSERT INTO batch_attendance (id, session_id, student_user_id, status)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE status = VALUES(status), marked_at = CURRENT_TIMESTAMP`,
        [uuidv4(), sessionId, record.student_user_id, record.status]
      );
    }
  }
}
