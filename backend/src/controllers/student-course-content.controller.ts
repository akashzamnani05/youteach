// src/controllers/student-course-content.controller.ts

import { Request, Response } from 'express';
import { StudentCourseContentService } from '../services/student-course-content.service';
import { AuthService } from '../services/auth.service';

export class StudentCourseContentController {
  // Get all modules for a course
  static async getModulesByCourse(req: Request, res: Response): Promise<void> {
    try {
      const { courseId } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      // Get student profile
      const userWithRole = await AuthService.getUserWithRole(userId);
      if (!userWithRole || !userWithRole.student_profile_id) {
        res.status(403).json({
          success: false,
          message: 'Student profile not found',
        });
        return;
      }

      const modules = await StudentCourseContentService.getModulesByCourse(
        courseId,
        userWithRole.student_profile_id
      );

      res.status(200).json({
        success: true,
        message: 'Modules retrieved successfully',
        data: {
          modules,
          count: modules.length,
        },
      });
    } catch (error: any) {
      res.status(error.message.includes('must be enrolled') ? 403 : 500).json({
        success: false,
        message: error.message || 'Failed to fetch modules',
      });
    }
  }

  // Get all content for a module
  static async getContentByModule(req: Request, res: Response): Promise<void> {
    try {
      const { moduleId } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      // Get student profile
      const userWithRole = await AuthService.getUserWithRole(userId);
      if (!userWithRole || !userWithRole.student_profile_id) {
        res.status(403).json({
          success: false,
          message: 'Student profile not found',
        });
        return;
      }

      const content = await StudentCourseContentService.getContentByModule(
        moduleId,
        userWithRole.student_profile_id
      );

      res.status(200).json({
        success: true,
        message: 'Content retrieved successfully',
        data: {
          content,
          count: content.length,
        },
      });
    } catch (error: any) {
      res.status(error.message.includes('must be enrolled') ? 403 : 500).json({
        success: false,
        message: error.message || 'Failed to fetch content',
      });
    }
  }

  // Get all content organized by modules for a course
  static async getAllContentByCourse(req: Request, res: Response): Promise<void> {
    try {
      const { courseId } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      // Get student profile
      const userWithRole = await AuthService.getUserWithRole(userId);
      if (!userWithRole || !userWithRole.student_profile_id) {
        res.status(403).json({
          success: false,
          message: 'Student profile not found',
        });
        return;
      }

      const modulesWithContent = await StudentCourseContentService.getAllContentByCourse(
        courseId,
        userWithRole.student_profile_id
      );

      res.status(200).json({
        success: true,
        message: 'Course content retrieved successfully',
        data: {
          modules: modulesWithContent,
          count: modulesWithContent.length,
        },
      });
    } catch (error: any) {
      res.status(error.message.includes('must be enrolled') ? 403 : 500).json({
        success: false,
        message: error.message || 'Failed to fetch course content',
      });
    }
  }
}