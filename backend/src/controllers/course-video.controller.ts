// src/controllers/course-video.controller.ts

import { Request, Response } from 'express';
import { CourseVideoService } from '../services/course-video.service';
import { YouTubeService } from '../services/youtube.service';
import { GoogleOAuthService } from '../services/google-oauth.service';
import { AuthService } from '../services/auth.service';
import { CreateCourseVideoData, UpdateCourseVideoData } from '../types/course-video.types';
import fs from 'fs';
import path from 'path';

export class CourseVideoController {
  // Get all videos for a module
  static async getVideosByModule(req: Request, res: Response): Promise<void> {
    try {
      const { moduleId } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      // Get teacher profile
      const userWithRole = await AuthService.getUserWithRole(userId);
      if (!userWithRole || !userWithRole.teacher_profile_id) {
        res.status(403).json({
          success: false,
          message: 'Teacher profile not found',
        });
        return;
      }

      const videos = await CourseVideoService.getVideosByModule(
        moduleId,
        userWithRole.teacher_profile_id
      );

      res.status(200).json({
        success: true,
        message: 'Videos retrieved successfully',
        data: {
          videos,
          count: videos.length,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch videos',
      });
    }
  }

  // Get all videos for a course
  static async getVideosByCourse(req: Request, res: Response): Promise<void> {
    try {
      const { courseId } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      // Get teacher profile
      const userWithRole = await AuthService.getUserWithRole(userId);
      if (!userWithRole || !userWithRole.teacher_profile_id) {
        res.status(403).json({
          success: false,
          message: 'Teacher profile not found',
        });
        return;
      }

      const videos = await CourseVideoService.getVideosByCourse(
        courseId,
        userWithRole.teacher_profile_id
      );

      res.status(200).json({
        success: true,
        message: 'Videos retrieved successfully',
        data: {
          videos,
          count: videos.length,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch videos',
      });
    }
  }

  // Get single video by ID
  static async getVideoById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      // Get teacher profile
      const userWithRole = await AuthService.getUserWithRole(userId);
      if (!userWithRole || !userWithRole.teacher_profile_id) {
        res.status(403).json({
          success: false,
          message: 'Teacher profile not found',
        });
        return;
      }

      const video = await CourseVideoService.getVideoById(
        id,
        userWithRole.teacher_profile_id
      );

      if (!video) {
        res.status(404).json({
          success: false,
          message: 'Video not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Video retrieved successfully',
        data: { video },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch video',
      });
    }
  }

  // Upload video to YouTube and create entry
  static async uploadVideo(req: Request, res: Response): Promise<void> {
    let uploadedFilePath: string | null = null;

    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      // Get teacher profile
      const userWithRole = await AuthService.getUserWithRole(userId);
      if (!userWithRole || !userWithRole.teacher_profile_id) {
        res.status(403).json({
          success: false,
          message: 'Teacher profile not found',
        });
        return;
      }

      // Check if teacher has connected their YouTube account
      const ytStatus = await GoogleOAuthService.getConnectionStatus(userWithRole.teacher_profile_id);
      if (!ytStatus.connected) {
        res.status(403).json({
          success: false,
          message: 'Connect your YouTube account in Settings before uploading videos.',
        });
        return;
      }

      // Check if file was uploaded
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'No video file uploaded',
        });
        return;
      }

      uploadedFilePath = req.file.path;

      // Parse metadata from request body
      const videoData: CreateCourseVideoData = {
        module_id: req.body.module_id,
        title: req.body.title,
        description: req.body.description,
        order_index: parseInt(req.body.order_index),
        is_free_preview: req.body.is_free_preview === 'true',
      };

      // Validate required fields
      if (!videoData.module_id || !videoData.title) {
        res.status(400).json({
          success: false,
          message: 'Missing required fields: module_id, title',
        });
        return;
      }

      // Create video entry first
      const videoEntry = await CourseVideoService.createVideoEntry(
        videoData,
        userWithRole.teacher_profile_id
      );

      // Upload to YouTube (teacher's channel)
      const youtubeResponse = await YouTubeService.uploadVideo(
        uploadedFilePath,
        {
          title: videoData.title,
          description: videoData.description,
          privacyStatus: 'unlisted',
          tags: ['course', 'education'],
        },
        userWithRole.teacher_profile_id
      );

      // Get video duration
      const videoDetails = await YouTubeService.getVideoDetails(
        youtubeResponse.videoId,
        userWithRole.teacher_profile_id
      );
      const durationMinutes = YouTubeService.parseDuration(
        videoDetails.contentDetails.duration
      );

      // Update video entry with YouTube details
      const updatedVideo = await CourseVideoService.updateVideoEntry(
        videoEntry.id,
        userWithRole.teacher_profile_id,
        {
          youtube_video_id: youtubeResponse.videoId,
          duration_minutes: durationMinutes,
        }
      );

      // Clean up uploaded file
      if (fs.existsSync(uploadedFilePath)) {
        fs.unlinkSync(uploadedFilePath);
      }

      res.status(201).json({
        success: true,
        message: 'Video uploaded successfully',
        data: {
          video: updatedVideo,
          youtube: youtubeResponse,
        },
      });
    } catch (error: any) {
      // Clean up uploaded file on error
      if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
        fs.unlinkSync(uploadedFilePath);
      }

      res.status(400).json({
        success: false,
        message: error.message || 'Failed to upload video',
      });
    }
  }

  // Update video metadata
  static async updateVideo(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data: UpdateCourseVideoData = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      // Get teacher profile
      const userWithRole = await AuthService.getUserWithRole(userId);
      if (!userWithRole || !userWithRole.teacher_profile_id) {
        res.status(403).json({
          success: false,
          message: 'Teacher profile not found',
        });
        return;
      }

      // Update database entry
      const video = await CourseVideoService.updateVideoEntry(
        id,
        userWithRole.teacher_profile_id,
        data
      );

      // Update YouTube metadata if title or description changed
      if (video.youtube_video_id && (data.title || data.description)) {
        await YouTubeService.updateVideoMetadata(
          video.youtube_video_id,
          {
            title: data.title || video.title,
            description: data.description || video.description,
            privacyStatus: 'unlisted',
          },
          userWithRole.teacher_profile_id
        );
      }

      res.status(200).json({
        success: true,
        message: 'Video updated successfully',
        data: { video },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update video',
      });
    }
  }

  // Delete video
  static async deleteVideo(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      // Get teacher profile
      const userWithRole = await AuthService.getUserWithRole(userId);
      if (!userWithRole || !userWithRole.teacher_profile_id) {
        res.status(403).json({
          success: false,
          message: 'Teacher profile not found',
        });
        return;
      }

      // Get video details first
      const video = await CourseVideoService.getVideoById(
        id,
        userWithRole.teacher_profile_id
      );

      if (!video) {
        res.status(404).json({
          success: false,
          message: 'Video not found',
        });
        return;
      }

      // Delete from YouTube if exists
      if (video.youtube_video_id) {
        try {
          await YouTubeService.deleteVideo(
            video.youtube_video_id,
            userWithRole.teacher_profile_id
          );
        } catch (error) {
          console.error('Failed to delete from YouTube:', error);
          // Continue with database deletion even if YouTube deletion fails
        }
      }

      // Delete from database
      await CourseVideoService.deleteVideoEntry(id, userWithRole.teacher_profile_id);

      res.status(200).json({
        success: true,
        message: 'Video deleted successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to delete video',
      });
    }
  }


  // Reorder videos within a module
