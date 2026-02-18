// src/controllers/course.controller.ts

import { Request, Response } from 'express';
import { CourseService } from '../services/course.service';
import { AuthService } from '../services/auth.service';
import { CreateCourseData, UpdateCourseData, CreateModuleData, UpdateModuleData } from '../types/course.types';
import { storageBucket } from '../config/firebase.config';
import { v4 as uuidv4 } from 'uuid';

export class CourseController {
  // ========== COURSES ==========

  // Get all courses for logged-in teacher
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

      // Get teacher profile
      const userWithRole = await AuthService.getUserWithRole(userId);
      if (!userWithRole || !userWithRole.teacher_profile_id) {
        res.status(403).json({
          success: false,
          message: 'Teacher profile not found',
        });
        return;
      }

      const courses = await CourseService.getCoursesByTeacher(
        userWithRole.teacher_profile_id
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

      // Get teacher profile
      const userWithRole = await AuthService.getUserWithRole(userId);
      if (!userWithRole || !userWithRole.teacher_profile_id) {
        res.status(403).json({
          success: false,
          message: 'Teacher profile not found',
        });
        return;
      }

      const course = await CourseService.getCourseById(
        id,
        userWithRole.teacher_profile_id
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

  // Create new course
  static async createCourse(req: Request, res: Response): Promise<void> {
    try {
      const data: CreateCourseData = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      // Get teacher profile
      const userWithRole = await AuthService.getUserWithRole(userId);
      if (!userWithRole || !userWithRole.teacher_profile_id) {
        res.status(403).json({
          success: false,
          message: 'Teacher profile not found',
        });
        return;
      }

      // Validate required fields
      if (!data.title || !data.title.trim()) {
        res.status(400).json({
          success: false,
          message: 'Course title is required',
        });
        return;
      }

      const course = await CourseService.createCourse(
        data,
        userWithRole.teacher_profile_id
      );

      res.status(201).json({
        success: true,
        message: 'Course created successfully',
        data: { course },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to create course',
      });
    }
  }

  // Update course
  static async updateCourse(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data: UpdateCourseData = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      // Get teacher profile
      const userWithRole = await AuthService.getUserWithRole(userId);
      if (!userWithRole || !userWithRole.teacher_profile_id) {
        res.status(403).json({
          success: false,
          message: 'Teacher profile not found',
        });
        return;
      }

      const course = await CourseService.updateCourse(
        id,
        userWithRole.teacher_profile_id,
        data
      );

      res.status(200).json({
        success: true,
        message: 'Course updated successfully',
        data: { course },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update course',
      });
    }
  }

  // Delete course
  static async deleteCourse(req: Request, res: Response): Promise<void> {
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

      // Get teacher profile
      const userWithRole = await AuthService.getUserWithRole(userId);
      if (!userWithRole || !userWithRole.teacher_profile_id) {
        res.status(403).json({
          success: false,
          message: 'Teacher profile not found',
        });
        return;
      }

      await CourseService.deleteCourse(id, userWithRole.teacher_profile_id);

      res.status(200).json({
        success: true,
        message: 'Course deleted successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to delete course',
      });
    }
  }

  // ========== MODULES ==========

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

      // Get teacher profile
      const userWithRole = await AuthService.getUserWithRole(userId);
      if (!userWithRole || !userWithRole.teacher_profile_id) {
        res.status(403).json({
          success: false,
          message: 'Teacher profile not found',
        });
        return;
      }

      const modules = await CourseService.getModulesByCourse(
        courseId,
        userWithRole.teacher_profile_id
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
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch modules',
      });
    }
  }

  // Get single module by ID
  static async getModuleById(req: Request, res: Response): Promise<void> {
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

      // Get teacher profile
      const userWithRole = await AuthService.getUserWithRole(userId);
      if (!userWithRole || !userWithRole.teacher_profile_id) {
        res.status(403).json({
          success: false,
          message: 'Teacher profile not found',
        });
        return;
      }

      const module = await CourseService.getModuleById(
        id,
        userWithRole.teacher_profile_id
      );

      if (!module) {
        res.status(404).json({
          success: false,
          message: 'Module not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Module retrieved successfully',
        data: { module },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch module',
      });
    }
  }

  // Create new module
  static async createModule(req: Request, res: Response): Promise<void> {
    try {
      const data: CreateModuleData = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      // Get teacher profile
      const userWithRole = await AuthService.getUserWithRole(userId);
      if (!userWithRole || !userWithRole.teacher_profile_id) {
        res.status(403).json({
          success: false,
          message: 'Teacher profile not found',
        });
        return;
      }

      // Validate required fields
      if (!data.course_id || !data.title || !data.title.trim()) {
        res.status(400).json({
          success: false,
          message: 'Course ID and module title are required',
        });
        return;
      }

      const module = await CourseService.createModule(
        data,
        userWithRole.teacher_profile_id
      );

      res.status(201).json({
        success: true,
        message: 'Module created successfully',
        data: { module },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to create module',
      });
    }
  }

  // Update module
  static async updateModule(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data: UpdateModuleData = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      // Get teacher profile
      const userWithRole = await AuthService.getUserWithRole(userId);
      if (!userWithRole || !userWithRole.teacher_profile_id) {
        res.status(403).json({
          success: false,
          message: 'Teacher profile not found',
        });
        return;
      }

      const module = await CourseService.updateModule(
        id,
        userWithRole.teacher_profile_id,
        data
      );

      res.status(200).json({
        success: true,
        message: 'Module updated successfully',
        data: { module },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update module',
      });
    }
  }

  // Delete module
  static async deleteModule(req: Request, res: Response): Promise<void> {
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

      // Get teacher profile
      const userWithRole = await AuthService.getUserWithRole(userId);
      if (!userWithRole || !userWithRole.teacher_profile_id) {
        res.status(403).json({
          success: false,
          message: 'Teacher profile not found',
        });
        return;
      }

      await CourseService.deleteModule(id, userWithRole.teacher_profile_id);

      res.status(200).json({
        success: true,
        message: 'Module deleted successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to delete module',
      });
    }
  }

  // Reorder modules
