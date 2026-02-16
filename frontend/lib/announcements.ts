// lib/announcements.ts

import apiClient from './api';
import { Announcement } from '../types/announcements.types';

export const announcementsApi = {
  // GET /api/announcements
  // Teacher: returns their own announcements.
  // Student: returns their teacher's announcements.
  getAnnouncements: async (): Promise<Announcement[]> => {
    const response = await apiClient.get('/announcements');
    return response.data.data.announcements;
  },

  // POST /api/announcements  (teacher only)
  createAnnouncement: async (
    title: string,
    description: string
  ): Promise<Announcement> => {
    const response = await apiClient.post('/announcements', { title, description });
    return response.data.data.announcement;
  },

  // PUT /api/announcements/:id  (teacher only)
  updateAnnouncement: async (
    id: string,
    title: string,
    description: string
  ): Promise<Announcement> => {
    const response = await apiClient.put(`/announcements/${id}`, { title, description });
    return response.data.data.announcement;
  },

  // DELETE /api/announcements/:id  (teacher only)
  deleteAnnouncement: async (id: string): Promise<void> => {
    await apiClient.delete(`/announcements/${id}`);
  },
};
