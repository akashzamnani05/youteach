// src/services/course.service.ts

import { query, queryOne, transaction } from '../config/database';
import {
  Course,
  CourseModule,
  CreateCourseData,
  UpdateCourseData,
  CreateModuleData,
  UpdateModuleData,
} from '../types/course.types';
import { generateSlug } from '../utils/slug.utils';

export class CourseService {
  // ========== COURSES ==========

  // Get all courses for a teacher
  static async getCoursesByTeacher(teacherId: string): Promise<Course[]> {
    const courses = await query<Course>(
      `SELECT * FROM courses 
       WHERE teacher_id = ? 
       ORDER BY created_at DESC`,
      [teacherId]
    );

    console.log('Fetched courses for teacher:', teacherId);

    console.log(courses)
    
    // Parse JSON fields
    return courses.map(course => ({
      ...course,
      what_you_will_learn: course.what_you_will_learn 
        ? course.what_you_will_learn as any
        : [],
    }));
  }

  // Get single course by ID
  static async getCourseById(
    courseId: string,
    teacherId: string
  ): Promise<Course | null> {
    const course = await queryOne<Course>(
      `SELECT * FROM courses 
       WHERE id = ? AND teacher_id = ?`,
      [courseId, teacherId]
    );

    if (!course) return null;

    return {
      ...course,
      what_you_will_learn: course.what_you_will_learn
        ? course.what_you_will_learn as any
        : [],
    };
  }

  // Create new course
  static async createCourse(
    data: CreateCourseData,
    teacherId: string
  ): Promise<Course> {
    return await transaction(async (connection) => {
      // Generate slug from title
      const baseSlug = generateSlug(data.title);
      
      // Check for existing slugs
      const [existingSlugs] = await connection.execute(
        'SELECT slug FROM courses WHERE teacher_id = ? AND slug LIKE ?',
        [teacherId, `${baseSlug}%`]
      );

      let slug = baseSlug;
      if ((existingSlugs as any[]).length > 0) {
        slug = `${baseSlug}-${Date.now()}`;
      }

      // Insert course
      await connection.execute(
        `INSERT INTO courses (
          teacher_id, title, slug, description, short_description,
          thumbnail_url, price, currency, level, language, requirements,
          what_you_will_learn, is_published, enrollment_count
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'USD', ?, ?, ?, ?, TRUE, 0)`,
        [
          teacherId,
          data.title,
          slug,
          data.description || null,
          data.short_description || null,
          data.thumbnail_url || null,
          data.price || 0,
          data.level || 'all',
          data.language || 'English',
          data.requirements || null,
          data.what_you_will_learn ? JSON.stringify(data.what_you_will_learn) : null,
        ]
      );

      // Get created course
      const [courseRows] = await connection.execute(
        `SELECT * FROM courses 
         WHERE teacher_id = ? 
         ORDER BY created_at DESC 
         LIMIT 1`,
        [teacherId]
      );

      const course = (courseRows as any[])[0];
      
      return {
        ...course,
        what_you_will_learn: course.what_you_will_learn
          ? course.what_you_will_learn as any
          : [],
      };
    });
  }