static async reorderModules(req: Request, res: Response): Promise<void> {
  try {
    const { id: courseId } = req.params;
    const { modules } = req.body; // Array of { id: string, order_index: number }
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    // Get teacher profile
    const userWithRole = await AuthService.getUserWithRole(userId);
    if (!userWithRole || !userWithRole.teacher_profile_id) {
      res.status(403).json({
        success: false,
        message: 'Teacher profile not found',
      });
      return;
    }

    await CourseService.reorderModules(courseId, userWithRole.teacher_profile_id, modules);

    res.status(200).json({
      success: true,
      message: 'Modules reordered successfully',
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to reorder modules',
    });
  }
}

  // ========================================
// ADD TO: src/controllers/course.controller.ts
// ========================================

// Get all enrolled students for a course
static async getEnrolledStudents(req: Request, res: Response): Promise<void> {
  try {
    const { id: courseId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    // Get teacher profile
    const userWithRole = await AuthService.getUserWithRole(userId);
    if (!userWithRole || !userWithRole.teacher_profile_id) {
      res.status(403).json({
        success: false,
        message: 'Teacher profile not found',
      });
      return;
    }

    const students = await CourseService.getEnrolledStudents(
      courseId,
      userWithRole.teacher_profile_id
    );

    res.status(200).json({
      success: true,
      message: 'Enrolled students retrieved successfully',
      data: {
        students,
        count: students.length,
      },
    });
  } catch (error: any) {
    res.status(error.message.includes('unauthorized') ? 403 : 500).json({
      success: false,
      message: error.message || 'Failed to fetch enrolled students',
    });
  }
}

// Get enrollment statistics for a course
static async getEnrollmentStats(req: Request, res: Response): Promise<void> {
  try {
    const { id: courseId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    // Get teacher profile
    const userWithRole = await AuthService.getUserWithRole(userId);
    if (!userWithRole || !userWithRole.teacher_profile_id) {
      res.status(403).json({
        success: false,
        message: 'Teacher profile not found',
      });
      return;
    }

    const stats = await CourseService.getEnrollmentStats(
      courseId,
      userWithRole.teacher_profile_id
    );

    res.status(200).json({
      success: true,
      message: 'Enrollment statistics retrieved successfully',
      data: { stats },
    });
  } catch (error: any) {
    res.status(error.message.includes('unauthorized') ? 403 : 500).json({
      success: false,
      message: error.message || 'Failed to fetch enrollment statistics',
    });
  }
}

// Get single enrolled student details
static async getEnrolledStudentById(req: Request, res: Response): Promise<void> {
  try {
    const { id: courseId, studentId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    // Get teacher profile
    const userWithRole = await AuthService.getUserWithRole(userId);
    if (!userWithRole || !userWithRole.teacher_profile_id) {
      res.status(403).json({
        success: false,
        message: 'Teacher profile not found',
      });
      return;
    }

    const student = await CourseService.getEnrolledStudentById(
      courseId,
      studentId,
      userWithRole.teacher_profile_id
    );

    res.status(200).json({
      success: true,
      message: 'Student details retrieved successfully',
      data: { student },
    });
  } catch (error: any) {
    res.status(error.message.includes('not found') ? 404 : 500).json({
      success: false,
      message: error.message || 'Failed to fetch student details',
    });
  }
}

// Unenroll student from course
static async unenrollStudent(req: Request, res: Response): Promise<void> {
  try {
    const { id: courseId, studentId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    // Get teacher profile
    const userWithRole = await AuthService.getUserWithRole(userId);
    if (!userWithRole || !userWithRole.teacher_profile_id) {
      res.status(403).json({
        success: false,
        message: 'Teacher profile not found',
      });
      return;
    }

    await CourseService.unenrollStudent(
      courseId,
      studentId,
      userWithRole.teacher_profile_id
    );

    res.status(200).json({
      success: true,
      message: 'Student unenrolled successfully',
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to unenroll student',
    });
  }
}

  // POST /api/courses/thumbnail — upload a course thumbnail to Firebase Storage
  static async uploadThumbnail(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ success: false, message: 'No image file provided' });
        return;
      }

      const ext = req.file.originalname.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `course-thumbnails/${uuidv4()}.${ext}`;
      const file = storageBucket.file(fileName);

      await file.save(req.file.buffer, {
        metadata: { contentType: req.file.mimetype },
      });

      await file.makePublic();

      const publicUrl = `https://storage.googleapis.com/${storageBucket.name}/${fileName}`;

      res.status(200).json({ success: true, data: { thumbnail_url: publicUrl } });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to upload thumbnail' });
    }
  }

}