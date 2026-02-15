// src/types/course-video.types.ts

export interface CourseVideo {
  id: string;
  module_id: string;
  title: string;
  description?: string;
  youtube_video_id: string;
  duration_minutes?: number;
  order_index: number;
  is_free_preview: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateCourseVideoData {
  module_id: string;
  title: string;
  description?: string;
  order_index: number;
  is_free_preview?: boolean;
}

export interface UpdateCourseVideoData {
  title?: string;
  description?: string;
  order_index?: number;
  is_free_preview?: boolean;
  youtube_video_id?: string;
  duration_minutes?: number;
}

export interface YouTubeUploadResponse {
  videoId: string;
  title: string;
  description: string;
  url: string;
  embedUrl: string;
}

export interface VideoUploadMetadata {
  title: string;
  description?: string;
  tags?: string[];
  categoryId?: string;
  privacyStatus: 'public' | 'private' | 'unlisted';
}