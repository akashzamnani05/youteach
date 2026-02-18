// src/app.ts

import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './routes/auth.routes';
import studentRoutes from './routes/students.routes';
import webinarRoutes from './routes/webinar.routes';
import studentWebinarRoutes from './routes/student-webinar.routes';
import courseRoutes from './routes/course.routes';
import moduleRoutes from './routes/module.routes';
import courseVideoRoutes from './routes/course-video.routes'; 
import studentCourseRoutes from './routes/student-course.routes';
import studentCourseContentRoutes from './routes/student-course-content.routes'; // ADD THIS
import documentsRoutes from './routes/documents.routes';
import announcementsRoutes from './routes/announcements.routes';
import batchesRoutes from './routes/batches.routes';
import batchSessionsRoutes from './routes/batch-sessions.routes';
import calendarRoutes from './routes/calendar.routes';
import dashboardRoutes from './routes/dashboard.routes';
import googleOAuthRoutes from './routes/google-oauth.routes';

// Load environment variables
dotenv.config();

const app: Application = express();

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  process.env.FRONTEND_URL,
].filter(Boolean).map(o => (o as string).trim()) as string[];

console.log('CORS allowed origins:', allowedOrigins);

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (mobile apps, curl, Postman, server-to-server)
    if (!origin) return callback(null, true);
    // Strip trailing slash for comparison
    const normalised = origin.replace(/\/$/, '');
    if (allowedOrigins.map(o => o.replace(/\/$/, '')).includes(normalised)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error(`CORS: origin ${origin} not allowed`));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

// Middleware
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // explicit preflight for all routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check route
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth/google', googleOAuthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/webinars', webinarRoutes);
app.use('/api/student-webinars', studentWebinarRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/course-videos', courseVideoRoutes); 
app.use('/api/student-courses', studentCourseRoutes);
app.use('/api/student/courses', studentCourseRoutes); 
app.use('/api/student-course-content', studentCourseContentRoutes); // ADD THIS
app.use('/api/documents', documentsRoutes);
app.use('/api/announcements', announcementsRoutes);
app.use('/api/batches', batchesRoutes);
app.use('/api/batch-sessions', batchSessionsRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/dashboard', dashboardRoutes);

// 404 Handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Global error handler
app.use((err: any, _req: Request, res: Response, _next: any) => {
  console.error('Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

export default app;