// src/services/student-course-content.service.ts

import { query } from '../config/database';

interface CourseContent {
  id: string;
  module_id: string;
  content_type: string;
  title: string;
  description?: string;
  youtube_video_id?: string;
  google_drive_file_id?: string;
  content_url?: string;
  text_content?: string;
  duration_minutes?: number;
  file_size_mb?: number;
  order_index: number;
  is_free_preview: boolean;
  created_at: Date;
  updated_at: Date;
}

interface CourseModule {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  order_index: number;
  created_at: Date;
  updated_at: Date;
}

export class StudentCourseContentService {
  // Get all modules for a course (only if student is enrolled)
  static async getModulesByCourse(courseId: string, studentId: string): Promise<CourseModule[]> {
    // First verify student is enrolled
    const enrollments = await query(
      `SELECT id FROM enrollments 
       WHERE student_id = ? AND course_id = ? AND status IN ('active', 'completed')`,
      [studentId, courseId]
    );

    if (enrollments.length === 0) {
      throw new Error('You must be enrolled in this course to access its content');
    }

    // Fetch modules
    const modules = await query<CourseModule>(
      `SELECT * FROM course_modules 
       WHERE course_id = ? 
       ORDER BY order_index ASC`,
      [courseId]
    );

    return modules;
  }

  // Get all content for a module (only if student is enrolled)
  static async getContentByModule(moduleId: string, studentId: string): Promise<CourseContent[]> {
    // First get the course_id from module and verify enrollment
    const moduleCheck = await query<{ course_id: string }>(
      'SELECT course_id FROM course_modules WHERE id = ?',
      [moduleId]
    );

    if (moduleCheck.length === 0) {
      throw new Error('Module not found');
    }

    const courseId = moduleCheck[0].course_id;

    // Verify student is enrolled
    const enrollments = await query(
      `SELECT id FROM enrollments 
       WHERE student_id = ? AND course_id = ? AND status IN ('active', 'completed')`,
      [studentId, courseId]
    );

    if (enrollments.length === 0) {
      throw new Error('You must be enrolled in this course to access its content');
    }

    // Fetch content
    const content = await query<CourseContent>(
      `SELECT * FROM course_content 
       WHERE module_id = ? 
       ORDER BY order_index ASC`,
      [moduleId]
    );

    return content;
  }

  // Get all content for a course (organized by modules)
  static async getAllContentByCourse(courseId: string, studentId: string) {
    // Verify enrollment
    const enrollments = await query(
      `SELECT id FROM enrollments 
       WHERE student_id = ? AND course_id = ? AND status IN ('active', 'completed')`,
      [studentId, courseId]
    );

    if (enrollments.length === 0) {
      throw new Error('You must be enrolled in this course to access its content');
    }

    // Get all modules
    const modules = await query<CourseModule>(
      `SELECT * FROM course_modules 
       WHERE course_id = ? 
       ORDER BY order_index ASC`,
      [courseId]
    );

    // Get all content for each module
    const modulesWithContent = await Promise.all(
      modules.map(async (module) => {
        const content = await query<CourseContent>(
          `SELECT * FROM course_content 
           WHERE module_id = ? 
           ORDER BY order_index ASC`,
          [module.id]
        );

        return {
          ...module,
          content
        };
      })
    );

    return modulesWithContent;
  }
}