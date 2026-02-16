// src/types/announcements.types.ts

export interface Announcement {
  id: string;
  title: string;
  description: string;
  teacher_profile_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateAnnouncementData {
  title: string;
  description: string;
}

export interface UpdateAnnouncementData {
  title?: string;
  description?: string;
}
