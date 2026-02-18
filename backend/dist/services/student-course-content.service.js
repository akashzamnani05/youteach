"use strict";
// src/services/student-course-content.service.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentCourseContentService = void 0;
const database_1 = require("../config/database");
class StudentCourseContentService {
    // Get all modules for a course (only if student is enrolled)
    static async getModulesByCourse(courseId, studentId) {
        // First verify student is enrolled
        const enrollments = await (0, database_1.query)(`SELECT id FROM enrollments 
       WHERE student_id = ? AND course_id = ? AND status IN ('active', 'completed')`, [studentId, courseId]);
        if (enrollments.length === 0) {
            throw new Error('You must be enrolled in this course to access its content');
        }
        // Fetch modules
        const modules = await (0, database_1.query)(`SELECT * FROM course_modules 
       WHERE course_id = ? 
       ORDER BY order_index ASC`, [courseId]);
        return modules;
    }
    // Get all content for a module (only if student is enrolled)
    static async getContentByModule(moduleId, studentId) {
        // First get the course_id from module and verify enrollment
        const moduleCheck = await (0, database_1.query)('SELECT course_id FROM course_modules WHERE id = ?', [moduleId]);
        if (moduleCheck.length === 0) {
            throw new Error('Module not found');
        }
        const courseId = moduleCheck[0].course_id;
        // Verify student is enrolled
        const enrollments = await (0, database_1.query)(`SELECT id FROM enrollments 
       WHERE student_id = ? AND course_id = ? AND status IN ('active', 'completed')`, [studentId, courseId]);
        if (enrollments.length === 0) {
            throw new Error('You must be enrolled in this course to access its content');
        }
        // Fetch content
        const content = await (0, database_1.query)(`SELECT * FROM course_content 
       WHERE module_id = ? 
       ORDER BY order_index ASC`, [moduleId]);
        return content;
    }
    // Get all content for a course (organized by modules)
    static async getAllContentByCourse(courseId, studentId) {
        // Verify enrollment
        const enrollments = await (0, database_1.query)(`SELECT id FROM enrollments 
       WHERE student_id = ? AND course_id = ? AND status IN ('active', 'completed')`, [studentId, courseId]);
        if (enrollments.length === 0) {
            throw new Error('You must be enrolled in this course to access its content');
        }
        // Get all modules
        const modules = await (0, database_1.query)(`SELECT * FROM course_modules 
       WHERE course_id = ? 
       ORDER BY order_index ASC`, [courseId]);
        // Get all content for each module
        const modulesWithContent = await Promise.all(modules.map(async (module) => {
            const content = await (0, database_1.query)(`SELECT * FROM course_content 
           WHERE module_id = ? 
           ORDER BY order_index ASC`, [module.id]);
            return {
                ...module,
                content
            };
        }));
        return modulesWithContent;
    }
}
exports.StudentCourseContentService = StudentCourseContentService;
//# sourceMappingURL=student-course-content.service.js.map