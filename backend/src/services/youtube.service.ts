// src/services/youtube.service.ts

import axios from 'axios';
import FormData from 'form-data';
import { google } from 'googleapis';
import { youtubeConfig, validateYoutubeConfig } from '../config/youtube.config';
import { VideoUploadMetadata, YouTubeUploadResponse } from '../types/course-video.types';
import fs from 'fs';

export class YouTubeService {
  private static oauth2Client: any;

  // Initialize OAuth2 client
  private static getOAuth2Client() {
    if (!this.oauth2Client) {
      validateYoutubeConfig();
      
      const { google } = require('googleapis');
      this.oauth2Client = new google.auth.OAuth2(
        youtubeConfig.clientId,
        youtubeConfig.clientSecret,
        youtubeConfig.redirectUri
      );

      // Set refresh token
      this.oauth2Client.setCredentials({
        refresh_token: youtubeConfig.refreshToken,
      });
    }

    return this.oauth2Client;
  }

  // Get access token
  private static async getAccessToken(): Promise<string> {
    const oauth2Client = this.getOAuth2Client();
    
    try {
      const { credentials } = await oauth2Client.refreshAccessToken();
      return credentials.access_token;
    } catch (error: any) {
      throw new Error(`Failed to refresh access token: ${error.message}`);
    }
  }

  // Upload video to YouTube
  static async uploadVideo(
    filePath: string,
    metadata: VideoUploadMetadata
  ): Promise<YouTubeUploadResponse> {
    try {
      const oauth2Client = this.getOAuth2Client();
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

  // Get video details
  static async getVideoDetails(videoId: string): Promise<any> {
    try {
      const oauth2Client = this.getOAuth2Client();
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

  // Update video metadata
  static async updateVideoMetadata(
    videoId: string,
    metadata: Partial<VideoUploadMetadata>
  ): Promise<void> {
    try {
      const oauth2Client = this.getOAuth2Client();
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

  // Delete video
  static async deleteVideo(videoId: string): Promise<void> {
    try {
      const oauth2Client = this.getOAuth2Client();
      const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

      await youtube.videos.delete({
        id: videoId,
      });
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