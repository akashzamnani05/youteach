import { Batch, BatchStudent, BatchSession, AttendanceRecord, TeacherStudent, CreateBatchData, UpdateBatchData, CreateSessionsData, MarkAttendanceItem } from '../types/batches.types';
export declare class BatchesService {
    /** Generate session dates from CreateBatchData or CreateSessionsData */
    private static generateSessionDates;
    static getTeacherStudents(teacherProfileId: string): Promise<TeacherStudent[]>;
    static getTeacherBatches(teacherProfileId: string): Promise<Batch[]>;
    static getStudentBatches(userId: string): Promise<Batch[]>;
    static getBatch(batchId: string, teacherProfileId: string): Promise<Batch>;
    static createBatch(data: CreateBatchData, teacherProfileId: string): Promise<Batch>;
    static updateBatch(batchId: string, teacherProfileId: string, data: UpdateBatchData): Promise<Batch>;
    static deleteBatch(batchId: string, teacherProfileId: string): Promise<void>;
    static getBatchStudents(batchId: string, teacherProfileId: string): Promise<BatchStudent[]>;
    static addStudent(batchId: string, studentUserId: string, teacherProfileId: string): Promise<void>;
    static removeStudent(batchId: string, studentUserId: string, teacherProfileId: string): Promise<void>;
    static getBatchSessions(batchId: string, teacherProfileId: string): Promise<BatchSession[]>;
    static createSessions(batchId: string, data: CreateSessionsData, teacherProfileId: string): Promise<BatchSession[]>;
    static deleteSession(sessionId: string, teacherProfileId: string): Promise<void>;
    static getSessionWithAttendance(sessionId: string, teacherProfileId: string): Promise<{
        session: BatchSession;
        batch: Batch;
        attendance: AttendanceRecord[];
    }>;
    static markAttendance(sessionId: string, records: MarkAttendanceItem[], teacherProfileId: string): Promise<void>;
}
//# sourceMappingURL=batches.service.d.ts.map