  // Update course
  static async updateCourse(
    courseId: string,
    teacherId: string,
    data: UpdateCourseData
  ): Promise<Course> {
    return await transaction(async (connection) => {
      // Verify course belongs to teacher
      const [existingRows] = await connection.execute(
        'SELECT id FROM courses WHERE id = ? AND teacher_id = ?',
        [courseId, teacherId]
      );

      if ((existingRows as any[]).length === 0) {
        throw new Error('Course not found or unauthorized');
      }

      // Build update query dynamically
      const updates: string[] = [];
      const values: any[] = [];

      if (data.title !== undefined) {
        updates.push('title = ?');
        values.push(data.title);
      }
      if (data.slug !== undefined) {
        updates.push('slug = ?');
        values.push(data.slug);
      }
      if (data.description !== undefined) {
        updates.push('description = ?');
        values.push(data.description);
      }
      if (data.short_description !== undefined) {
        updates.push('short_description = ?');
        values.push(data.short_description);
      }
      if (data.thumbnail_url !== undefined) {
        updates.push('thumbnail_url = ?');
        values.push(data.thumbnail_url);
      }
      if (data.trailer_youtube_id !== undefined) {
        updates.push('trailer_youtube_id = ?');
        values.push(data.trailer_youtube_id);
      }
      if (data.price !== undefined) {
        updates.push('price = ?');
        values.push(data.price);
      }
      if (data.currency !== undefined) {
        updates.push('currency = ?');
        values.push(data.currency);
      }
      if (data.level !== undefined) {
        updates.push('level = ?');
        values.push(data.level);
      }
      if (data.duration_hours !== undefined) {
        updates.push('duration_hours = ?');
        values.push(data.duration_hours);
      }
      if (data.language !== undefined) {
        updates.push('language = ?');
        values.push(data.language);
      }
      if (data.requirements !== undefined) {
        updates.push('requirements = ?');
        values.push(data.requirements);
      }
      if (data.what_you_will_learn !== undefined) {
        updates.push('what_you_will_learn = ?');
        values.push(JSON.stringify(data.what_you_will_learn));
      }
      if (data.is_published !== undefined) {
        updates.push('is_published = ?');
        values.push(data.is_published);
      }

      if (updates.length === 0) {
        throw new Error('No fields to update');
      }

      values.push(courseId);

      await connection.execute(
        `UPDATE courses SET ${updates.join(', ')} WHERE id = ?`,
        values
      );

      // Get updated course
      const [courseRows] = await connection.execute(
        'SELECT * FROM courses WHERE id = ?',
        [courseId]
      );

      const course = (courseRows as any[])[0];
      
      return {
        ...course,
        what_you_will_learn: course.what_you_will_learn
          ? course.what_you_will_learn
          : [],
      };
    });
  }

  // Delete course
  static async deleteCourse(
    courseId: string,
    teacherId: string
  ): Promise<boolean> {
    return await transaction(async (connection) => {
      // Verify course belongs to teacher
      const [existingRows] = await connection.execute(
        'SELECT id FROM courses WHERE id = ? AND teacher_id = ?',
        [courseId, teacherId]
      );

      if ((existingRows as any[]).length === 0) {
        throw new Error('Course not found or unauthorized');
      }

      // Delete course (cascade will handle modules and content)
      await connection.execute('DELETE FROM courses WHERE id = ?', [courseId]);

      return true;
    });
  }

  // ========== MODULES ==========

  // Get all modules for a course
  static async getModulesByCourse(
    courseId: string,
    teacherId: string
  ): Promise<CourseModule[]> {
    const modules = await query<CourseModule>(
      `SELECT cm.* 
       FROM course_modules cm
       JOIN courses c ON cm.course_id = c.id
       WHERE cm.course_id = ? AND c.teacher_id = ?
       ORDER BY cm.order_index ASC`,
      [courseId, teacherId]
    );
    return modules;
  }

  // Get single module by ID
  static async getModuleById(
    moduleId: string,
    teacherId: string
  ): Promise<CourseModule | null> {
    const module = await queryOne<CourseModule>(
      `SELECT cm.*
       FROM course_modules cm
       JOIN courses c ON cm.course_id = c.id
       WHERE cm.id = ? AND c.teacher_id = ?`,
      [moduleId, teacherId]
    );
    return module;
  }

  // Create new module
  static async createModule(
    data: CreateModuleData,
    teacherId: string
  ): Promise<CourseModule> {
    return await transaction(async (connection) => {
      // Verify course belongs to teacher
      const [courseRows] = await connection.execute(
        'SELECT id FROM courses WHERE id = ? AND teacher_id = ?',
        [data.course_id, teacherId]
      );

      if ((courseRows as any[]).length === 0) {
        throw new Error('Course not found or unauthorized');
      }

      // Insert module
      await connection.execute(
        `INSERT INTO course_modules (
          course_id, title, description, order_index
        ) VALUES (?, ?, ?, ?)`,
        [
          data.course_id,
          data.title,
          data.description || null,
          data.order_index,
        ]
      );

      // Get created module
      const [moduleRows] = await connection.execute(
        `SELECT * FROM course_modules 
         WHERE course_id = ? 
         ORDER BY created_at DESC 
         LIMIT 1`,
        [data.course_id]
      );

      return (moduleRows as any[])[0];
    });
  }

