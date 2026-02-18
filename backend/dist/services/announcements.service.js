"use strict";
// src/services/announcements.service.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnnouncementsService = void 0;
const uuid_1 = require("uuid");
const database_1 = require("../config/database");
class AnnouncementsService {
    // All announcements for a teacher, newest first
    static async getByTeacher(teacherProfileId) {
        return (0, database_1.query)(`SELECT * FROM announcements
       WHERE teacher_profile_id = ?
       ORDER BY created_at DESC`, [teacherProfileId]);
    }
    // Announcements for a student — finds their teacher from enrollments (one teacher assumed)
    static async getForStudent(userId) {
        return (0, database_1.query)(`SELECT a.*
       FROM announcements a
       JOIN (
         SELECT DISTINCT c.teacher_id
         FROM enrollments e
         JOIN student_profiles sp ON sp.id = e.student_id
         JOIN courses c ON c.id = e.course_id
         WHERE sp.user_id = ?
         LIMIT 1
       ) t ON t.teacher_id = a.teacher_profile_id
       ORDER BY a.created_at DESC`, [userId]);
    }
    static async create(data, teacherProfileId) {
        const id = (0, uuid_1.v4)();
        await (0, database_1.query)(`INSERT INTO announcements (id, title, description, teacher_profile_id)
       VALUES (?, ?, ?, ?)`, [id, data.title.trim(), data.description.trim(), teacherProfileId]);
        return (await (0, database_1.queryOne)(`SELECT * FROM announcements WHERE id = ?`, [id]));
    }
    static async update(id, teacherProfileId, data) {
        const existing = await (0, database_1.queryOne)(`SELECT id FROM announcements WHERE id = ? AND teacher_profile_id = ?`, [id, teacherProfileId]);
        if (!existing)
            throw new Error('Announcement not found');
        const updates = [];
        const values = [];
        if (data.title !== undefined) {
            updates.push('title = ?');
            values.push(data.title.trim());
        }
        if (data.description !== undefined) {
            updates.push('description = ?');
            values.push(data.description.trim());
        }
        if (updates.length === 0)
            throw new Error('No fields to update');
        values.push(id, teacherProfileId);
        await (0, database_1.query)(`UPDATE announcements SET ${updates.join(', ')}
       WHERE id = ? AND teacher_profile_id = ?`, values);
        return (await (0, database_1.queryOne)(`SELECT * FROM announcements WHERE id = ?`, [id]));
    }
    static async delete(id, teacherProfileId) {
        const existing = await (0, database_1.queryOne)(`SELECT id FROM announcements WHERE id = ? AND teacher_profile_id = ?`, [id, teacherProfileId]);
        if (!existing)
            throw new Error('Announcement not found');
        await (0, database_1.query)(`DELETE FROM announcements WHERE id = ? AND teacher_profile_id = ?`, [id, teacherProfileId]);
    }
}
exports.AnnouncementsService = AnnouncementsService;
//# sourceMappingURL=announcements.service.js.map