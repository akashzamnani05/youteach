// src/services/youtube.service.ts

import { google } from 'googleapis';
import { VideoUploadMetadata, YouTubeUploadResponse } from '../types/course-video.types';
import { GoogleOAuthService } from './google-oauth.service';
import fs from 'fs';

export class YouTubeService {
  // Upload video to the teacher's YouTube channel
  static async uploadVideo(
    filePath: string,
    metadata: VideoUploadMetadata,
    teacherProfileId: string
  ): Promise<YouTubeUploadResponse> {
    try {
      const oauth2Client = await GoogleOAuthService.getTeacherOAuth2Client(teacherProfileId);
      const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

      // Upload video
      const response = await youtube.videos.insert({
        part: ['snippet', 'status'],
        requestBody: {
          snippet: {
            title: metadata.title,
            description: metadata.description || '',
            tags: metadata.tags || [],
            categoryId: metadata.categoryId || '27', // Education category
          },
          status: {
            privacyStatus: metadata.privacyStatus,
            selfDeclaredMadeForKids: false,
          },
        },
        media: {
          body: fs.createReadStream(filePath),
        },
      });

      const videoId = response.data.id!;
      const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
      const embedUrl = `https://www.youtube.com/embed/${videoId}`;

      return {
        videoId,
        title: response.data.snippet?.title || metadata.title,
        description: response.data.snippet?.description || metadata.description || '',
        url: videoUrl,
        embedUrl,
      };
    } catch (error: any) {
      console.error('YouTube upload error:', error);
      throw new Error(`Failed to upload video to YouTube: ${error.message}`);
    }
  }

  // Get video details from the teacher's YouTube account
  static async getVideoDetails(videoId: string, teacherProfileId: string): Promise<any> {
    try {
      const oauth2Client = await GoogleOAuthService.getTeacherOAuth2Client(teacherProfileId);
      const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

      const response = await youtube.videos.list({
        part: ['snippet', 'contentDetails', 'status'],
        id: [videoId],
      });

      if (!response.data.items || response.data.items.length === 0) {
        throw new Error('Video not found');
      }

      return response.data.items[0];
    } catch (error: any) {
      throw new Error(`Failed to get video details: ${error.message}`);
    }
  }

  // Update video metadata on the teacher's YouTube channel
  static async updateVideoMetadata(
    videoId: string,
    metadata: Partial<VideoUploadMetadata>,
    teacherProfileId: string
  ): Promise<void> {
    try {
      const oauth2Client = await GoogleOAuthService.getTeacherOAuth2Client(teacherProfileId);
      const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

      await youtube.videos.update({
        part: ['snippet', 'status'],
        requestBody: {
          id: videoId,
          snippet: {
            title: metadata.title,
            description: metadata.description,
            tags: metadata.tags,
            categoryId: metadata.categoryId || '27',
          },
          status: {
            privacyStatus: metadata.privacyStatus || 'unlisted',
          },
        },
      });
    } catch (error: any) {
      throw new Error(`Failed to update video metadata: ${error.message}`);
    }
  }

  // Delete video from the teacher's YouTube channel
  static async deleteVideo(videoId: string, teacherProfileId: string): Promise<void> {
    try {
      const oauth2Client = await GoogleOAuthService.getTeacherOAuth2Client(teacherProfileId);
      const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

      await youtube.videos.delete({ id: videoId });
    } catch (error: any) {
      throw new Error(`Failed to delete video: ${error.message}`);
    }
  }

  // Parse duration from ISO 8601 format (PT1H2M3S) to minutes
  static parseDuration(isoDuration: string): number {
    const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;

    const hours = parseInt(match[1] || '0', 10);
    const minutes = parseInt(match[2] || '0', 10);
    const seconds = parseInt(match[3] || '0', 10);

    return hours * 60 + minutes + Math.ceil(seconds / 60);
  }
}