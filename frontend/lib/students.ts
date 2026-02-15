// lib/students.ts

import apiClient from './api';
import { ApiResponse } from '@/types';
import { StudentData, Student } from '@/types';





export const studentsApi = {
  // Get all students for logged-in teacher
  getStudents: async (): Promise<ApiResponse<{ students: Student[]; count: number }>> => {
    const { data } = await apiClient.get('/students');
    return data;
  },

  // Get single student by ID
  getStudentById: async (id: string): Promise<ApiResponse<{ student: Student }>> => {
    const { data } = await apiClient.get(`/students/${id}`);
    return data;
  },

  // Create new student
  createStudent: async (studentData: StudentData): Promise<ApiResponse<{ student: Student; temporaryPassword: string }>> => {
    const { data } = await apiClient.post('/students', studentData);
    return data;
  },

  // Delete student
  deleteStudent: async (id: string): Promise<ApiResponse> => {
    const { data } = await apiClient.delete(`/students/${id}`);
    return data;
  },
};