  // Update module
  static async updateModule(
    moduleId: string,
    teacherId: string,
    data: UpdateModuleData
  ): Promise<CourseModule> {
    return await transaction(async (connection) => {
      // Verify module belongs to teacher's course
      const [existingRows] = await connection.execute(
        `SELECT cm.id 
         FROM course_modules cm
         JOIN courses c ON cm.course_id = c.id
         WHERE cm.id = ? AND c.teacher_id = ?`,
        [moduleId, teacherId]
      );

      if ((existingRows as any[]).length === 0) {
        throw new Error('Module not found or unauthorized');
      }

      // Build update query
      const updates: string[] = [];
      const values: any[] = [];

      if (data.title !== undefined) {
        updates.push('title = ?');
        values.push(data.title);
      }
      if (data.description !== undefined) {
        updates.push('description = ?');
        values.push(data.description);
      }
      if (data.order_index !== undefined) {
        updates.push('order_index = ?');
        values.push(data.order_index);
      }

      if (updates.length === 0) {
        throw new Error('No fields to update');
      }

      values.push(moduleId);

      await connection.execute(
        `UPDATE course_modules SET ${updates.join(', ')} WHERE id = ?`,
        values
      );

      // Get updated module
      const [moduleRows] = await connection.execute(
        'SELECT * FROM course_modules WHERE id = ?',
        [moduleId]
      );

      return (moduleRows as any[])[0];
    });
  }

  // Delete module
  static async deleteModule(
    moduleId: string,
    teacherId: string
  ): Promise<boolean> {
    return await transaction(async (connection) => {
      // Verify module belongs to teacher's course
      const [existingRows] = await connection.execute(
        `SELECT cm.id 
         FROM course_modules cm
         JOIN courses c ON cm.course_id = c.id
         WHERE cm.id = ? AND c.teacher_id = ?`,
        [moduleId, teacherId]
      );

      if ((existingRows as any[]).length === 0) {
        throw new Error('Module not found or unauthorized');
      }

      // Delete module (cascade will handle content)
      await connection.execute('DELETE FROM course_modules WHERE id = ?', [moduleId]);

      return true;
    });
  }

