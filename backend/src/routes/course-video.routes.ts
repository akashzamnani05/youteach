// src/routes/course-video.routes.ts

import { Router } from 'express';
import { CourseVideoController } from '../controllers/course-video.controller';
import { authenticate } from '../middleware/auth.middleware';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

// Configure multer for video uploads
const uploadDir = path.join(__dirname, '../../uploads/videos');

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'video-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept video files only
    const allowedMimes = [
      'video/mp4',
      'video/mpeg',
      'video/quicktime',
      'video/x-msvideo',
      'video/x-ms-wmv',
      'video/webm',
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only video files are allowed.'));
    }
  },
});

// All routes require authentication
router.use(authenticate);

// GET /api/course-videos/module/:moduleId - Get all videos for a module
router.get('/module/:moduleId', CourseVideoController.getVideosByModule);

// GET /api/course-videos/course/:courseId - Get all videos for a course
router.get('/course/:courseId', CourseVideoController.getVideosByCourse);

// GET /api/course-videos/:id - Get single video by ID
router.get('/:id', CourseVideoController.getVideoById);

// POST /api/course-videos/upload - Upload video to YouTube
router.post('/upload', upload.single('video'), CourseVideoController.uploadVideo);

// PUT /api/course-videos/:id - Update video metadata
router.put('/:id', CourseVideoController.updateVideo);

// DELETE /api/course-videos/:id - Delete video
router.delete('/:id', CourseVideoController.deleteVideo);


// Reorder videos within a module
router.put('/module/:moduleId/reorder', CourseVideoController.reorderVideos);

// Move video to different module
router.put('/:id/move', CourseVideoController.moveVideo);

export default router;