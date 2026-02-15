// src/controllers/webinar.controller.ts

import { Request, Response } from 'express';
import { WebinarService } from '../services/webinar.service';
import { AuthService } from '../services/auth.service';
import { CreateWebinarData, UpdateWebinarData } from '../types';

export class WebinarController {
  // Get all webinars for logged-in teacher
  static async getAllWebinars(req: Request, res: Response): Promise<void> {
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

      const webinars = await WebinarService.getWebinarsByTeacher(
        userWithRole.teacher_profile_id
      );

      res.status(200).json({
        success: true,
        message: 'Webinars retrieved successfully',
        data: {
          webinars,
          count: webinars.length,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch webinars',
      });
    }
  }

  // Get single webinar by ID
  static async getWebinarById(req: Request, res: Response): Promise<void> {
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

      const webinar = await WebinarService.getWebinarById(
        id,
        userWithRole.teacher_profile_id
      );

      if (!webinar) {
        res.status(404).json({
          success: false,
          message: 'Webinar not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Webinar retrieved successfully',
        data: { webinar },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch webinar',
      });
    }
  }

  // Create new webinar
  static async createWebinar(req: Request, res: Response): Promise<void> {
    try {
      const data: CreateWebinarData = req.body;
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

      const webinar = await WebinarService.createWebinar(
        data,
        userWithRole.teacher_profile_id
      );

      res.status(201).json({
        success: true,
        message: 'Webinar created successfully',
        data: { webinar },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to create webinar',
      });
    }
  }

  // Update webinar
  static async updateWebinar(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data: UpdateWebinarData = req.body;
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

      const webinar = await WebinarService.updateWebinar(
        id,
        userWithRole.teacher_profile_id,
        data
      );

      res.status(200).json({
        success: true,
        message: 'Webinar updated successfully',
        data: { webinar },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update webinar',
      });
    }
  }

  // Delete webinar
  static async deleteWebinar(req: Request, res: Response): Promise<void> {
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

      await WebinarService.deleteWebinar(id, userWithRole.teacher_profile_id);

      res.status(200).json({
        success: true,
        message: 'Webinar deleted successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to delete webinar',
      });
    }
  }

  // Get upcoming webinars
  static async getUpcomingWebinars(req: Request, res: Response): Promise<void> {
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

      const webinars = await WebinarService.getUpcomingWebinars(
        userWithRole.teacher_profile_id
      );

      res.status(200).json({
        success: true,
        message: 'Upcoming webinars retrieved successfully',
        data: {
          webinars,
          count: webinars.length,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch upcoming webinars',
      });
    }
  }

  // Get registered students for a webinar
  static async getRegisteredStudents(req: Request, res: Response): Promise<void> {
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

      const students = await WebinarService.getRegisteredStudents(
        id,
        userWithRole.teacher_profile_id
      );

      res.status(200).json({
        success: true,
        message: 'Registered students retrieved successfully',
        data: {
          students,
          count: students.length,
        },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to fetch registered students',
      });
    }
  }
}