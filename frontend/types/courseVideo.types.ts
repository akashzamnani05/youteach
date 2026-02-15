// src/types/courseVideo.types.ts

export interface CourseVideo {
  id: string;
  module_id: string;
  title: string;
  description?: string;
  youtube_video_id?: string;
  duration_minutes?: number;
  order_index: number;
  is_free_preview: boolean;
  created_at: string;
  updated_at: string;
  module_title?: string;
}

export interface CreateVideoData {
  module_id: string;
  title: string;
  description?: string;
  order_index: number;
  is_free_preview?: boolean;
}

export interface UpdateVideoData {
  title?: string;
  description?: string;
  order_index?: number;
  is_free_preview?: boolean;
}

export interface VideoUploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface YouTubeUploadResponse {
  videoId: string;
  title: string;
  description: string;
  url: string;
  embedUrl: string;
}

export interface VideoUploadResponse {
  video: CourseVideo;
  youtube: YouTubeUploadResponse;
}