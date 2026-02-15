// lib/student-webinars.ts

import apiClient from './api';
import { ApiResponse } from '@/types';
import { StudentWebinar } from '@/types/webinar';

export const studentWebinarsApi = {
  // Get all webinars for logged-in student
  getWebinars: async (): Promise<ApiResponse<{ webinars: StudentWebinar[]; count: number }>> => {
    const { data } = await apiClient.get('/student-webinars');
    return data;
  },

  // Get registered webinars
  getRegisteredWebinars: async (): Promise<ApiResponse<{ webinars: StudentWebinar[]; count: number }>> => {
    const { data } = await apiClient.get('/student-webinars/registered');
    return data;
  },

  // Get upcoming webinars
  getUpcomingWebinars: async (): Promise<ApiResponse<{ webinars: StudentWebinar[]; count: number }>> => {
    const { data } = await apiClient.get('/student-webinars/upcoming');
    return data;
  },

  // Get single webinar by ID
  getWebinarById: async (id: string): Promise<ApiResponse<{ webinar: StudentWebinar }>> => {
    const { data } = await apiClient.get(`/student-webinars/${id}`);
    return data;
  },

  // Register for a webinar
  registerForWebinar: async (id: string): Promise<ApiResponse<{ registration_id: string }>> => {
    const { data } = await apiClient.post(`/student-webinars/${id}/register`);
    return data;
  },

  // Unregister from a webinar
  unregisterFromWebinar: async (id: string): Promise<ApiResponse> => {
    const { data } = await apiClient.delete(`/student-webinars/${id}/unregister`);
    return data;
  },
};