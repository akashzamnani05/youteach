// lib/webinars.ts

import apiClient from './api';
import { ApiResponse } from '@/types';
import { Webinar, CreateWebinarData, UpdateWebinarData } from '@/types/webinar';

export const webinarsApi = {
  // Get all webinars for logged-in teacher
  getWebinars: async (): Promise<ApiResponse<{ webinars: Webinar[]; count: number }>> => {
    const { data } = await apiClient.get('/webinars');
    return data;
  },

  // Get upcoming webinars
  getUpcomingWebinars: async (): Promise<ApiResponse<{ webinars: Webinar[]; count: number }>> => {
    const { data } = await apiClient.get('/webinars/upcoming');
    return data;
  },

  // Get single webinar by ID
  getWebinarById: async (id: string): Promise<ApiResponse<{ webinar: Webinar }>> => {
    const { data } = await apiClient.get(`/webinars/${id}`);
    return data;
  },

  // Create new webinar
  createWebinar: async (webinarData: CreateWebinarData): Promise<ApiResponse<{ webinar: Webinar }>> => {
    const { data } = await apiClient.post('/webinars', webinarData);
    return data;
  },

  // Update webinar
  updateWebinar: async (id: string, webinarData: UpdateWebinarData): Promise<ApiResponse<{ webinar: Webinar }>> => {
    const { data } = await apiClient.put(`/webinars/${id}`, webinarData);
    return data;
  },

  // Delete webinar
  deleteWebinar: async (id: string): Promise<ApiResponse> => {
    const { data } = await apiClient.delete(`/webinars/${id}`);
    return data;
  },

  // Get registered students for a webinar
  getRegisteredStudents: async (id: string): Promise<ApiResponse<{ students: any[]; count: number }>> => {
    const { data } = await apiClient.get(`/webinars/${id}/students`);
    return data;
  },
};