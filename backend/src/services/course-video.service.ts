// src/services/course-video.service.ts

import { query, queryOne, transaction } from '../config/database';
import {
  CourseVideo,
  CreateCourseVideoData,
  UpdateCourseVideoData,
} from '../types/course-video.types';

export class CourseVideoService {
  // Get all videos for a course module
  static async getVideosByModule(moduleId: string, teacherId: string): Promise<CourseVideo[]> {
    const videos = await query<CourseVideo>(
      `SELECT cc.* 
       FROM course_content cc
       JOIN course_modules cm ON cc.module_id = cm.id
       JOIN courses c ON cm.course_id = c.id
       WHERE cc.module_id = ? 
       AND cc.content_type = 'video'
       AND c.teacher_id = ?
       ORDER BY cc.order_index ASC`,
      [moduleId, teacherId]
    );
    return videos;
  }

  // Get all videos for a course
  static async getVideosByCourse(courseId: string, teacherId: string): Promise<CourseVideo[]> {
    const videos = await query<CourseVideo>(
      `SELECT cc.*, cm.title as module_title
       FROM course_content cc
       JOIN course_modules cm ON cc.module_id = cm.id
       JOIN courses c ON cm.course_id = c.id
       WHERE cm.course_id = ?
       AND cc.content_type = 'video'
       AND c.teacher_id = ?
       ORDER BY cm.order_index ASC, cc.order_index ASC`,
      [courseId, teacherId]
    );
    return videos;
  }

  // Get single video by ID
  static async getVideoById(
    videoId: string,
    teacherId: string
  ): Promise<CourseVideo | null> {
    const video = await queryOne<CourseVideo>(
      `SELECT cc.*
       FROM course_content cc
       JOIN course_modules cm ON cc.module_id = cm.id
       JOIN courses c ON cm.course_id = c.id
       WHERE cc.id = ?
       AND cc.content_type = 'video'
       AND c.teacher_id = ?`,
      [videoId, teacherId]
    );
    return video;
  }

  // Create new video entry (without YouTube upload)
  static async createVideoEntry(
    data: CreateCourseVideoData,
    teacherId: string
  ): Promise<CourseVideo> {
    return await transaction(async (connection) => {
      // Verify module belongs to teacher
      const [moduleRows] = await connection.execute(
        `SELECT cm.id 
         FROM course_modules cm
         JOIN courses c ON cm.course_id = c.id
         WHERE cm.id = ? AND c.teacher_id = ?`,
        [data.module_id, teacherId]
      );

      if ((moduleRows as any[]).length === 0) {
        throw new Error('Module not found or unauthorized');
      }

      // Insert video entry
      await connection.execute(
        `INSERT INTO course_content (
          module_id, content_type, title, description, 
          order_index, is_free_preview
        ) VALUES (?, 'video', ?, ?, ?, ?)`,
        [
          data.module_id,
          data.title,
          data.description || null,
          data.order_index,
          data.is_free_preview || false,
        ]
      );

      // Get created video
      const [videoRows] = await connection.execute(
        `SELECT * FROM course_content 
         WHERE module_id = ? AND content_type = 'video'
         ORDER BY created_at DESC LIMIT 1`,
        [data.module_id]
      );

      return (videoRows as any[])[0];
    });
  }

  // Update video entry
  static async updateVideoEntry(
    videoId: string,
    teacherId: string,
    data: UpdateCourseVideoData
  ): Promise<CourseVideo> {
    return await transaction(async (connection) => {
      // Verify video belongs to teacher
      const [existingRows] = await connection.execute(
        `SELECT cc.id 
         FROM course_content cc
         JOIN course_modules cm ON cc.module_id = cm.id
         JOIN courses c ON cm.course_id = c.id
         WHERE cc.id = ? AND cc.content_type = 'video' AND c.teacher_id = ?`,
        [videoId, teacherId]
      );

      if ((existingRows as any[]).length === 0) {
        throw new Error('Video not found or unauthorized');
      }

      // Build update query dynamically
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
      if (data.is_free_preview !== undefined) {
        updates.push('is_free_preview = ?');
        values.push(data.is_free_preview);
      }
      if (data.youtube_video_id !== undefined) {
        updates.push('youtube_video_id = ?');
        values.push(data.youtube_video_id);
      }
      if (data.duration_minutes !== undefined) {
        updates.push('duration_minutes = ?');
        values.push(data.duration_minutes);
      }

      if (updates.length === 0) {
        throw new Error('No fields to update');
      }

      values.push(videoId);

      await connection.execute(
        `UPDATE course_content SET ${updates.join(', ')} WHERE id = ?`,
        values
      );

      // Get updated video
      const [videoRows] = await connection.execute(
        'SELECT * FROM course_content WHERE id = ?',
        [videoId]
      );

      return (videoRows as any[])[0];
    });
  }

