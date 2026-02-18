// src/services/auth.service.ts

import { query, queryOne, transaction } from '../config/database';
import {
  User,
  UserWithRole,
  LoginCredentials,
  TeacherSignupData,
  StudentSignupData,
  AuthTokens,
  TokenPayload,
} from '../types';
import { hashPassword, comparePassword } from '../utils/password.utils';
import { generateTokens } from '../utils/jwt.utils';
import { generateSlug, generateRandomSuffix } from '../utils/slug.utils';

export class AuthService {
  // Login
  static async login(
    credentials: LoginCredentials
  ): Promise<{ user: UserWithRole; tokens: AuthTokens }> {
    const { email, password } = credentials;

    // Get user with password
    const user = await queryOne<User & { password_hash: string }>(
      `SELECT * FROM users WHERE email = ? AND is_active = TRUE`,
      [email]
    );

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Get user role
    const userWithRole = await this.getUserWithRole(user.id);
    if (!userWithRole) {
      throw new Error('User profile not found');
    }

    // Generate tokens
    const tokenPayload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: userWithRole.role,
    };
    const tokens = generateTokens(tokenPayload);

    // Remove password from response
    const { password_hash, ...userWithoutPassword } = user;

    return {
      user: { ...userWithoutPassword, ...userWithRole },
      tokens,
    };
  }

  // Teacher Signup
  static async signupTeacher(
    data: TeacherSignupData
  ): Promise<{ user: UserWithRole; tokens: AuthTokens }> {
    const { email, password, full_name, phone, bio, headline, specializations, experience_years } = data;

    return await transaction(async (connection) => {
      // Check if email exists
      const [existingUser] = await connection.execute(
        'SELECT id FROM users WHERE email = ?',
        [email]
      );

      if ((existingUser as any[]).length > 0) {
        throw new Error('Email already registered');
      }

      // Hash password
      const password_hash = await hashPassword(password);

      // Insert user (MySQL will auto-generate UUID via DEFAULT (UUID()))
      await connection.execute(
        `INSERT INTO users (email, password_hash, full_name, phone, is_active, email_verified)
         VALUES (?, ?, ?, ?, TRUE, FALSE)`,
        [email, password_hash, full_name, phone || null]
      );

      // Get the generated user ID
      const [userRows] = await connection.execute(
        'SELECT id FROM users WHERE email = ? ORDER BY created_at DESC LIMIT 1',
        [email]
      );
      const userId = (userRows as any[])[0].id;

      // Generate unique website slug
      const baseSlug = generateSlug(full_name);
      const [existingSlugs] = await connection.execute(
        'SELECT website_slug FROM teacher_profiles WHERE website_slug LIKE ?',
        [`${baseSlug}%`]
      );

      let websiteSlug = baseSlug;
      if ((existingSlugs as any[]).length > 0) {
        websiteSlug = `${baseSlug}-${generateRandomSuffix(6)}`;
      }

      // Insert teacher profile (MySQL will auto-generate UUID)
      await connection.execute(
        `INSERT INTO teacher_profiles (
          user_id, bio, headline, specializations, experience_years,
          website_slug, rating, total_students, total_courses, is_verified
        ) VALUES (?, ?, ?, ?, ?, ?, 0.00, 0, 0, FALSE)`,
        [
          userId,
          bio || null,
          headline || null,
          specializations ? JSON.stringify(specializations) : null,
          experience_years || null,
          websiteSlug,
        ]
      );

      // Get created user with role from within the transaction
      const [userWithRoleRows] = await connection.execute(
        `SELECT 
          u.*,
          CASE 
            WHEN tp.id IS NOT NULL THEN 'teacher'
            WHEN sp.id IS NOT NULL THEN 'student'
            ELSE 'none'
          END as role,
          tp.id as teacher_profile_id,
          tp.website_slug,
          sp.id as student_profile_id
         FROM users u
         LEFT JOIN teacher_profiles tp ON u.id = tp.user_id
         LEFT JOIN student_profiles sp ON u.id = sp.user_id
         WHERE u.id = ?`,
        [userId]
      );

      const userWithRole = (userWithRoleRows as any[])[0];
      if (!userWithRole) {
        throw new Error('Failed to create user profile');
      }

      // Generate tokens
      const tokenPayload: TokenPayload = {
        userId,
        email,
        role: 'teacher',
      };
      const tokens = generateTokens(tokenPayload);

      return { user: userWithRole, tokens };
    });
  }

  // Student Signup
  static async signupStudent(
    data: StudentSignupData
  ): Promise<{ user: UserWithRole; tokens: AuthTokens }> {
    const { email, password, full_name, phone, date_of_birth, interests, education_level } = data;

    return await transaction(async (connection) => {
      // Check if email exists
      const [existingUser] = await connection.execute(
        'SELECT id FROM users WHERE email = ?',
        [email]
      );

      if ((existingUser as any[]).length > 0) {
        throw new Error('Email already registered');
      }

      // Hash password
      const password_hash = await hashPassword(password);

      // Insert user (MySQL will auto-generate UUID via DEFAULT (UUID()))
      await connection.execute(
        `INSERT INTO users (email, password_hash, full_name, phone, is_active, email_verified)
         VALUES (?, ?, ?, ?, TRUE, FALSE)`,
        [email, password_hash, full_name, phone || null]
      );

      // Get the generated user ID
      const [userRows] = await connection.execute(
        'SELECT id FROM users WHERE email = ? ORDER BY created_at DESC LIMIT 1',
        [email]
      );
      const userId = (userRows as any[])[0].id;

      // Insert student profile (MySQL will auto-generate UUID)
      await connection.execute(
        `INSERT INTO student_profiles (
          user_id, date_of_birth, interests, education_level
        ) VALUES (?, ?, ?, ?)`,
        [
          userId,
          date_of_birth || null,
          interests ? JSON.stringify(interests) : null,
          education_level || null,
        ]
      );

      // Get created user with role from within the transaction
      const [userWithRoleRows] = await connection.execute(
        `SELECT 
          u.*,
          CASE 
            WHEN tp.id IS NOT NULL THEN 'teacher'
            WHEN sp.id IS NOT NULL THEN 'student'
            ELSE 'none'
          END as role,
          tp.id as teacher_profile_id,
          tp.website_slug,
          sp.id as student_profile_id
         FROM users u
         LEFT JOIN teacher_profiles tp ON u.id = tp.user_id
         LEFT JOIN student_profiles sp ON u.id = sp.user_id
         WHERE u.id = ?`,
        [userId]
      );

      const userWithRole = (userWithRoleRows as any[])[0];
      if (!userWithRole) {
        throw new Error('Failed to create user profile');
      }

      // Generate tokens
      const tokenPayload: TokenPayload = {
        userId,
        email,
        role: 'student',
      };
      const tokens = generateTokens(tokenPayload);

      return { user: userWithRole, tokens };
    });
  }

  // Teacher creates a student
  static async createStudentForTeacher(
    data: StudentSignupData,
    teacherId: string
  ): Promise<{ user: UserWithRole; password: string }> {
    const { email, password, full_name, phone, date_of_birth, interests, education_level } = data;

    return await transaction(async (connection) => {
      // Check if email exists
      const [existingUser] = await connection.execute(
        'SELECT id FROM users WHERE email = ?',
        [email]
      );

      if ((existingUser as any[]).length > 0) {
        throw new Error('Email already registered');
      }

      // Hash password
      const password_hash = await hashPassword(password);

      // Insert user (MySQL will auto-generate UUID via DEFAULT (UUID()))
      await connection.execute(
        `INSERT INTO users (email, password_hash, full_name, phone, is_active, email_verified)
         VALUES (?, ?, ?, ?, TRUE, FALSE)`,
        [email, password_hash, full_name, phone || null]
      );

      // Get the generated user ID
      const [userRows] = await connection.execute(
        'SELECT id FROM users WHERE email = ? ORDER BY created_at DESC LIMIT 1',
        [email]
      );
      const userId = (userRows as any[])[0].id;

      // Insert student profile with teacher_id
      await connection.execute(
        `INSERT INTO student_profiles (
          user_id, teacher_id, date_of_birth, interests, education_level
        ) VALUES (?, ?, ?, ?, ?)`,
        [
          userId,
          teacherId, // Link to teacher
          date_of_birth || null,
          interests ? JSON.stringify(interests) : null,
          education_level || null,
        ]
      );

      // Get created user with role from within the transaction
      const [userWithRoleRows] = await connection.execute(
        `SELECT 
          u.*,
          CASE 
            WHEN tp.id IS NOT NULL THEN 'teacher'
            WHEN sp.id IS NOT NULL THEN 'student'
            ELSE 'none'
          END as role,
          tp.id as teacher_profile_id,
          tp.website_slug,
          sp.id as student_profile_id
         FROM users u
         LEFT JOIN teacher_profiles tp ON u.id = tp.user_id
         LEFT JOIN student_profiles sp ON u.id = sp.user_id
         WHERE u.id = ?`,
        [userId]
      );

      const userWithRole = (userWithRoleRows as any[])[0];
      if (!userWithRole) {
        throw new Error('Failed to create user profile');
      }

      // Return user and plain password (teacher needs to give this to student)
      return { user: userWithRole, password };
    });
  }

  // Get user with role info
  static async getUserWithRole(userId: string): Promise<UserWithRole | null> {
    const result = await queryOne<any>(
      `SELECT 
        u.*,
        CASE 
          WHEN tp.id IS NOT NULL THEN 'teacher'
          WHEN sp.id IS NOT NULL THEN 'student'
          ELSE 'none'
        END as role,
        tp.id as teacher_profile_id,
        tp.website_slug,
        sp.id as student_profile_id
       FROM users u
       LEFT JOIN teacher_profiles tp ON u.id = tp.user_id
       LEFT JOIN student_profiles sp ON u.id = sp.user_id
       WHERE u.id = ?`,
      [userId]
    );

    return result;
  }

  // Refresh tokens
  static async refreshTokens(userId: string, email: string, role: 'teacher' | 'student' | 'none'): Promise<AuthTokens> {
    const tokenPayload: TokenPayload = {
      userId,
      email,
      role,
    };
    return generateTokens(tokenPayload);
  }
}