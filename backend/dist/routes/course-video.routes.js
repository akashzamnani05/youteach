"use strict";
// src/routes/course-video.routes.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const course_video_controller_1 = require("../controllers/course-video.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const router = (0, express_1.Router)();
// Configure multer for video uploads
const uploadDir = path_1.default.join(__dirname, '../../uploads/videos');
// Ensure upload directory exists
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, 'video-' + uniqueSuffix + path_1.default.extname(file.originalname));
    },
});
const upload = (0, multer_1.default)({
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
        }
        else {
            cb(new Error('Invalid file type. Only video files are allowed.'));
        }
    },
});
// All routes require authentication
router.use(auth_middleware_1.authenticate);
// GET /api/course-videos/module/:moduleId - Get all videos for a module
router.get('/module/:moduleId', course_video_controller_1.CourseVideoController.getVideosByModule);
// GET /api/course-videos/course/:courseId - Get all videos for a course
router.get('/course/:courseId', course_video_controller_1.CourseVideoController.getVideosByCourse);
// GET /api/course-videos/:id - Get single video by ID
router.get('/:id', course_video_controller_1.CourseVideoController.getVideoById);
// POST /api/course-videos/upload - Upload video to YouTube
router.post('/upload', upload.single('video'), course_video_controller_1.CourseVideoController.uploadVideo);
// PUT /api/course-videos/:id - Update video metadata
router.put('/:id', course_video_controller_1.CourseVideoController.updateVideo);
// DELETE /api/course-videos/:id - Delete video
router.delete('/:id', course_video_controller_1.CourseVideoController.deleteVideo);
// Reorder videos within a module
router.put('/module/:moduleId/reorder', course_video_controller_1.CourseVideoController.reorderVideos);
// Move video to different module
router.put('/:id/move', course_video_controller_1.CourseVideoController.moveVideo);
exports.default = router;
//# sourceMappingURL=course-video.routes.js.map