  // Delete video entry
  static async deleteVideoEntry(
    videoId: string,
    teacherId: string
  ): Promise<boolean> {
    return await transaction(async (connection) => {
      // Verify video belongs to teacher
      const [existingRows] = await connection.execute(
        `SELECT cc.id, cc.youtube_video_id
         FROM course_content cc
         JOIN course_modules cm ON cc.module_id = cm.id
         JOIN courses c ON cm.course_id = c.id
         WHERE cc.id = ? AND cc.content_type = 'video' AND c.teacher_id = ?`,
        [videoId, teacherId]
      );

      if ((existingRows as any[]).length === 0) {
        throw new Error('Video not found or unauthorized');
      }

      // Delete video entry
      await connection.execute('DELETE FROM course_content WHERE id = ?', [videoId]);

      return true;
    });
  }

  // Get video count for a course
  static async getVideoCount(courseId: string): Promise<number> {
    const result = await queryOne<{ count: number }>(
      `SELECT COUNT(*) as count 
       FROM course_content cc
       JOIN course_modules cm ON cc.module_id = cm.id
       WHERE cm.course_id = ? AND cc.content_type = 'video'`,
      [courseId]
    );
    return result?.count || 0;
  }


  // Reorder videos within a module
static async reorderVideos(
  moduleId: string,
  teacherProfileId: string,
  videos: { id: string; order_index: number }[]
): Promise<void> {
  return await transaction(async (connection) => {
    // Verify module belongs to teacher's course
    const [moduleRows] = await connection.execute(
      `SELECT cm.id 
       FROM course_modules cm
       JOIN courses c ON cm.course_id = c.id
       WHERE cm.id = ? AND c.teacher_id = ?`,
      [moduleId, teacherProfileId]
    );

    if ((moduleRows as any[]).length === 0) {
      throw new Error('Module not found or unauthorized');
    }

    // Update each video's order_index
    for (const video of videos) {
      await connection.execute(
        'UPDATE course_content SET order_index = ? WHERE id = ? AND module_id = ?',
        [video.order_index, video.id, moduleId]
      );
    }
  });
}

// Move video to different module
static async moveVideo(
  videoId: string,
  teacherProfileId: string,
  newModuleId: string,
  newOrderIndex: number
): Promise<any> {
  return await transaction(async (connection) => {
    // Verify video belongs to teacher's course
    const [videoRows] = await connection.execute(
      `SELECT cc.id, cc.module_id
       FROM course_content cc
       JOIN course_modules cm ON cc.module_id = cm.id
       JOIN courses c ON cm.course_id = c.id
       WHERE cc.id = ? AND c.teacher_id = ?`,
      [videoId, teacherProfileId]
    );

    if ((videoRows as any[]).length === 0) {
      throw new Error('Video not found or unauthorized');
    }

    // Verify new module belongs to teacher's course
    const [newModuleRows] = await connection.execute(
      `SELECT cm.id 
       FROM course_modules cm
       JOIN courses c ON cm.course_id = c.id
       WHERE cm.id = ? AND c.teacher_id = ?`,
      [newModuleId, teacherProfileId]
    );

    if ((newModuleRows as any[]).length === 0) {
      throw new Error('Target module not found or unauthorized');
    }

    // Update video's module_id and order_index
    await connection.execute(
      'UPDATE course_content SET module_id = ?, order_index = ? WHERE id = ?',
      [newModuleId, newOrderIndex, videoId]
    );

    // Get updated video
    const [updatedVideoRows] = await connection.execute(
      'SELECT * FROM course_content WHERE id = ?',
      [videoId]
    );

    return (updatedVideoRows as any[])[0];
  });
}
}