// src/services/announcements.service.ts

import { v4 as uuidv4 } from 'uuid';
import { query, queryOne } from '../config/database';
import {
  Announcement,
  CreateAnnouncementData,
  UpdateAnnouncementData,
} from '../types/announcements.types';

export class AnnouncementsService {
  // All announcements for a teacher, newest first
  static async getByTeacher(teacherProfileId: string): Promise<Announcement[]> {
    return query<Announcement>(
      `SELECT * FROM announcements
       WHERE teacher_profile_id = ?
       ORDER BY created_at DESC`,
      [teacherProfileId]
    );
  }

  // Announcements for a student — finds their teacher from enrollments (one teacher assumed)
  static async getForStudent(userId: string): Promise<Announcement[]> {
    return query<Announcement>(
      `SELECT a.*
       FROM announcements a
       JOIN (
         SELECT DISTINCT c.teacher_id
         FROM enrollments e
         JOIN student_profiles sp ON sp.id = e.student_id
         JOIN courses c ON c.id = e.course_id
         WHERE sp.user_id = ?
         LIMIT 1
       ) t ON t.teacher_id = a.teacher_profile_id
       ORDER BY a.created_at DESC`,
      [userId]
    );
  }

  static async create(
    data: CreateAnnouncementData,
    teacherProfileId: string
  ): Promise<Announcement> {
    const id = uuidv4();

    await query(
      `INSERT INTO announcements (id, title, description, teacher_profile_id)
       VALUES (?, ?, ?, ?)`,
      [id, data.title.trim(), data.description.trim(), teacherProfileId]
    );

    return (await queryOne<Announcement>(
      `SELECT * FROM announcements WHERE id = ?`, [id]
    ))!;
  }

  static async update(
    id: string,
    teacherProfileId: string,
    data: UpdateAnnouncementData
  ): Promise<Announcement> {
    const existing = await queryOne<Announcement>(
      `SELECT id FROM announcements WHERE id = ? AND teacher_profile_id = ?`,
      [id, teacherProfileId]
    );
    if (!existing) throw new Error('Announcement not found');

    const updates: string[] = [];
    const values: any[] = [];

    if (data.title !== undefined) {
      updates.push('title = ?');
      values.push(data.title.trim());
    }
    if (data.description !== undefined) {
      updates.push('description = ?');
      values.push(data.description.trim());
    }

    if (updates.length === 0) throw new Error('No fields to update');

    values.push(id, teacherProfileId);

    await query(
      `UPDATE announcements SET ${updates.join(', ')}
       WHERE id = ? AND teacher_profile_id = ?`,
      values
    );

    return (await queryOne<Announcement>(
      `SELECT * FROM announcements WHERE id = ?`, [id]
    ))!;
  }

  static async delete(id: string, teacherProfileId: string): Promise<void> {
    const existing = await queryOne<Announcement>(
      `SELECT id FROM announcements WHERE id = ? AND teacher_profile_id = ?`,
      [id, teacherProfileId]
    );
    if (!existing) throw new Error('Announcement not found');

    await query(
      `DELETE FROM announcements WHERE id = ? AND teacher_profile_id = ?`,
      [id, teacherProfileId]
    );
  }
}
