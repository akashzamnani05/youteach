// src/controllers/students.controller.ts

import { Request, Response } from 'express';
import { StudentsService } from '../services/students.service';
import { StudentSignupData } from '../types';

export class StudentsController {
  // Get all students for logged-in teacher
  static async getStudents(req: Request, res: Response): Promise<void> {
    try {
      const teacherId = req.user?.userId;

      if (!teacherId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      // Get teacher profile ID from user ID
      const { AuthService } = await import('../services/auth.service');
      const teacherProfile = await AuthService.getUserWithRole(teacherId);
      
      if (!teacherProfile || !teacherProfile.teacher_profile_id) {
        res.status(403).json({
          success: false,
          message: 'Teacher profile not found',
        });
        return;
      }

      const students = await StudentsService.getStudentsByTeacherId(
        teacherProfile.teacher_profile_id
      );

      res.status(200).json({
        success: true,
        message: 'Students retrieved successfully',
        data: {
          students,
          count: students.length,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch students',
      });
    }
  }

  // Get single student by ID
  static async getStudentById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const teacherId = req.user?.userId;

      if (!teacherId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      // Get teacher profile ID from user ID
      const { AuthService } = await import('../services/auth.service');
      const teacherProfile = await AuthService.getUserWithRole(teacherId);
      
      if (!teacherProfile || !teacherProfile.teacher_profile_id) {
        res.status(403).json({
          success: false,
          message: 'Teacher profile not found',
        });
        return;
      }

      const student = await StudentsService.getStudentById(
        id,
        teacherProfile.teacher_profile_id
      );

      if (!student) {
        res.status(404).json({
          success: false,
          message: 'Student not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Student retrieved successfully',
        data: { student },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch student',
      });
    }
  }

  // Create new student
  static async createStudent(req: Request, res: Response): Promise<void> {
    try {
      const data: StudentSignupData = req.body;
      const teacherId = req.user?.userId;

      if (!teacherId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      // Get teacher profile ID from user ID
      const { AuthService } = await import('../services/auth.service');
      const teacherProfile = await AuthService.getUserWithRole(teacherId);
      
      if (!teacherProfile || !teacherProfile.teacher_profile_id) {
        res.status(403).json({
          success: false,
          message: 'Teacher profile not found',
        });
        return;
      }

      const { student, password } = await StudentsService.createStudent(
        data,
        teacherProfile.teacher_profile_id
      );

      res.status(201).json({
        success: true,
        message: 'Student created successfully',
        data: {
          student,
          temporaryPassword: password,
        },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to create student',
      });
    }
  }

  // Delete student
  static async deleteStudent(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const teacherId = req.user?.userId;

      if (!teacherId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      // Get teacher profile ID from user ID
      const { AuthService } = await import('../services/auth.service');
      const teacherProfile = await AuthService.getUserWithRole(teacherId);
      
      if (!teacherProfile || !teacherProfile.teacher_profile_id) {
        res.status(403).json({
          success: false,
          message: 'Teacher profile not found',
        });
        return;
      }

      await StudentsService.deleteStudent(id, teacherProfile.teacher_profile_id);

      res.status(200).json({
        success: true,
        message: 'Student deleted successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to delete student',
      });
    }
  }
}