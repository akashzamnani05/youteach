"use strict";
// src/services/students.service.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentsService = void 0;
const database_1 = require("../config/database");
const password_utils_1 = require("../utils/password.utils");
class StudentsService {
    // Get all students for a teacher
    static async getStudentsByTeacherId(teacherId) {
        const students = await (0, database_1.query)(`SELECT 
        u.id,
        u.email,
        u.full_name,
        u.phone,
        u.is_active,
        u.email_verified,
        u.created_at,
        sp.id as profile_id,
        sp.user_id,
        sp.teacher_id,
        sp.date_of_birth,
        sp.interests,
        sp.education_level,
        sp.bio
       FROM student_profiles sp
       JOIN users u ON sp.user_id = u.id
       WHERE sp.teacher_id = ? AND u.is_active = 1
       ORDER BY u.created_at DESC`, [teacherId]);
        // Parse JSON fields
        return students.map(student => ({
            ...student,
            interests: student.interests ? JSON.parse(student.interests) : [],
        }));
    }
    // Get single student by ID (with teacher verification)
    static async getStudentById(studentId, teacherId) {
        const student = await (0, database_1.queryOne)(`SELECT 
        u.id,
        u.email,
        u.full_name,
        u.phone,
        u.is_active,
        u.email_verified,
        u.created_at,
        sp.id as profile_id,
        sp.user_id,
        sp.teacher_id,
        sp.date_of_birth,
        sp.interests,
        sp.education_level,
        sp.bio
       FROM student_profiles sp
       JOIN users u ON sp.user_id = u.id
       WHERE sp.user_id = ? AND sp.teacher_id = ?`, [studentId, teacherId]);
        if (!student)
            return null;
        // Parse JSON fields
        return {
            ...student,
            interests: student.interests ? JSON.parse(student.interests) : [],
        };
    }
    // Create new student
    static async createStudent(data, teacherId) {
        const { email, password, full_name, phone, date_of_birth, interests, education_level } = data;
        return await (0, database_1.transaction)(async (connection) => {
            // Check if email exists
            const [existingUser] = await connection.execute('SELECT id FROM users WHERE email = ?', [email]);
            if (existingUser.length > 0) {
                throw new Error('Email already registered');
            }
            // Hash password
            const password_hash = await (0, password_utils_1.hashPassword)(password);
            // Insert user
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
                teacherId,
                date_of_birth || null,
                interests ? JSON.stringify(interests) : null,
                education_level || null,
            ]);
            // Get created student
            const [studentRows] = await connection.execute(`SELECT 
          u.id,
          u.email,
          u.full_name,
          u.phone,
          u.is_active,
          u.email_verified,
          u.created_at,
          sp.id as profile_id,
          sp.user_id,
          sp.teacher_id,
          sp.date_of_birth,
          sp.interests,
          sp.education_level,
          sp.bio
         FROM student_profiles sp
         JOIN users u ON sp.user_id = u.id
         WHERE sp.user_id = ?`, [userId]);
            const student = studentRows[0];
            return {
                student: {
                    ...student,
                    interests: student.interests ? JSON.parse(student.interests) : [],
                },
                password,
            };
        });
    }
    // Delete student (soft delete by deactivating user)
    static async deleteStudent(studentId, teacherId) {
        return await (0, database_1.transaction)(async (connection) => {
            // Verify student belongs to teacher
            const [studentRows] = await connection.execute('SELECT user_id FROM student_profiles WHERE user_id = ? AND teacher_id = ?', [studentId, teacherId]);
            if (studentRows.length === 0) {
                throw new Error('Student not found or unauthorized');
            }
            const userId = studentRows[0].user_id;
            // Soft delete - deactivate user
            await connection.execute('UPDATE users SET is_active = FALSE WHERE id = ?', [userId]);
            // Alternatively, hard delete (uncomment if you want to completely remove):
            // await connection.execute('DELETE FROM users WHERE id = ?', [userId]);
            return true;
        });
    }
    // Get student count for teacher
    static async getStudentCount(teacherId) {
        const result = await (0, database_1.queryOne)(`SELECT COUNT(*) as count 
       FROM student_profiles sp
       JOIN users u ON sp.user_id = u.id
       WHERE sp.teacher_id = ? AND u.is_active = TRUE`, [teacherId]);
        return result?.count || 0;
    }
}
exports.StudentsService = StudentsService;
//# sourceMappingURL=students.service.js.map