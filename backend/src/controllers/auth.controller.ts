// src/controllers/auth.controller.ts

import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import {
  LoginCredentials,
  TeacherSignupData,
  StudentSignupData,
} from '../types';

export class AuthController {
  // Login
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const credentials: LoginCredentials = req.body;

      const { user, tokens } = await AuthService.login(credentials);

      // Set tokens in HTTP-only cookies
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        domain: process.env.COOKIE_DOMAIN || undefined,
      };

      // Set access token (15 minutes)
      res.cookie('accessToken', tokens.accessToken, {
        ...cookieOptions,
        maxAge: 15 * 60 * 1000, // 15 minutes
      });

      // Set refresh token (7 days or 30 days if rememberMe)
      const refreshMaxAge = credentials.rememberMe
        ? 30 * 24 * 60 * 60 * 1000 // 30 days
        : 7 * 24 * 60 * 60 * 1000; // 7 days

      res.cookie('refreshToken', tokens.refreshToken, {
        ...cookieOptions,
        maxAge: refreshMaxAge,
      });

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user,
          tokens,
        },
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        message: error.message || 'Login failed',
      });
    }
  }

  // Teacher Signup
  static async signupTeacher(req: Request, res: Response): Promise<void> {
    try {
      const data: TeacherSignupData = req.body;

      const { user, tokens } = await AuthService.signupTeacher(data);

      // Set tokens in cookies
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        domain: process.env.COOKIE_DOMAIN || undefined,
      };

      res.cookie('accessToken', tokens.accessToken, {
        ...cookieOptions,
        maxAge: 15 * 60 * 1000,
      });

      res.cookie('refreshToken', tokens.refreshToken, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(201).json({
        success: true,
        message: 'Teacher account created successfully',
        data: {
          user,
          tokens,
        },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Signup failed',
      });
    }
  }

  // Student Signup
  static async signupStudent(req: Request, res: Response): Promise<void> {
    try {
      const data: StudentSignupData = req.body;

      const { user, tokens } = await AuthService.signupStudent(data);

      // Set tokens in cookies
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        domain: process.env.COOKIE_DOMAIN || undefined,
      };

      res.cookie('accessToken', tokens.accessToken, {
        ...cookieOptions,
        maxAge: 15 * 60 * 1000,
      });

      res.cookie('refreshToken', tokens.refreshToken, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(201).json({
        success: true,
        message: 'Student account created successfully',
        data: {
          user,
          tokens,
        },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Signup failed',
      });
    }
  }

  // Teacher Creates Student
  static async createStudent(req: Request, res: Response): Promise<void> {
    try {
      const data: StudentSignupData = req.body;
      const teacherId = req.user?.userId;

      if (!teacherId) {
        res.status(401).json({
          success: false,
          message: 'Teacher not authenticated',
        });
        return;
      }

      // Get teacher profile ID from user ID
      const teacherProfile = await AuthService.getUserWithRole(teacherId);
      if (!teacherProfile || !teacherProfile.teacher_profile_id) {
        res.status(403).json({
          success: false,
          message: 'Teacher profile not found',
        });
        return;
      }

      const { user, password } = await AuthService.createStudentForTeacher(
        data,
        teacherProfile.teacher_profile_id
      );

      res.status(201).json({
        success: true,
        message: 'Student account created successfully',
        data: {
          user,
          temporaryPassword: password, // Teacher must share this with student
        },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to create student',
      });
    }
  }

  // Refresh Token
  static async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user;
      if (!user) {
        res.status(401).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      const tokens = await AuthService.refreshTokens(
        user.userId,
        user.email,
        user.role
      );

      // Set new tokens in cookies
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        domain: process.env.COOKIE_DOMAIN || undefined,
      };

      res.cookie('accessToken', tokens.accessToken, {
        ...cookieOptions,
        maxAge: 15 * 60 * 1000,
      });

      res.cookie('refreshToken', tokens.refreshToken, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        success: true,
        message: 'Tokens refreshed successfully',
        data: { tokens },
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        message: error.message || 'Token refresh failed',
      });
    }
  }

  // Get Current User
  static async getCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user;
      if (!user) {
        res.status(401).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      const userWithRole = await AuthService.getUserWithRole(user.userId);

      res.status(200).json({
        success: true,
        message: 'User retrieved successfully',
        data: { user: userWithRole },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get user',
      });
    }
  }

  // Logout
  static async logout(req: Request, res: Response): Promise<void> {
    try {
      // Clear cookies
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');

      res.status(200).json({
        success: true,
        message: 'Logout successful',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Logout failed',
      });
    }
  }
}