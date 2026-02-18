"use strict";
// src/services/auth.service.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const database_1 = require("../config/database");
const password_utils_1 = require("../utils/password.utils");
const jwt_utils_1 = require("../utils/jwt.utils");
const slug_utils_1 = require("../utils/slug.utils");
class AuthService {
    // Login
    static async login(credentials) {
        const { email, password } = credentials;
        // Get user with password
        const user = await (0, database_1.queryOne)(`SELECT * FROM users WHERE email = ? AND is_active = TRUE`, [email]);
        if (!user) {
            throw new Error('Invalid email or password');
        }
        // Verify password
        const isPasswordValid = await (0, password_utils_1.comparePassword)(password, user.password_hash);
        if (!isPasswordValid) {
            throw new Error('Invalid email or password');
        }
        // Get user role
        const userWithRole = await this.getUserWithRole(user.id);
        if (!userWithRole) {
            throw new Error('User profile not found');
        }
        // Generate tokens
        const tokenPayload = {
            userId: user.id,
            email: user.email,
            role: userWithRole.role,
        };
        const tokens = (0, jwt_utils_1.generateTokens)(tokenPayload);
        // Remove password from response
        const { password_hash, ...userWithoutPassword } = user;
        return {
            user: { ...userWithoutPassword, ...userWithRole },
            tokens,
        };
    }
    // Teacher Signup
    static async signupTeacher(data) {
        const { email, password, full_name, phone, bio, headline, specializations, experience_years, hourly_rate } = data;
        return await (0, database_1.transaction)(async (connection) => {
            // Check if email exists
            const [existingUser] = await connection.execute('SELECT id FROM users WHERE email = ?', [email]);
            if (existingUser.length > 0) {
                throw new Error('Email already registered');
            }
            // Hash password
            const password_hash = await (0, password_utils_1.hashPassword)(password);
            // Insert user (MySQL will auto-generate UUID via DEFAULT (UUID()))
            await connection.execute(`INSERT INTO users (email, password_hash, full_name, phone, is_active, email_verified)
         VALUES (?, ?, ?, ?, TRUE, FALSE)`, [email, password_hash, full_name, phone || null]);
            // Get the generated user ID
            const [userRows] = await connection.execute('SELECT id FROM users WHERE email = ? ORDER BY created_at DESC LIMIT 1', [email]);
            const userId = userRows[0].id;
            // Generate unique website slug
            const baseSlug = (0, slug_utils_1.generateSlug)(full_name);
            const [existingSlugs] = await connection.execute('SELECT website_slug FROM teacher_profiles WHERE website_slug LIKE ?', [`${baseSlug}%`]);
            let websiteSlug = baseSlug;
            if (existingSlugs.length > 0) {
                websiteSlug = `${baseSlug}-${(0, slug_utils_1.generateRandomSuffix)(6)}`;
            }
            // Insert teacher profile (MySQL will auto-generate UUID)
            await connection.execute(`INSERT INTO teacher_profiles (
          user_id, bio, headline, specializations, experience_years, 
          website_slug, hourly_rate, rating, total_students, total_courses, is_verified
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 0.00, 0, 0, FALSE)`, [
                userId,
                bio || null,
                headline || null,
                specializations ? JSON.stringify(specializations) : null,
                experience_years || null,
                websiteSlug,
                hourly_rate || null,
            ]);
            // Get created user with role from within the transaction
            const [userWithRoleRows] = await connection.execute(`SELECT 
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
         WHERE u.id = ?`, [userId]);
            const userWithRole = userWithRoleRows[0];
            if (!userWithRole) {
                throw new Error('Failed to create user profile');
            }
            // Generate tokens
            const tokenPayload = {
                userId,
                email,
                role: 'teacher',
            };
            const tokens = (0, jwt_utils_1.generateTokens)(tokenPayload);
            return { user: userWithRole, tokens };
        });
    }
    // Student Signup
    static async signupStudent(data) {
        const { email, password, full_name, phone, date_of_birth, interests, education_level } = data;
        return await (0, database_1.transaction)(async (connection) => {
            // Check if email exists
            const [existingUser] = await connection.execute('SELECT id FROM users WHERE email = ?', [email]);
            if (existingUser.length > 0) {
                throw new Error('Email already registered');
            }
            // Hash password
            const password_hash = await (0, password_utils_1.hashPassword)(password);
            // Insert user (MySQL will auto-generate UUID via DEFAULT (UUID()))
            await connection.execute(`INSERT INTO users (email, password_hash, full_name, phone, is_active, email_verified)
         VALUES (?, ?, ?, ?, TRUE, FALSE)`, [email, password_hash, full_name, phone || null]);
            // Get the generated user ID
            const [userRows] = await connection.execute('SELECT id FROM users WHERE email = ? ORDER BY created_at DESC LIMIT 1', [email]);
            const userId = userRows[0].id;
            // Insert student profile (MySQL will auto-generate UUID)
            await connection.execute(`INSERT INTO student_profiles (
          user_id, date_of_birth, interests, education_level
        ) VALUES (?, ?, ?, ?)`, [
                userId,
                date_of_birth || null,
                interests ? JSON.stringify(interests) : null,
                education_level || null,
            ]);
            // Get created user with role from within the transaction
            const [userWithRoleRows] = await connection.execute(`SELECT 
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
         WHERE u.id = ?`, [userId]);
            const userWithRole = userWithRoleRows[0];
            if (!userWithRole) {
                throw new Error('Failed to create user profile');
            }
            // Generate tokens
            const tokenPayload = {
                userId,
                email,
                role: 'student',
            };
            const tokens = (0, jwt_utils_1.generateTokens)(tokenPayload);
            return { user: userWithRole, tokens };
        });
    }
    // Teacher creates a student
    static async createStudentForTeacher(data, teacherId) {
        const { email, password, full_name, phone, date_of_birth, interests, education_level } = data;
        return await (0, database_1.transaction)(async (connection) => {
            // Check if email exists
            const [existingUser] = await connection.execute('SELECT id FROM users WHERE email = ?', [email]);
            if (existingUser.length > 0) {
                throw new Error('Email already registered');
            }
            // Hash password
            const password_hash = await (0, password_utils_1.hashPassword)(password);
            // Insert user (MySQL will auto-generate UUID via DEFAULT (UUID()))
            await connection.execute(`INSERT INTO users (email, password_hash, full_name, phone, is_active, email_verified)
         VALUES (?, ?, ?, ?, TRUE, FALSE)`, [email, password_hash, full_name, phone || null]);
            // Get the generated user ID
            const [userRows] = await connection.execute('SELECT id FROM users WHERE email = ? ORDER BY created_at DESC LIMIT 1', [email]);
            const userId = userRows[0].id;
            // Insert student profile with teacher_id
            await connection.execute(`INSERT INTO student_profiles (
          user_id, teacher_id, date_of_birth, interests, education_level
        ) VALUES (?, ?, ?, ?, ?)`, [
                userId,
                teacherId, // Link to teacher
                date_of_birth || null,
                interests ? JSON.stringify(interests) : null,
                education_level || null,
            ]);
            // Get created user with role from within the transaction
            const [userWithRoleRows] = await connection.execute(`SELECT 
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
         WHERE u.id = ?`, [userId]);
            const userWithRole = userWithRoleRows[0];
            if (!userWithRole) {
                throw new Error('Failed to create user profile');
            }
            // Return user and plain password (teacher needs to give this to student)
            return { user: userWithRole, password };
        });
    }
    // Get user with role info
    static async getUserWithRole(userId) {
        const result = await (0, database_1.queryOne)(`SELECT 
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
       WHERE u.id = ?`, [userId]);
        return result;
    }
    // Refresh tokens
    static async refreshTokens(userId, email, role) {
        const tokenPayload = {
            userId,
            email,
            role,
        };
        return (0, jwt_utils_1.generateTokens)(tokenPayload);
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map