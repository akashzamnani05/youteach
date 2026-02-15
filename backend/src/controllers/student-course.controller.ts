// src/controllers/student-course.controller.ts

import { Request, Response } from 'express';
import { StudentCourseService } from '../services/student-course.service';
import { AuthService } from '../services/auth.service';

export class StudentCourseController {
  // Get all courses for logged-in student
  static async getAllCourses(req: Request, res: Response): Promise<void> {
    try {
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

      const courses = await StudentCourseService.getAllCoursesForStudent(
        userWithRole.student_profile_id
      );

      res.status(200).json({
        success: true,
        message: 'Courses retrieved successfully',
        data: {
          courses,
          count: courses.length,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch courses',
      });
    }
  }

  // Get enrolled courses for logged-in student
  static async getEnrolledCourses(req: Request, res: Response): Promise<void> {
    try {
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

      const courses = await StudentCourseService.getEnrolledCourses(
        userWithRole.student_profile_id
      );

      res.status(200).json({
        success: true,
        message: 'Enrolled courses retrieved successfully',
        data: {
          courses,
          count: courses.length,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch enrolled courses',
      });
    }
  }

  // Get single course by ID
  static async getCourseById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
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

      const course = await StudentCourseService.getCourseById(
        id,
        userWithRole.student_profile_id
      );

      if (!course) {
        res.status(404).json({
          success: false,
          message: 'Course not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Course retrieved successfully',
        data: { course },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch course',
      });
    }
  }

  // Enroll in a course
  static async enrollInCourse(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
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

      const result = await StudentCourseService.enrollInCourse(
        id,
        userWithRole.student_profile_id
      );

      res.status(200).json({
        success: true,
        message: 'Successfully enrolled in course',
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to enroll in course',
      });
    }
  }

  // Unenroll from a course
  static async unenrollFromCourse(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
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

      await StudentCourseService.unenrollFromCourse(
        id,
        userWithRole.student_profile_id
      );

      res.status(200).json({
        success: true,
        message: 'Successfully unenrolled from course',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to unenroll from course',
      });
    }
  }

  // Update last accessed timestamp
  static async updateLastAccessed(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
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

      await StudentCourseService.updateLastAccessed(
        id,
        userWithRole.student_profile_id
      );

      res.status(200).json({
        success: true,
        message: 'Last accessed timestamp updated',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update last accessed',
      });
    }
  }

  // Update course progress
  static async updateProgress(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { progress_percentage } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      // Validate progress percentage
      if (typeof progress_percentage !== 'number' || progress_percentage < 0 || progress_percentage > 100) {
        res.status(400).json({
          success: false,
          message: 'Invalid progress percentage. Must be between 0 and 100',
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

      await StudentCourseService.updateProgress(
        id,
        userWithRole.student_profile_id,
        progress_percentage
      );

      res.status(200).json({
        success: true,
        message: 'Course progress updated successfully',
        data: { progress_percentage },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update progress',
      });
    }
  }
}