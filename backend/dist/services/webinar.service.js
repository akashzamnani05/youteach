"use strict";
// src/services/webinar.service.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebinarService = void 0;
const database_1 = require("../config/database");
class WebinarService {
    // Get all webinars for a teacher
    static async getWebinarsByTeacher(teacherProfileId) {
        const webinars = await (0, database_1.query)(`SELECT * FROM webinars 
       WHERE teacher_id = ? 
       ORDER BY scheduled_at DESC`, [teacherProfileId]);
        return webinars;
    }
    // Get single webinar by ID (verify it belongs to teacher)
    static async getWebinarById(webinarId, teacherProfileId) {
        const webinar = await (0, database_1.queryOne)(`SELECT * FROM webinars 
       WHERE id = ? AND teacher_id = ?`, [webinarId, teacherProfileId]);
        return webinar;
    }
    // Create new webinar
    static async createWebinar(data, teacherProfileId) {
        const { title, description, scheduled_at, duration_minutes, meeting_link, meeting_password, max_participants, is_recorded, course_id, } = data;
        return await (0, database_1.transaction)(async (connection) => {
            // Insert webinar
            await connection.execute(`INSERT INTO webinars (
          teacher_id, course_id, title, description, scheduled_at, 
          duration_minutes, meeting_link, meeting_password, 
          max_participants, is_recorded, status, reminder_sent
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'scheduled', FALSE)`, [
                teacherProfileId,
                course_id || null,
                title,
                description || null,
                scheduled_at,
                duration_minutes,
                meeting_link,
                meeting_password || null,
                max_participants || null,
                is_recorded || false,
            ]);
            // Get the created webinar
            const [webinarRows] = await connection.execute(`SELECT * FROM webinars 
         WHERE teacher_id = ? 
         ORDER BY created_at DESC 
         LIMIT 1`, [teacherProfileId]);
            return webinarRows[0];
        });
    }
    // Update webinar
    static async updateWebinar(webinarId, teacherProfileId, data) {
        return await (0, database_1.transaction)(async (connection) => {
            // Verify webinar belongs to teacher
            const [existingRows] = await connection.execute('SELECT id FROM webinars WHERE id = ? AND teacher_id = ?', [webinarId, teacherProfileId]);
            if (existingRows.length === 0) {
                throw new Error('Webinar not found or unauthorized');
            }
            // Build update query dynamically
            const updates = [];
            const values = [];
            if (data.title !== undefined) {
                updates.push('title = ?');
                values.push(data.title);
            }
            if (data.description !== undefined) {
                updates.push('description = ?');
                values.push(data.description);
            }
            if (data.scheduled_at !== undefined) {
                updates.push('scheduled_at = ?');
                values.push(data.scheduled_at);
            }
            if (data.duration_minutes !== undefined) {
                updates.push('duration_minutes = ?');
                values.push(data.duration_minutes);
            }
            if (data.meeting_link !== undefined) {
                updates.push('meeting_link = ?');
                values.push(data.meeting_link);
            }
            if (data.meeting_password !== undefined) {
                updates.push('meeting_password = ?');
                values.push(data.meeting_password);
            }
            if (data.max_participants !== undefined) {
                updates.push('max_participants = ?');
                values.push(data.max_participants);
            }
            if (data.is_recorded !== undefined) {
                updates.push('is_recorded = ?');
                values.push(data.is_recorded);
            }
            if (data.status !== undefined) {
                updates.push('status = ?');
                values.push(data.status);
            }
            if (updates.length === 0) {
                throw new Error('No fields to update');
            }
            values.push(webinarId);
            await connection.execute(`UPDATE webinars SET ${updates.join(', ')} WHERE id = ?`, values);
            // Get updated webinar
            const [webinarRows] = await connection.execute('SELECT * FROM webinars WHERE id = ?', [webinarId]);
            return webinarRows[0];
        });
    }
    // Delete webinar
    static async deleteWebinar(webinarId, teacherProfileId) {
        return await (0, database_1.transaction)(async (connection) => {
            // Verify webinar belongs to teacher
            const [existingRows] = await connection.execute('SELECT id FROM webinars WHERE id = ? AND teacher_id = ?', [webinarId, teacherProfileId]);
            if (existingRows.length === 0) {
                throw new Error('Webinar not found or unauthorized');
            }
            // Delete webinar
            await connection.execute('DELETE FROM webinars WHERE id = ?', [webinarId]);
            return true;
        });
    }
    // Get upcoming webinars for a teacher
    static async getUpcomingWebinars(teacherProfileId) {
        const webinars = await (0, database_1.query)(`SELECT * FROM webinars 
       WHERE teacher_id = ? 
       AND scheduled_at > NOW() 
       AND status = 'scheduled'
       ORDER BY scheduled_at ASC`, [teacherProfileId]);
        return webinars;
    }
    // Get past webinars for a teacher
    static async getPastWebinars(teacherProfileId) {
        const webinars = await (0, database_1.query)(`SELECT * FROM webinars 
       WHERE teacher_id = ? 
       AND (scheduled_at < NOW() OR status = 'completed')
       ORDER BY scheduled_at DESC`, [teacherProfileId]);
        return webinars;
    }
    // Get registered students for a webinar
    static async getRegisteredStudents(webinarId, teacherProfileId) {
        // Verify webinar belongs to teacher
        const webinar = await (0, database_1.queryOne)('SELECT id FROM webinars WHERE id = ? AND teacher_id = ?', [webinarId, teacherProfileId]);
        if (!webinar) {
            throw new Error('Webinar not found or unauthorized');
        }
        // Get registered students
        const students = await (0, database_1.query)(`SELECT 
        u.id,
        u.full_name,
        u.email,
        u.phone,
        sp.education_level,
        wr.registered_at,
        wr.attended,
        wr.attendance_duration_minutes
       FROM webinar_registrations wr
       JOIN student_profiles sp ON wr.student_id = sp.id
       JOIN users u ON sp.user_id = u.id
       WHERE wr.webinar_id = ?
       ORDER BY wr.registered_at DESC`, [webinarId]);
        return students;
    }
}
exports.WebinarService = WebinarService;
//# sourceMappingURL=webinar.service.js.map