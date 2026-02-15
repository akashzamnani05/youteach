import axios, { AxiosProgressEvent } from 'axios';
import {
  CourseVideo,
  CreateVideoData,
  UpdateVideoData,
  VideoUploadResponse,
  VideoUploadProgress,
} from '../types/courseVideo.types';
import apiClient from './api';

export const courseVideoApi = {
  // Get all videos for a module
  getVideosByModule: async (moduleId: string): Promise<CourseVideo[]> => {
    const response = await apiClient.get(`/course-videos/module/${moduleId}`);
    return response.data.data.videos;
  },

  // Get all videos for a course
  getVideosByCourse: async (courseId: string): Promise<CourseVideo[]> => {
    const response = await apiClient.get(`/course-videos/course/${courseId}`);
    return response.data.data.videos;
  },

  // Get single video by ID
  getVideoById: async (videoId: string): Promise<CourseVideo> => {
    const response = await apiClient.get(`/course-videos/${videoId}`);
    return response.data.data.video;
  },

  // Upload video with progress tracking
  uploadVideo: async (
    videoFile: File,
    metadata: CreateVideoData,
    onProgress?: (progress: VideoUploadProgress) => void
  ): Promise<VideoUploadResponse> => {
    const formData = new FormData();
    formData.append('video', videoFile);
    formData.append('module_id', metadata.module_id);
    formData.append('title', metadata.title);
    if (metadata.description) {
      formData.append('description', metadata.description);
    }
    formData.append('order_index', metadata.order_index.toString());
    formData.append('is_free_preview', metadata.is_free_preview ? 'true' : 'false');

    const response = await apiClient.post('/course-videos/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent: AxiosProgressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress: VideoUploadProgress = {
            loaded: progressEvent.loaded,
            total: progressEvent.total,
            percentage: Math.round((progressEvent.loaded * 100) / progressEvent.total),
          };
          onProgress(progress);
        }
      },
    });

    return response.data.data;
  },

  // Update video metadata
  updateVideo: async (
    videoId: string,
    data: UpdateVideoData
  ): Promise<CourseVideo> => {
    const response = await apiClient.put(`/course-videos/${videoId}`, data);
    return response.data.data.video;
  },

  // Delete video
  deleteVideo: async (videoId: string): Promise<void> => {
    await apiClient.delete(`/course-videos/${videoId}`);
  },

  // ========== REORDERING (NEW) ==========

  // Reorder videos within a module
  reorderVideos: async (
    moduleId: string,
    videoOrders: { id: string; order_index: number }[]
  ): Promise<void> => {
    const response = await apiClient.put(`/course-videos/module/${moduleId}/reorder`, {
      videos: videoOrders,
    });
    return response.data;
  },

  // Move video to a different module
  moveVideo: async (
    videoId: string,
    newModuleId: string,
    newOrderIndex: number
  ): Promise<CourseVideo> => {
    const response = await apiClient.put(`/course-videos/${videoId}/move`, {
      module_id: newModuleId,
      order_index: newOrderIndex,
    });
    return response.data.data.video;
  },
};