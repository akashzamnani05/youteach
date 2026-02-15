// src/services/students.service.ts

import { query, queryOne, transaction } from '../config/database';
import { StudentSignupData } from '../types';
import { hashPassword } from '../utils/password.utils';

interface Student {
  id: string;
  user_id: string;
  teacher_id: string;
  email: string;
  full_name: string;
  phone?: string;
  date_of_birth?: string;
  interests?: string[];
  education_level?: string;
  bio?: string;
  is_active: boolean;
  email_verified: boolean;
  created_at: Date;
}

export class StudentsService {
  // Get all students for a teacher
  static async getStudentsByTeacherId(teacherId: string): Promise<Student[]> {
    const students = await query<Student>(
      `SELECT 
        u.id,
        u.email,
        u.full_name,
        u.phone,
        u.is_active,
        u.email_verified,
        u.created_at,
        sp.id as profile_id,
        sp.user_id,
        sp.teacher_id,
        sp.date_of_birth,
        sp.interests,
        sp.education_level,
        sp.bio
       FROM student_profiles sp
       JOIN users u ON sp.user_id = u.id
       WHERE sp.teacher_id = ? AND u.is_active = 1
       ORDER BY u.created_at DESC`,
      [teacherId]
    );

    // Parse JSON fields
    return students.map(student => ({
      ...student,
      interests: student.interests ? JSON.parse(student.interests as any) : [],
    }));
  }

  // Get single student by ID (with teacher verification)
  static async getStudentById(studentId: string, teacherId: string): Promise<Student | null> {
    const student = await queryOne<Student>(
      `SELECT 
        u.id,
        u.email,
        u.full_name,
        u.phone,
        u.is_active,
        u.email_verified,
        u.created_at,
        sp.id as profile_id,
        sp.user_id,
        sp.teacher_id,
        sp.date_of_birth,
        sp.interests,
        sp.education_level,
        sp.bio
       FROM student_profiles sp
       JOIN users u ON sp.user_id = u.id
       WHERE sp.user_id = ? AND sp.teacher_id = ?`,
      [studentId, teacherId]
    );

    if (!student) return null;

    // Parse JSON fields
    return {
      ...student,
      interests: student.interests ? JSON.parse(student.interests as any) : [],
    };
  }

  // Create new student
  static async createStudent(
    data: StudentSignupData,
    teacherId: string
  ): Promise<{ student: Student; password: string }> {
    const { email, password, full_name, phone, date_of_birth, interests, education_level } = data;

    return await transaction(async (connection) => {
      // Check if email exists
      const [existingUser] = await connection.execute(
        'SELECT id FROM users WHERE email = ?',
        [email]
      );

      if ((existingUser as any[]).length > 0) {
        throw new Error('Email already registered');
      }

      // Hash password
      const password_hash = await hashPassword(password);

      // Insert user
      await connection.execute(
        `INSERT INTO users (email, password_hash, full_name, phone, is_active, email_verified)
         VALUES (?, ?, ?, ?, TRUE, FALSE)`,
        [email, password_hash, full_name, phone || null]
      );

      // Get the generated user ID
      const [userRows] = await connection.execute(
        'SELECT id FROM users WHERE email = ? ORDER BY created_at DESC LIMIT 1',
        [email]
      );
      const userId = (userRows as any[])[0].id;

      // Insert student profile with teacher_id
      await connection.execute(
        `INSERT INTO student_profiles (
          user_id, teacher_id, date_of_birth, interests, education_level
        ) VALUES (?, ?, ?, ?, ?)`,
        [
          userId,
          teacherId,
          date_of_birth || null,
          interests ? JSON.stringify(interests) : null,
          education_level || null,
        ]
      );

      // Get created student
      const [studentRows] = await connection.execute(
        `SELECT 
          u.id,
          u.email,
          u.full_name,
          u.phone,
          u.is_active,
          u.email_verified,
          u.created_at,
          sp.id as profile_id,
          sp.user_id,
          sp.teacher_id,
          sp.date_of_birth,
          sp.interests,
          sp.education_level,
          sp.bio
         FROM student_profiles sp
         JOIN users u ON sp.user_id = u.id
         WHERE sp.user_id = ?`,
        [userId]
      );

      const student = (studentRows as any[])[0];

      return {
        student: {
          ...student,
          interests: student.interests ? JSON.parse(student.interests) : [],
        },
        password,
      };
    });
  }

  // Delete student (soft delete by deactivating user)
  static async deleteStudent(studentId: string, teacherId: string): Promise<boolean> {
    return await transaction(async (connection) => {
      // Verify student belongs to teacher
      const [studentRows] = await connection.execute(
        'SELECT user_id FROM student_profiles WHERE user_id = ? AND teacher_id = ?',
        [studentId, teacherId]
      );

      if ((studentRows as any[]).length === 0) {
        throw new Error('Student not found or unauthorized');
      }

      const userId = (studentRows as any[])[0].user_id;

      // Soft delete - deactivate user
      await connection.execute(
        'UPDATE users SET is_active = FALSE WHERE id = ?',
        [userId]
      );

      // Alternatively, hard delete (uncomment if you want to completely remove):
      // await connection.execute('DELETE FROM users WHERE id = ?', [userId]);

      return true;
    });
  }

  // Get student count for teacher
  static async getStudentCount(teacherId: string): Promise<number> {
    const result = await queryOne<{ count: number }>(
      `SELECT COUNT(*) as count 
       FROM student_profiles sp
       JOIN users u ON sp.user_id = u.id
       WHERE sp.teacher_id = ? AND u.is_active = TRUE`,
      [teacherId]
    );

    return result?.count || 0;
  }


  
}