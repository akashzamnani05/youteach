"use strict";
// src/controllers/students.controller.ts
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentsController = void 0;
const students_service_1 = require("../services/students.service");
class StudentsController {
    // Get all students for logged-in teacher
    static async getStudents(req, res) {
        try {
            const teacherId = req.user?.userId;
            if (!teacherId) {
                res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                });
                return;
            }
            // Get teacher profile ID from user ID
            const { AuthService } = await Promise.resolve().then(() => __importStar(require('../services/auth.service')));
            const teacherProfile = await AuthService.getUserWithRole(teacherId);
            if (!teacherProfile || !teacherProfile.teacher_profile_id) {
                res.status(403).json({
                    success: false,
                    message: 'Teacher profile not found',
                });
                return;
            }
            const students = await students_service_1.StudentsService.getStudentsByTeacherId(teacherProfile.teacher_profile_id);
            res.status(200).json({
                success: true,
                message: 'Students retrieved successfully',
                data: {
                    students,
                    count: students.length,
                },
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch students',
            });
        }
    }
    // Get single student by ID
    static async getStudentById(req, res) {
        try {
            const { id } = req.params;
            const teacherId = req.user?.userId;
            if (!teacherId) {
                res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                });
                return;
            }
            // Get teacher profile ID from user ID
            const { AuthService } = await Promise.resolve().then(() => __importStar(require('../services/auth.service')));
            const teacherProfile = await AuthService.getUserWithRole(teacherId);
            if (!teacherProfile || !teacherProfile.teacher_profile_id) {
                res.status(403).json({
                    success: false,
                    message: 'Teacher profile not found',
                });
                return;
            }
            const student = await students_service_1.StudentsService.getStudentById(id, teacherProfile.teacher_profile_id);
            if (!student) {
                res.status(404).json({
                    success: false,
                    message: 'Student not found',
                });
                return;
            }
            res.status(200).json({
                success: true,
                message: 'Student retrieved successfully',
                data: { student },
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch student',
            });
        }
    }
    // Create new student
    static async createStudent(req, res) {
        try {
            const data = req.body;
            const teacherId = req.user?.userId;
            if (!teacherId) {
                res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                });
                return;
            }
            // Get teacher profile ID from user ID
            const { AuthService } = await Promise.resolve().then(() => __importStar(require('../services/auth.service')));
            const teacherProfile = await AuthService.getUserWithRole(teacherId);
            if (!teacherProfile || !teacherProfile.teacher_profile_id) {
                res.status(403).json({
                    success: false,
                    message: 'Teacher profile not found',
                });
                return;
            }
            const { student, password } = await students_service_1.StudentsService.createStudent(data, teacherProfile.teacher_profile_id);
            res.status(201).json({
                success: true,
                message: 'Student created successfully',
                data: {
                    student,
                    temporaryPassword: password,
                },
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to create student',
            });
        }
    }
    // Delete student
    static async deleteStudent(req, res) {
        try {
            const { id } = req.params;
            const teacherId = req.user?.userId;
            if (!teacherId) {
                res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                });
                return;
            }
            // Get teacher profile ID from user ID
            const { AuthService } = await Promise.resolve().then(() => __importStar(require('../services/auth.service')));
            const teacherProfile = await AuthService.getUserWithRole(teacherId);
            if (!teacherProfile || !teacherProfile.teacher_profile_id) {
                res.status(403).json({
                    success: false,
                    message: 'Teacher profile not found',
                });
                return;
            }
            await students_service_1.StudentsService.deleteStudent(id, teacherProfile.teacher_profile_id);
            res.status(200).json({
                success: true,
                message: 'Student deleted successfully',
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to delete student',
            });
        }
    }
}
exports.StudentsController = StudentsController;
//# sourceMappingURL=students.controller.js.map