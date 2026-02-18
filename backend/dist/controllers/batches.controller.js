"use strict";
// src/controllers/batches.controller.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.BatchesController = void 0;
const batches_service_1 = require("../services/batches.service");
const auth_service_1 = require("../services/auth.service");
class BatchesController {
    // ─── Teacher's enrolled students ────────────────────────────
    // GET /api/batches/teacher-students
    static async getTeacherStudents(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }
            const userWithRole = await auth_service_1.AuthService.getUserWithRole(userId);
            if (!userWithRole?.teacher_profile_id) {
                res.status(403).json({ success: false, message: 'Only teachers can access this' });
                return;
            }
            const students = await batches_service_1.BatchesService.getTeacherStudents(userWithRole.teacher_profile_id);
            res.status(200).json({ success: true, message: 'Students retrieved', data: { students } });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message || 'Failed to get students' });
        }
    }
    // ─── Batch CRUD ──────────────────────────────────────────────
    // GET /api/batches
    static async getBatches(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }
            const userWithRole = await auth_service_1.AuthService.getUserWithRole(userId);
            if (!userWithRole) {
                res.status(401).json({ success: false, message: 'User not found' });
                return;
            }
            let batches;
            if (userWithRole.role === 'teacher') {
                if (!userWithRole.teacher_profile_id) {
                    res.status(403).json({ success: false, message: 'Teacher profile not found' });
                    return;
                }
                batches = await batches_service_1.BatchesService.getTeacherBatches(userWithRole.teacher_profile_id);
            }
            else {
                batches = await batches_service_1.BatchesService.getStudentBatches(userId);
            }
            res.status(200).json({ success: true, message: 'Batches retrieved', data: { batches } });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message || 'Failed to get batches' });
        }
    }
    // POST /api/batches
    static async createBatch(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }
            const userWithRole = await auth_service_1.AuthService.getUserWithRole(userId);
            if (!userWithRole?.teacher_profile_id) {
                res.status(403).json({ success: false, message: 'Only teachers can create batches' });
                return;
            }
            const data = req.body;
            if (!data.name?.trim()) {
                res.status(400).json({ success: false, message: 'Name is required' });
                return;
            }
            if (!data.meeting_link?.trim()) {
                res.status(400).json({ success: false, message: 'Meeting link is required' });
                return;
            }
            if (!data.class_time) {
                res.status(400).json({ success: false, message: 'Class time is required' });
                return;
            }
            if (!data.session_type) {
                res.status(400).json({ success: false, message: 'Session type is required' });
                return;
            }
            const batch = await batches_service_1.BatchesService.createBatch(data, userWithRole.teacher_profile_id);
            res.status(201).json({ success: true, message: 'Batch created successfully', data: { batch } });
        }
        catch (error) {
            res.status(400).json({ success: false, message: error.message || 'Failed to create batch' });
        }
    }
    // GET /api/batches/:id
    static async getBatch(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }
            const userWithRole = await auth_service_1.AuthService.getUserWithRole(userId);
            if (!userWithRole?.teacher_profile_id) {
                res.status(403).json({ success: false, message: 'Only teachers can access this' });
                return;
            }
            const batch = await batches_service_1.BatchesService.getBatch(req.params.id, userWithRole.teacher_profile_id);
            res.status(200).json({ success: true, message: 'Batch retrieved', data: { batch } });
        }
        catch (error) {
            const status = error.message.includes('not found') ? 404 : 500;
            res.status(status).json({ success: false, message: error.message || 'Failed to get batch' });
        }
    }
    // PUT /api/batches/:id
    static async updateBatch(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }
            const userWithRole = await auth_service_1.AuthService.getUserWithRole(userId);
            if (!userWithRole?.teacher_profile_id) {
                res.status(403).json({ success: false, message: 'Only teachers can edit batches' });
                return;
            }
            const data = req.body;
            const batch = await batches_service_1.BatchesService.updateBatch(req.params.id, userWithRole.teacher_profile_id, data);
            res.status(200).json({ success: true, message: 'Batch updated', data: { batch } });
        }
        catch (error) {
            const status = error.message.includes('not found') ? 404 : 400;
            res.status(status).json({ success: false, message: error.message || 'Failed to update batch' });
        }
    }
    // DELETE /api/batches/:id
    static async deleteBatch(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }
            const userWithRole = await auth_service_1.AuthService.getUserWithRole(userId);
            if (!userWithRole?.teacher_profile_id) {
                res.status(403).json({ success: false, message: 'Only teachers can delete batches' });
                return;
            }
            await batches_service_1.BatchesService.deleteBatch(req.params.id, userWithRole.teacher_profile_id);
            res.status(200).json({ success: true, message: 'Batch deleted' });
        }
        catch (error) {
            const status = error.message.includes('not found') ? 404 : 400;
            res.status(status).json({ success: false, message: error.message || 'Failed to delete batch' });
        }
    }
    // ─── Student management ──────────────────────────────────────
    // GET /api/batches/:id/students
    static async getBatchStudents(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }
            const userWithRole = await auth_service_1.AuthService.getUserWithRole(userId);
            if (!userWithRole?.teacher_profile_id) {
                res.status(403).json({ success: false, message: 'Only teachers can access this' });
                return;
            }
            const students = await batches_service_1.BatchesService.getBatchStudents(req.params.id, userWithRole.teacher_profile_id);
            res.status(200).json({ success: true, message: 'Students retrieved', data: { students } });
        }
        catch (error) {
            const status = error.message.includes('not found') ? 404 : 500;
            res.status(status).json({ success: false, message: error.message || 'Failed to get students' });
        }
    }
    // POST /api/batches/:id/students
    static async addStudent(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }
            const userWithRole = await auth_service_1.AuthService.getUserWithRole(userId);
            if (!userWithRole?.teacher_profile_id) {
                res.status(403).json({ success: false, message: 'Only teachers can add students' });
                return;
            }
            const { student_user_id } = req.body;
            if (!student_user_id) {
                res.status(400).json({ success: false, message: 'student_user_id is required' });
                return;
            }
            await batches_service_1.BatchesService.addStudent(req.params.id, student_user_id, userWithRole.teacher_profile_id);
            res.status(200).json({ success: true, message: 'Student added to batch' });
        }
        catch (error) {
            const status = error.message.includes('not found') ? 404 : 400;
            res.status(status).json({ success: false, message: error.message || 'Failed to add student' });
        }
    }
    // DELETE /api/batches/:id/students/:studentUserId
    static async removeStudent(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }
            const userWithRole = await auth_service_1.AuthService.getUserWithRole(userId);
            if (!userWithRole?.teacher_profile_id) {
                res.status(403).json({ success: false, message: 'Only teachers can remove students' });
                return;
            }
            await batches_service_1.BatchesService.removeStudent(req.params.id, req.params.studentUserId, userWithRole.teacher_profile_id);
            res.status(200).json({ success: true, message: 'Student removed from batch' });
        }
        catch (error) {
            const status = error.message.includes('not found') ? 404 : 400;
            res.status(status).json({ success: false, message: error.message || 'Failed to remove student' });
        }
    }
    // ─── Sessions ────────────────────────────────────────────────
    // GET /api/batches/:id/sessions
    static async getBatchSessions(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }
            const userWithRole = await auth_service_1.AuthService.getUserWithRole(userId);
            if (!userWithRole?.teacher_profile_id) {
                res.status(403).json({ success: false, message: 'Only teachers can access this' });
                return;
            }
            const sessions = await batches_service_1.BatchesService.getBatchSessions(req.params.id, userWithRole.teacher_profile_id);
            res.status(200).json({ success: true, message: 'Sessions retrieved', data: { sessions } });
        }
        catch (error) {
            const status = error.message.includes('not found') ? 404 : 500;
            res.status(status).json({ success: false, message: error.message || 'Failed to get sessions' });
        }
    }
    // POST /api/batches/:id/sessions
    static async createSessions(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }
            const userWithRole = await auth_service_1.AuthService.getUserWithRole(userId);
            if (!userWithRole?.teacher_profile_id) {
                res.status(403).json({ success: false, message: 'Only teachers can create sessions' });
                return;
            }
            const data = req.body;
            const sessions = await batches_service_1.BatchesService.createSessions(req.params.id, data, userWithRole.teacher_profile_id);
            res.status(201).json({ success: true, message: 'Sessions created', data: { sessions } });
        }
        catch (error) {
            const status = error.message.includes('not found') ? 404 : 400;
            res.status(status).json({ success: false, message: error.message || 'Failed to create sessions' });
        }
    }
    // ─── Attendance ──────────────────────────────────────────────
    // DELETE /api/batch-sessions/:sessionId
    static async deleteSession(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }
            const userWithRole = await auth_service_1.AuthService.getUserWithRole(userId);
            if (!userWithRole?.teacher_profile_id) {
                res.status(403).json({ success: false, message: 'Only teachers can delete sessions' });
                return;
            }
            await batches_service_1.BatchesService.deleteSession(req.params.sessionId, userWithRole.teacher_profile_id);
            res.status(200).json({ success: true, message: 'Session deleted' });
        }
        catch (error) {
            const status = error.message.includes('not found') ? 404 : 400;
            res.status(status).json({ success: false, message: error.message || 'Failed to delete session' });
        }
    }
    // GET /api/batch-sessions/:sessionId
    static async getSessionDetails(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }
            const userWithRole = await auth_service_1.AuthService.getUserWithRole(userId);
            if (!userWithRole?.teacher_profile_id) {
                res.status(403).json({ success: false, message: 'Only teachers can access this' });
                return;
            }
            const result = await batches_service_1.BatchesService.getSessionWithAttendance(req.params.sessionId, userWithRole.teacher_profile_id);
            res.status(200).json({ success: true, message: 'Session retrieved', data: result });
        }
        catch (error) {
            const status = error.message.includes('not found') ? 404 : 500;
            res.status(status).json({ success: false, message: error.message || 'Failed to get session' });
        }
    }
    // PUT /api/batch-sessions/:sessionId/attendance
    static async markAttendance(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }
            const userWithRole = await auth_service_1.AuthService.getUserWithRole(userId);
            if (!userWithRole?.teacher_profile_id) {
                res.status(403).json({ success: false, message: 'Only teachers can mark attendance' });
                return;
            }
            const records = req.body.records;
            if (!Array.isArray(records)) {
                res.status(400).json({ success: false, message: 'records array is required' });
                return;
            }
            await batches_service_1.BatchesService.markAttendance(req.params.sessionId, records, userWithRole.teacher_profile_id);
            res.status(200).json({ success: true, message: 'Attendance saved' });
        }
        catch (error) {
            const status = error.message.includes('not found') ? 404 : 400;
            res.status(status).json({ success: false, message: error.message || 'Failed to mark attendance' });
        }
    }
}
exports.BatchesController = BatchesController;
//# sourceMappingURL=batches.controller.js.map