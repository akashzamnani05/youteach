// src/controllers/student-webinar.controller.ts

import { Request, Response } from 'express';
import { StudentWebinarService } from '../services/student-webinar.service';
import { AuthService } from '../services/auth.service';

export class StudentWebinarController {
  // Get all webinars for logged-in student
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

      // Get student profile
      const userWithRole = await AuthService.getUserWithRole(userId);
      if (!userWithRole || !userWithRole.student_profile_id) {
        res.status(403).json({
          success: false,
          message: 'Student profile not found',
        });
        return;
      }

      const webinars = await StudentWebinarService.getWebinarsForStudent(
        userWithRole.student_profile_id
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

  // Get registered webinars for logged-in student
  static async getRegisteredWebinars(req: Request, res: Response): Promise<void> {
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

      const webinars = await StudentWebinarService.getRegisteredWebinars(
        userWithRole.student_profile_id
      );

      res.status(200).json({
        success: true,
        message: 'Registered webinars retrieved successfully',
        data: {
          webinars,
          count: webinars.length,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch registered webinars',
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

      // Get student profile
      const userWithRole = await AuthService.getUserWithRole(userId);
      if (!userWithRole || !userWithRole.student_profile_id) {
        res.status(403).json({
          success: false,
          message: 'Student profile not found',
        });
        return;
      }

      const webinar = await StudentWebinarService.getWebinarById(
        id,
        userWithRole.student_profile_id
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

  // Register for a webinar
  static async registerForWebinar(req: Request, res: Response): Promise<void> {
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

      const result = await StudentWebinarService.registerForWebinar(
        id,
        userWithRole.student_profile_id
      );

      res.status(200).json({
        success: true,
        message: 'Successfully registered for webinar',
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to register for webinar',
      });
    }
  }

  // Unregister from a webinar
  static async unregisterFromWebinar(req: Request, res: Response): Promise<void> {
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

      await StudentWebinarService.unregisterFromWebinar(
        id,
        userWithRole.student_profile_id
      );

      res.status(200).json({
        success: true,
        message: 'Successfully unregistered from webinar',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to unregister from webinar',
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

      // Get student profile
      const userWithRole = await AuthService.getUserWithRole(userId);
      if (!userWithRole || !userWithRole.student_profile_id) {
        res.status(403).json({
          success: false,
          message: 'Student profile not found',
        });
        return;
      }

      const webinars = await StudentWebinarService.getUpcomingWebinars(
        userWithRole.student_profile_id
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
}