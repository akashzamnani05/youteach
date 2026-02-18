// src/services/student-course.service.ts

import { query } from '../config/database';
import { Course, Enrollment } from '../types/course.types';
import { CourseWithEnrollment, EnrolledCourseDetails } from '../types/course.types';


export class StudentCourseService {
  // Get all available courses with enrollment status for student (scoped to their teacher)
  static async getAllCoursesForStudent(studentId: string): Promise<CourseWithEnrollment[]> {
    const courses = await query<CourseWithEnrollment>(
      `SELECT
        c.*,
        CASE WHEN e.id IS NOT NULL AND e.status IN ('active', 'completed') THEN TRUE ELSE FALSE END as is_enrolled,
        e.status as enrollment_status,
        e.progress_percentage,
        e.enrollment_date,
        e.last_accessed_at
       FROM courses c
       JOIN student_profiles sp ON sp.id = ? AND sp.teacher_id = c.teacher_id
       LEFT JOIN enrollments e ON c.id = e.course_id AND e.student_id = ?
       WHERE c.is_published = TRUE
       ORDER BY c.created_at DESC`,
      [studentId, studentId]
    );

    // Parse JSON fields
    return courses.map(course => ({
      ...course,
      what_you_will_learn: course.what_you_will_learn 
        ? course.what_you_will_learn as any
        : [],
      is_enrolled: Boolean(course.is_enrolled),
    }));
  }

  // Get enrolled courses for student
  static async getEnrolledCourses(studentId: string): Promise<EnrolledCourseDetails[]> {
    const courses = await query<EnrolledCourseDetails>(
      `SELECT 
        c.*,
        e.id as enrollment_id,
        e.enrollment_date,
        e.status as enrollment_status,
        e.progress_percentage,
        e.last_accessed_at,
        e.completed_at,
        e.certificate_issued,
        u.full_name as teacher_name
       FROM enrollments e
       INNER JOIN courses c ON e.course_id = c.id
       LEFT JOIN teacher_profiles tp ON c.teacher_id = tp.id
       LEFT JOIN users u ON tp.user_id = u.id
       WHERE e.student_id = ? AND e.status IN ('active', 'completed')
       ORDER BY e.enrollment_date DESC`,
      [studentId]
    );

    // Parse JSON fields
    return courses.map(course => ({
      ...course,
      what_you_will_learn: course.what_you_will_learn 
        ? course.what_you_will_learn as any
        : [],
    }));
  }

  // Get single course by ID with enrollment info (scoped to student's teacher)
  static async getCourseById(courseId: string, studentId: string): Promise<CourseWithEnrollment | null> {
    const courses = await query<CourseWithEnrollment>(
      `SELECT
        c.*,
        CASE WHEN e.id IS NOT NULL AND e.status IN ('active', 'completed') THEN TRUE ELSE FALSE END as is_enrolled,
        e.status as enrollment_status,
        e.progress_percentage,
        e.enrollment_date,
        e.last_accessed_at
       FROM courses c
       JOIN student_profiles sp ON sp.id = ? AND sp.teacher_id = c.teacher_id
       LEFT JOIN enrollments e ON c.id = e.course_id AND e.student_id = ?
       WHERE c.id = ? AND c.is_published = TRUE`,
      [studentId, studentId, courseId]
    );

    if (courses.length === 0) {
      return null;
    }

    const course = courses[0];
    return {
      ...course,
      what_you_will_learn: course.what_you_will_learn 
        ? course.what_you_will_learn as any
        : [],
      is_enrolled: Boolean(course.is_enrolled),
    };
  }