  // Reorder modules
static async reorderModules(
  courseId: string,
  teacherProfileId: string,
  modules: { id: string; order_index: number }[]
): Promise<void> {
  return await transaction(async (connection) => {
    // Verify course belongs to teacher
    const [courseRows] = await connection.execute(
      'SELECT id FROM courses WHERE id = ? AND teacher_id = ?',
      [courseId, teacherProfileId]
    );

    if ((courseRows as any[]).length === 0) {
      throw new Error('Course not found or unauthorized');
    }

    // Update each module's order_index
    for (const module of modules) {
      await connection.execute(
        'UPDATE course_modules SET order_index = ? WHERE id = ? AND course_id = ?',
        [module.order_index, module.id, courseId]
      );
    }
  });
}



// ========================================
// ADD TO: src/services/course.service.ts
// ========================================

// Get all enrolled students for a course
static async getEnrolledStudents(
  courseId: string,
  teacherProfileId: string
): Promise<any[]> {
  // Verify course belongs to teacher
  const course = await queryOne(
    'SELECT id FROM courses WHERE id = ? AND teacher_id = ?',
    [courseId, teacherProfileId]
  );

  if (!course) {
    throw new Error('Course not found or unauthorized');
  }

  // Get all enrolled students with their details
  const students = await query(
    `SELECT 
      e.id as enrollment_id,
      e.enrollment_date,
      e.status as enrollment_status,
      e.progress_percentage,
      e.last_accessed_at,
      e.completed_at,
      e.certificate_issued,
      u.id as user_id,
      u.email,
      u.full_name,
      u.phone,
      u.profile_picture_url,
      sp.id as student_profile_id,
      sp.date_of_birth,
      sp.interests,
      sp.education_level,
      sp.bio
     FROM enrollments e
     JOIN student_profiles sp ON e.student_id = sp.id
     JOIN users u ON sp.user_id = u.id
     WHERE e.course_id = ?
     ORDER BY e.enrollment_date DESC`,
    [courseId]
  );

  // Parse JSON fields
  return students.map((student: any) => ({
    ...student,
    interests: student.interests ? JSON.parse(student.interests) : [],
  }));
}

// Get enrollment statistics for a course
static async getEnrollmentStats(
  courseId: string,
  teacherProfileId: string
): Promise<any> {
  // Verify course belongs to teacher
  const course = await queryOne(
    'SELECT id FROM courses WHERE id = ? AND teacher_id = ?',
    [courseId, teacherProfileId]
  );

  if (!course) {
    throw new Error('Course not found or unauthorized');
  }

  const stats = await queryOne(
    `SELECT 
      COUNT(*) as total_enrollments,
      SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_students,
      SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_students,
      SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_students,
      SUM(CASE WHEN status = 'suspended' THEN 1 ELSE 0 END) as suspended_students,
      AVG(progress_percentage) as average_progress,
      SUM(CASE WHEN certificate_issued = TRUE THEN 1 ELSE 0 END) as certificates_issued
     FROM enrollments
     WHERE course_id = ?`,
    [courseId]
  );

  return {
    total_enrollments: parseInt(stats?.total_enrollments || '0'),
    active_students: parseInt(stats?.active_students || '0'),
    completed_students: parseInt(stats?.completed_students || '0'),
    cancelled_students: parseInt(stats?.cancelled_students || '0'),
    suspended_students: parseInt(stats?.suspended_students || '0'),
    average_progress: parseFloat(stats?.average_progress || '0').toFixed(2),
    certificates_issued: parseInt(stats?.certificates_issued || '0'),
  };
}

// Get single enrolled student details
static async getEnrolledStudentById(
  courseId: string,
  studentId: string,
  teacherProfileId: string
): Promise<any> {
  // Verify course belongs to teacher
  const course = await queryOne(
    'SELECT id FROM courses WHERE id = ? AND teacher_id = ?',
    [courseId, teacherProfileId]
  );

  if (!course) {
    throw new Error('Course not found or unauthorized');
  }

  // Get student details
  const student = await queryOne(
    `SELECT 
      e.id as enrollment_id,
      e.enrollment_date,
      e.status as enrollment_status,
      e.progress_percentage,
      e.last_accessed_at,
      e.completed_at,
      e.certificate_issued,
      u.id as user_id,
      u.email,
      u.full_name,
      u.phone,
      u.profile_picture_url,
      sp.id as student_profile_id,
      sp.date_of_birth,
      sp.interests,
      sp.education_level,
      sp.bio
     FROM enrollments e
     JOIN student_profiles sp ON e.student_id = sp.id
     JOIN users u ON sp.user_id = u.id
     WHERE e.course_id = ? AND sp.id = ?`,
    [courseId, studentId]
  );

  if (!student) {
    throw new Error('Student not found in this course');
  }

  // Parse JSON fields
  return {
    ...student,
    interests: student.interests ? JSON.parse(student.interests) : [],
  };
}

// Unenroll student from course (teacher action)
static async unenrollStudent(
  courseId: string,
  studentId: string,
  teacherProfileId: string
): Promise<void> {
  return await transaction(async (connection) => {
    // Verify course belongs to teacher
    const [courseRows] = await connection.execute(
      'SELECT id FROM courses WHERE id = ? AND teacher_id = ?',
      [courseId, teacherProfileId]
    );

    if ((courseRows as any[]).length === 0) {
      throw new Error('Course not found or unauthorized');
    }

    // Delete enrollment
    const [result] = await connection.execute(
      'DELETE FROM enrollments WHERE course_id = ? AND student_id = ?',
      [courseId, studentId]
    );

    if ((result as any).affectedRows === 0) {
      throw new Error('Student not enrolled in this course');
    }

    // Update course enrollment count
    await connection.execute(
      `UPDATE courses 
       SET enrollment_count = (
         SELECT COUNT(*) FROM enrollments WHERE course_id = ?
       )
       WHERE id = ?`,
      [courseId, courseId]
    );
  });
}
}