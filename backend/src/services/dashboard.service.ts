// src/services/dashboard.service.ts

import { query, queryOne } from '../config/database';

export interface TeacherDashboardData {
  stats: {
    totalCourses: number;
    totalStudents: number;
    upcomingWebinarsCount: number;
  };
  upcomingWebinars: {
    id: string;
    title: string;
    scheduled_at: string;
    duration_minutes: number;
    meeting_link: string | null;
    registration_count: number;
  }[];
  upcomingBatchSessions: {
    id: string;
    batch_id: string;
    batch_name: string;
    session_date: string;
    class_time: string;
    duration_minutes: number;
    meeting_link: string;
    student_count: number;
  }[];
}

export interface StudentDashboardData {
  stats: {
    enrolledCourses: number;
    upcomingWebinarsCount: number;
  };
  enrolledCourses: {
    id: string;
    title: string;
    thumbnail_url: string | null;
    progress_percentage: number;
    teacher_name: string;
    last_accessed_at: string | null;
  }[];
  upcomingWebinars: {
    id: string;
    title: string;
    scheduled_at: string;
    duration_minutes: number;
    meeting_link: string | null;
    teacher_name: string;
  }[];
  upcomingBatchSessions: {
    id: string;
    batch_id: string;
    batch_name: string;
    session_date: string;
    class_time: string;
    duration_minutes: number;
    meeting_link: string;
    teacher_name: string;
  }[];
}

export class DashboardService {
  static async getTeacherDashboard(teacherProfileId: string): Promise<TeacherDashboardData> {
    // Total courses
    const coursesResult = await queryOne<{ count: number }>(
      `SELECT COUNT(*) AS count FROM courses WHERE teacher_id = ?`,
      [teacherProfileId]
    );
    const totalCourses = coursesResult?.count ?? 0;

    // Total students directly associated with this teacher
    const studentsResult = await queryOne<{ count: number }>(
      `SELECT COUNT(*) AS count
       FROM student_profiles sp
       JOIN users u ON sp.user_id = u.id
       WHERE sp.teacher_id = ? AND u.is_active = TRUE`,
      [teacherProfileId]
    );
    const totalStudents = studentsResult?.count ?? 0;

    // Upcoming webinars count
    const webinarCountResult = await queryOne<{ count: number }>(
      `SELECT COUNT(*) AS count
       FROM webinars
       WHERE teacher_id = ?
         AND scheduled_at > NOW()
         AND status = 'scheduled'`,
      [teacherProfileId]
    );
    const upcomingWebinarsCount = webinarCountResult?.count ?? 0;

    // Upcoming webinars list (next 5)
    const upcomingWebinars = await query<TeacherDashboardData['upcomingWebinars'][0]>(
      `SELECT
         w.id,
         w.title,
         w.scheduled_at,
         w.duration_minutes,
         w.meeting_link,
         COUNT(wr.id) AS registration_count
       FROM webinars w
       LEFT JOIN webinar_registrations wr ON wr.webinar_id = w.id
       WHERE w.teacher_id = ?
         AND w.scheduled_at > NOW()
         AND w.status = 'scheduled'
       GROUP BY w.id, w.title, w.scheduled_at, w.duration_minutes, w.meeting_link
       ORDER BY w.scheduled_at ASC
       LIMIT 5`,
      [teacherProfileId]
    );

    // Upcoming batch sessions (next 5)
    const upcomingBatchSessions = await query<TeacherDashboardData['upcomingBatchSessions'][0]>(
      `SELECT
         bs.id,
         b.id AS batch_id,
         b.name AS batch_name,
         bs.session_date,
         b.class_time,
         b.duration_minutes,
         b.meeting_link,
         COUNT(bst.id) AS student_count
       FROM batch_sessions bs
       JOIN batches b ON bs.batch_id = b.id
       LEFT JOIN batch_students bst ON bst.batch_id = b.id
       WHERE b.teacher_profile_id = ?
         AND bs.session_date >= CURDATE()
       GROUP BY bs.id, b.id, b.name, bs.session_date, b.class_time, b.duration_minutes, b.meeting_link
       ORDER BY bs.session_date ASC, b.class_time ASC
       LIMIT 5`,
      [teacherProfileId]
    );

    return {
      stats: { totalCourses, totalStudents, upcomingWebinarsCount },
      upcomingWebinars,
      upcomingBatchSessions,
    };
  }

  static async getStudentDashboard(userId: string): Promise<StudentDashboardData> {
    // Enrolled active courses with progress
    const enrolledCourses = await query<StudentDashboardData['enrolledCourses'][0]>(
      `SELECT
         c.id,
         c.title,
         c.thumbnail_url,
         e.progress_percentage,
         u.full_name AS teacher_name,
         e.last_accessed_at
       FROM enrollments e
       JOIN courses c ON e.course_id = c.id
       JOIN teacher_profiles tp ON c.teacher_id = tp.id
       JOIN users u ON tp.user_id = u.id
       JOIN student_profiles sp ON e.student_id = sp.id
       WHERE sp.user_id = ?
         AND e.status = 'active'
       ORDER BY e.last_accessed_at DESC`,
      [userId]
    );

    const enrolledCoursesCount = enrolledCourses.length;

    // Upcoming webinars count (registered webinars in the future)
    const webinarCountResult = await queryOne<{ count: number }>(
      `SELECT COUNT(*) AS count
       FROM webinar_registrations wr
       JOIN webinars w ON wr.webinar_id = w.id
       JOIN student_profiles sp ON wr.student_id = sp.id
       WHERE sp.user_id = ?
         AND w.scheduled_at > NOW()
         AND w.status = 'scheduled'`,
      [userId]
    );
    const upcomingWebinarsCount = webinarCountResult?.count ?? 0;

    // Upcoming webinars list (next 5)
    const upcomingWebinars = await query<StudentDashboardData['upcomingWebinars'][0]>(
      `SELECT
         w.id,
         w.title,
         w.scheduled_at,
         w.duration_minutes,
         w.meeting_link,
         u.full_name AS teacher_name
       FROM webinar_registrations wr
       JOIN webinars w ON wr.webinar_id = w.id
       JOIN teacher_profiles tp ON w.teacher_id = tp.id
       JOIN users u ON tp.user_id = u.id
       JOIN student_profiles sp ON wr.student_id = sp.id
       WHERE sp.user_id = ?
         AND w.scheduled_at > NOW()
         AND w.status = 'scheduled'
       ORDER BY w.scheduled_at ASC
       LIMIT 5`,
      [userId]
    );

    // Upcoming batch sessions the student belongs to (next 5)
    const upcomingBatchSessions = await query<StudentDashboardData['upcomingBatchSessions'][0]>(
      `SELECT
         bs.id,
         b.id AS batch_id,
         b.name AS batch_name,
         bs.session_date,
         b.class_time,
         b.duration_minutes,
         b.meeting_link,
         u.full_name AS teacher_name
       FROM batch_students bst
       JOIN batches b ON bst.batch_id = b.id
       JOIN batch_sessions bs ON bs.batch_id = b.id
       JOIN teacher_profiles tp ON b.teacher_profile_id = tp.id
       JOIN users u ON tp.user_id = u.id
       WHERE bst.student_user_id = ?
         AND bs.session_date >= CURDATE()
       ORDER BY bs.session_date ASC, b.class_time ASC
       LIMIT 5`,
      [userId]
    );

    return {
      stats: { enrolledCourses: enrolledCoursesCount, upcomingWebinarsCount },
      enrolledCourses,
      upcomingWebinars,
      upcomingBatchSessions,
    };
  }
}