  static async enrollInCourse(courseId: string, studentId: string): Promise<Enrollment> {
    // Check if course exists and is published
    const courses = await query<Course>(
      'SELECT * FROM courses WHERE id = ? AND is_published = TRUE',
      [courseId]
    );

    if (courses.length === 0) {
      throw new Error('Course not found or not available');
    }

    // Check if already enrolled (active or completed)
    const existingEnrollments = await query<Enrollment>(
      'SELECT * FROM enrollments WHERE student_id = ? AND course_id = ?',
      [studentId, courseId]
    );

    if (existingEnrollments.length > 0) {
      const enrollment = existingEnrollments[0];
      
      // If already active or completed, can't enroll again
      if (enrollment.status === 'active' || enrollment.status === 'completed') {
        throw new Error('Already enrolled in this course');
      }
      
      // If cancelled or suspended, reactivate the enrollment
      if (enrollment.status === 'cancelled' || enrollment.status === 'suspended') {
        await query(
          `UPDATE enrollments 
           SET status = 'active', 
               progress_percentage = 0.00,
               enrollment_date = CURRENT_TIMESTAMP,
               completed_at = NULL
           WHERE id = ?`,
          [enrollment.id]
        );

        // Update enrollment count
        await query(
          'UPDATE courses SET enrollment_count = enrollment_count + 1 WHERE id = ?',
          [courseId]
        );

        // Fetch the updated enrollment
        const updatedEnrollments = await query<Enrollment>(
          'SELECT * FROM enrollments WHERE id = ?',
          [enrollment.id]
        );

        return updatedEnrollments[0];
      }
    }

    // Create new enrollment if none exists
    const result = await query(
      `INSERT INTO enrollments (student_id, course_id, status, progress_percentage)
       VALUES (?, ?, 'active', 0.00)`,
      [studentId, courseId]
    );

    const enrollmentId = (result as any).insertId;

    // Update enrollment count
    await query(
      'UPDATE courses SET enrollment_count = enrollment_count + 1 WHERE id = ?',
      [courseId]
    );

    // Fetch the created enrollment
    const enrollments = await query<Enrollment>(
      'SELECT * FROM enrollments WHERE id = ?',
      [enrollmentId]
    );

    return enrollments[0];
  }

  // Unenroll from a course (cancel enrollment)
  static async unenrollFromCourse(courseId: string, studentId: string): Promise<void> {
    // First check if enrollment exists
    const existingEnrollments = await query<Enrollment>(
      'SELECT * FROM enrollments WHERE student_id = ? AND course_id = ?',
      [studentId, courseId]
    );

    if (existingEnrollments.length === 0) {
      throw new Error('You are not enrolled in this course');
    }

    const enrollment = existingEnrollments[0];

    // Check if already cancelled
    if (enrollment.status === 'cancelled') {
      throw new Error('Enrollment is already cancelled');
    }

    // Update to cancelled
    const result = await query(
      `UPDATE enrollments 
       SET status = 'cancelled' 
       WHERE student_id = ? AND course_id = ?`,
      [studentId, courseId]
    );

    if ((result as any).affectedRows === 0) {
      throw new Error('Failed to cancel enrollment');
    }

    // Update enrollment count (only if status was active or completed)
    if (enrollment.status === 'active' || enrollment.status === 'completed') {
      await query(
        'UPDATE courses SET enrollment_count = enrollment_count - 1 WHERE id = ? AND enrollment_count > 0',
        [courseId]
      );
    }
  }

  // Update last accessed timestamp
  static async updateLastAccessed(courseId: string, studentId: string): Promise<void> {
    await query(
      `UPDATE enrollments 
       SET last_accessed_at = CURRENT_TIMESTAMP 
       WHERE student_id = ? AND course_id = ?`,
      [studentId, courseId]
    );
  }

  // Update course progress
  static async updateProgress(
    courseId: string, 
    studentId: string, 
    progressPercentage: number
  ): Promise<void> {
    await query(
      `UPDATE enrollments 
       SET progress_percentage = ?,
           completed_at = CASE WHEN ? >= 100 THEN CURRENT_TIMESTAMP ELSE completed_at END,
           status = CASE WHEN ? >= 100 THEN 'completed' ELSE status END
       WHERE student_id = ? AND course_id = ?`,
      [progressPercentage, progressPercentage, progressPercentage, studentId, courseId]
    );
  }
}