static async reorderVideos(req: Request, res: Response): Promise<void> {
  try {
    const { moduleId } = req.params;
    const { videos } = req.body; // Array of { id: string, order_index: number }
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    // Get teacher profile
    const userWithRole = await AuthService.getUserWithRole(userId);
    if (!userWithRole || !userWithRole.teacher_profile_id) {
      res.status(403).json({
        success: false,
        message: 'Teacher profile not found',
      });
      return;
    }

    await CourseVideoService.reorderVideos(moduleId, userWithRole.teacher_profile_id, videos);

    res.status(200).json({
      success: true,
      message: 'Videos reordered successfully',
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to reorder videos',
    });
  }
}

// Move video to different module
static async moveVideo(req: Request, res: Response): Promise<void> {
  try {
    const { id: videoId } = req.params;
    const { module_id, order_index } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    // Get teacher profile
    const userWithRole = await AuthService.getUserWithRole(userId);
    if (!userWithRole || !userWithRole.teacher_profile_id) {
      res.status(403).json({
        success: false,
        message: 'Teacher profile not found',
      });
      return;
    }

    const video = await CourseVideoService.moveVideo(
      videoId,
      userWithRole.teacher_profile_id,
      module_id,
      order_index
    );

    res.status(200).json({
      success: true,
      message: 'Video moved successfully',
      data: { video },
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to move video',
    });
  }
}
}