// src/controllers/batches.controller.ts

import { Request, Response } from 'express';
import { BatchesService } from '../services/batches.service';
import { AuthService } from '../services/auth.service';
import {
  CreateBatchData,
  UpdateBatchData,
  CreateSessionsData,
  MarkAttendanceItem,
} from '../types/batches.types';

export class BatchesController {
  // ─── Teacher's enrolled students ────────────────────────────

  // GET /api/batches/teacher-students
  static async getTeacherStudents(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) { res.status(401).json({ success: false, message: 'Unauthorized' }); return; }

      const userWithRole = await AuthService.getUserWithRole(userId);
      if (!userWithRole?.teacher_profile_id) {
        res.status(403).json({ success: false, message: 'Only teachers can access this' });
        return;
      }

      const students = await BatchesService.getTeacherStudents(userWithRole.teacher_profile_id);
      res.status(200).json({ success: true, message: 'Students retrieved', data: { students } });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to get students' });
    }
  }

  // ─── Batch CRUD ──────────────────────────────────────────────

  // GET /api/batches
  static async getBatches(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) { res.status(401).json({ success: false, message: 'Unauthorized' }); return; }

      const userWithRole = await AuthService.getUserWithRole(userId);
      if (!userWithRole) { res.status(401).json({ success: false, message: 'User not found' }); return; }

      let batches;
      if (userWithRole.role === 'teacher') {
        if (!userWithRole.teacher_profile_id) {
          res.status(403).json({ success: false, message: 'Teacher profile not found' });
          return;
        }
        batches = await BatchesService.getTeacherBatches(userWithRole.teacher_profile_id);
      } else {
        batches = await BatchesService.getStudentBatches(userId);
      }

      res.status(200).json({ success: true, message: 'Batches retrieved', data: { batches } });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to get batches' });
    }
  }

  // POST /api/batches
  static async createBatch(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) { res.status(401).json({ success: false, message: 'Unauthorized' }); return; }

      const userWithRole = await AuthService.getUserWithRole(userId);
      if (!userWithRole?.teacher_profile_id) {
        res.status(403).json({ success: false, message: 'Only teachers can create batches' });
        return;
      }

      const data: CreateBatchData = req.body;
      if (!data.name?.trim()) { res.status(400).json({ success: false, message: 'Name is required' }); return; }
      if (!data.meeting_link?.trim()) { res.status(400).json({ success: false, message: 'Meeting link is required' }); return; }
      if (!data.class_time) { res.status(400).json({ success: false, message: 'Class time is required' }); return; }
      if (!data.session_type) { res.status(400).json({ success: false, message: 'Session type is required' }); return; }

      const batch = await BatchesService.createBatch(data, userWithRole.teacher_profile_id);
      res.status(201).json({ success: true, message: 'Batch created successfully', data: { batch } });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || 'Failed to create batch' });
    }
  }

  // GET /api/batches/:id
  static async getBatch(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) { res.status(401).json({ success: false, message: 'Unauthorized' }); return; }

      const userWithRole = await AuthService.getUserWithRole(userId);
      if (!userWithRole?.teacher_profile_id) {
        res.status(403).json({ success: false, message: 'Only teachers can access this' });
        return;
      }

      const batch = await BatchesService.getBatch(req.params.id, userWithRole.teacher_profile_id);
      res.status(200).json({ success: true, message: 'Batch retrieved', data: { batch } });
    } catch (error: any) {
      const status = error.message.includes('not found') ? 404 : 500;
      res.status(status).json({ success: false, message: error.message || 'Failed to get batch' });
    }
  }

  // PUT /api/batches/:id
  static async updateBatch(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) { res.status(401).json({ success: false, message: 'Unauthorized' }); return; }

      const userWithRole = await AuthService.getUserWithRole(userId);
      if (!userWithRole?.teacher_profile_id) {
        res.status(403).json({ success: false, message: 'Only teachers can edit batches' });
        return;
      }

      const data: UpdateBatchData = req.body;
      const batch = await BatchesService.updateBatch(req.params.id, userWithRole.teacher_profile_id, data);
      res.status(200).json({ success: true, message: 'Batch updated', data: { batch } });
    } catch (error: any) {
      const status = error.message.includes('not found') ? 404 : 400;
      res.status(status).json({ success: false, message: error.message || 'Failed to update batch' });
    }
  }

  // DELETE /api/batches/:id
  static async deleteBatch(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) { res.status(401).json({ success: false, message: 'Unauthorized' }); return; }

      const userWithRole = await AuthService.getUserWithRole(userId);
      if (!userWithRole?.teacher_profile_id) {
        res.status(403).json({ success: false, message: 'Only teachers can delete batches' });
        return;
      }

      await BatchesService.deleteBatch(req.params.id, userWithRole.teacher_profile_id);
      res.status(200).json({ success: true, message: 'Batch deleted' });
    } catch (error: any) {
      const status = error.message.includes('not found') ? 404 : 400;
      res.status(status).json({ success: false, message: error.message || 'Failed to delete batch' });
    }
  }

  // ─── Student management ──────────────────────────────────────

  // GET /api/batches/:id/students
  static async getBatchStudents(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) { res.status(401).json({ success: false, message: 'Unauthorized' }); return; }

      const userWithRole = await AuthService.getUserWithRole(userId);
      if (!userWithRole?.teacher_profile_id) {
        res.status(403).json({ success: false, message: 'Only teachers can access this' });
        return;
      }

      const students = await BatchesService.getBatchStudents(req.params.id, userWithRole.teacher_profile_id);
      res.status(200).json({ success: true, message: 'Students retrieved', data: { students } });
    } catch (error: any) {
      const status = error.message.includes('not found') ? 404 : 500;
      res.status(status).json({ success: false, message: error.message || 'Failed to get students' });
    }
  }

  // POST /api/batches/:id/students
  static async addStudent(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) { res.status(401).json({ success: false, message: 'Unauthorized' }); return; }

      const userWithRole = await AuthService.getUserWithRole(userId);
      if (!userWithRole?.teacher_profile_id) {
        res.status(403).json({ success: false, message: 'Only teachers can add students' });
        return;
      }

      const { student_user_id } = req.body;
      if (!student_user_id) {
        res.status(400).json({ success: false, message: 'student_user_id is required' });
        return;
      }

      await BatchesService.addStudent(req.params.id, student_user_id, userWithRole.teacher_profile_id);
      res.status(200).json({ success: true, message: 'Student added to batch' });
    } catch (error: any) {
      const status = error.message.includes('not found') ? 404 : 400;
      res.status(status).json({ success: false, message: error.message || 'Failed to add student' });
    }
  }

  // DELETE /api/batches/:id/students/:studentUserId
  static async removeStudent(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) { res.status(401).json({ success: false, message: 'Unauthorized' }); return; }

      const userWithRole = await AuthService.getUserWithRole(userId);
      if (!userWithRole?.teacher_profile_id) {
        res.status(403).json({ success: false, message: 'Only teachers can remove students' });
        return;
      }

      await BatchesService.removeStudent(req.params.id, req.params.studentUserId, userWithRole.teacher_profile_id);
      res.status(200).json({ success: true, message: 'Student removed from batch' });
    } catch (error: any) {
      const status = error.message.includes('not found') ? 404 : 400;
      res.status(status).json({ success: false, message: error.message || 'Failed to remove student' });
    }
  }

  // ─── Sessions ────────────────────────────────────────────────

  // GET /api/batches/:id/sessions
  static async getBatchSessions(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) { res.status(401).json({ success: false, message: 'Unauthorized' }); return; }

      const userWithRole = await AuthService.getUserWithRole(userId);
      if (!userWithRole?.teacher_profile_id) {
        res.status(403).json({ success: false, message: 'Only teachers can access this' });
        return;
      }

      const sessions = await BatchesService.getBatchSessions(req.params.id, userWithRole.teacher_profile_id);
      res.status(200).json({ success: true, message: 'Sessions retrieved', data: { sessions } });
    } catch (error: any) {
      const status = error.message.includes('not found') ? 404 : 500;
      res.status(status).json({ success: false, message: error.message || 'Failed to get sessions' });
    }
  }

  // POST /api/batches/:id/sessions
  static async createSessions(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) { res.status(401).json({ success: false, message: 'Unauthorized' }); return; }

      const userWithRole = await AuthService.getUserWithRole(userId);
      if (!userWithRole?.teacher_profile_id) {
        res.status(403).json({ success: false, message: 'Only teachers can create sessions' });
        return;
      }

      const data: CreateSessionsData = req.body;
      const sessions = await BatchesService.createSessions(req.params.id, data, userWithRole.teacher_profile_id);
      res.status(201).json({ success: true, message: 'Sessions created', data: { sessions } });
    } catch (error: any) {
      const status = error.message.includes('not found') ? 404 : 400;
      res.status(status).json({ success: false, message: error.message || 'Failed to create sessions' });
    }
  }

  // ─── Attendance ──────────────────────────────────────────────

  // DELETE /api/batch-sessions/:sessionId
  static async deleteSession(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) { res.status(401).json({ success: false, message: 'Unauthorized' }); return; }

      const userWithRole = await AuthService.getUserWithRole(userId);
      if (!userWithRole?.teacher_profile_id) {
        res.status(403).json({ success: false, message: 'Only teachers can delete sessions' });
        return;
      }

      await BatchesService.deleteSession(req.params.sessionId, userWithRole.teacher_profile_id);
      res.status(200).json({ success: true, message: 'Session deleted' });
    } catch (error: any) {
      const status = error.message.includes('not found') ? 404 : 400;
      res.status(status).json({ success: false, message: error.message || 'Failed to delete session' });
    }
  }

  // GET /api/batch-sessions/:sessionId
  static async getSessionDetails(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) { res.status(401).json({ success: false, message: 'Unauthorized' }); return; }

      const userWithRole = await AuthService.getUserWithRole(userId);
      if (!userWithRole?.teacher_profile_id) {
        res.status(403).json({ success: false, message: 'Only teachers can access this' });
        return;
      }

      const result = await BatchesService.getSessionWithAttendance(
        req.params.sessionId,
        userWithRole.teacher_profile_id
      );
      res.status(200).json({ success: true, message: 'Session retrieved', data: result });
    } catch (error: any) {
      const status = error.message.includes('not found') ? 404 : 500;
      res.status(status).json({ success: false, message: error.message || 'Failed to get session' });
    }
  }

  // PUT /api/batch-sessions/:sessionId/attendance
  static async markAttendance(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) { res.status(401).json({ success: false, message: 'Unauthorized' }); return; }

      const userWithRole = await AuthService.getUserWithRole(userId);
      if (!userWithRole?.teacher_profile_id) {
        res.status(403).json({ success: false, message: 'Only teachers can mark attendance' });
        return;
      }

      const records: MarkAttendanceItem[] = req.body.records;
      if (!Array.isArray(records)) {
        res.status(400).json({ success: false, message: 'records array is required' });
        return;
      }

      await BatchesService.markAttendance(req.params.sessionId, records, userWithRole.teacher_profile_id);
      res.status(200).json({ success: true, message: 'Attendance saved' });
    } catch (error: any) {
      const status = error.message.includes('not found') ? 404 : 400;
      res.status(status).json({ success: false, message: error.message || 'Failed to mark attendance' });
    }
  }
}
