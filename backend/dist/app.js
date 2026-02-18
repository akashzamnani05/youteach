"use strict";
// src/app.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
// Import routes
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const students_routes_1 = __importDefault(require("./routes/students.routes"));
const webinar_routes_1 = __importDefault(require("./routes/webinar.routes"));
const student_webinar_routes_1 = __importDefault(require("./routes/student-webinar.routes"));
const course_routes_1 = __importDefault(require("./routes/course.routes"));
const module_routes_1 = __importDefault(require("./routes/module.routes"));
const course_video_routes_1 = __importDefault(require("./routes/course-video.routes"));
const student_course_routes_1 = __importDefault(require("./routes/student-course.routes"));
const student_course_content_routes_1 = __importDefault(require("./routes/student-course-content.routes")); // ADD THIS
const documents_routes_1 = __importDefault(require("./routes/documents.routes"));
const announcements_routes_1 = __importDefault(require("./routes/announcements.routes"));
const batches_routes_1 = __importDefault(require("./routes/batches.routes"));
const batch_sessions_routes_1 = __importDefault(require("./routes/batch-sessions.routes"));
const calendar_routes_1 = __importDefault(require("./routes/calendar.routes"));
const dashboard_routes_1 = __importDefault(require("./routes/dashboard.routes"));
const google_oauth_routes_1 = __importDefault(require("./routes/google-oauth.routes"));
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
// CORS configuration
const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true, // Allow cookies
    optionsSuccessStatus: 200,
};
// Middleware
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
// Health check route
app.get('/health', (_req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
    });
});
// API Routes
app.use('/api/auth/google', google_oauth_routes_1.default);
app.use('/api/auth', auth_routes_1.default);
app.use('/api/students', students_routes_1.default);
app.use('/api/webinars', webinar_routes_1.default);
app.use('/api/student-webinars', student_webinar_routes_1.default);
app.use('/api/courses', course_routes_1.default);
app.use('/api/modules', module_routes_1.default);
app.use('/api/course-videos', course_video_routes_1.default);
app.use('/api/student-courses', student_course_routes_1.default);
app.use('/api/student/courses', student_course_routes_1.default);
app.use('/api/student-course-content', student_course_content_routes_1.default); // ADD THIS
app.use('/api/documents', documents_routes_1.default);
app.use('/api/announcements', announcements_routes_1.default);
app.use('/api/batches', batches_routes_1.default);
app.use('/api/batch-sessions', batch_sessions_routes_1.default);
app.use('/api/calendar', calendar_routes_1.default);
app.use('/api/dashboard', dashboard_routes_1.default);
// 404 Handler
app.use((_req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
    });
});
// Global error handler
app.use((err, _req, res, _next) => {
    console.error('Error:', err);
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal server error';
    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
});
exports.default = app;
//# sourceMappingURL=app.js.map