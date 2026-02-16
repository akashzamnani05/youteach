// lib/batches.ts

import apiClient from './api';
import {
  Batch,
  BatchStudent,
  BatchSession,
  AttendanceRecord,
  TeacherStudent,
  CreateBatchData,
  CreateSessionsData,
} from '../types/batches.types';

export const batchesApi = {
  // GET /api/batches/teacher-students — teacher only
  getTeacherStudents: async (): Promise<TeacherStudent[]> => {
    const res = await apiClient.get('/batches/teacher-students');
    return res.data.data.students;
  },

  // GET /api/batches — role-aware (teacher gets own, student gets enrolled)
  getBatches: async (): Promise<Batch[]> => {
    const res = await apiClient.get('/batches');
    return res.data.data.batches;
  },

  // POST /api/batches — teacher only
  createBatch: async (data: CreateBatchData): Promise<Batch> => {
    const res = await apiClient.post('/batches', data);
    return res.data.data.batch;
  },

  // GET /api/batches/:id — teacher only
  getBatch: async (id: string): Promise<Batch> => {
    const res = await apiClient.get(`/batches/${id}`);
    return res.data.data.batch;
  },

  // PUT /api/batches/:id — teacher only
  updateBatch: async (id: string, data: Partial<CreateBatchData>): Promise<Batch> => {
    const res = await apiClient.put(`/batches/${id}`, data);
    return res.data.data.batch;
  },

  // DELETE /api/batches/:id — teacher only
  deleteBatch: async (id: string): Promise<void> => {
    await apiClient.delete(`/batches/${id}`);
  },

  // GET /api/batches/:id/students — teacher only
  getBatchStudents: async (id: string): Promise<BatchStudent[]> => {
    const res = await apiClient.get(`/batches/${id}/students`);
    return res.data.data.students;
  },

  // POST /api/batches/:id/students — teacher only
  addStudent: async (id: string, student_user_id: string): Promise<void> => {
    await apiClient.post(`/batches/${id}/students`, { student_user_id });
  },

  // DELETE /api/batches/:id/students/:studentUserId — teacher only
  removeStudent: async (id: string, studentUserId: string): Promise<void> => {
    await apiClient.delete(`/batches/${id}/students/${studentUserId}`);
  },

  // GET /api/batches/:id/sessions — teacher only
  getBatchSessions: async (id: string): Promise<BatchSession[]> => {
    const res = await apiClient.get(`/batches/${id}/sessions`);
    return res.data.data.sessions;
  },

  // POST /api/batches/:id/sessions — teacher only
  createSessions: async (id: string, data: CreateSessionsData): Promise<BatchSession[]> => {
    const res = await apiClient.post(`/batches/${id}/sessions`, data);
    return res.data.data.sessions;
  },

  // DELETE /api/batch-sessions/:sessionId — teacher only
  deleteSession: async (sessionId: string): Promise<void> => {
    await apiClient.delete(`/batch-sessions/${sessionId}`);
  },

  // GET /api/batch-sessions/:sessionId — teacher only
  getSessionDetails: async (
    sessionId: string
  ): Promise<{ session: BatchSession; batch: Batch; attendance: AttendanceRecord[] }> => {
    const res = await apiClient.get(`/batch-sessions/${sessionId}`);
    return res.data.data;
  },

  // PUT /api/batch-sessions/:sessionId/attendance — teacher only
  markAttendance: async (
    sessionId: string,
    records: { student_user_id: string; status: string }[]
  ): Promise<void> => {
    await apiClient.put(`/batch-sessions/${sessionId}/attendance`, { records });
  },
};
