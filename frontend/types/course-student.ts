// types/course-student.ts

// Response wrapper type
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Course type for "All Courses" list
export interface CourseWithEnrollment {
  id: string;
  teacher_id: string;
  title: string;
  slug: string;
  description: string;
  short_description?: string;
  thumbnail_url?: string;
  trailer_youtube_id?: string;
  price: number;
  currency: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'all';
  duration_hours?: number;
  language: string;
  requirements?: string;
  what_you_will_learn?: string[];
  is_published: boolean;
  enrollment_count: number;
  teacher_name?: string;
  is_enrolled: boolean;
  created_at: string;
  updated_at: string;
}

// Course type for "Enrolled Courses" list
export interface EnrolledCourse {
  id: string;
  teacher_id: string;
  title: string;
  slug: string;
  description: string;
  short_description?: string;
  thumbnail_url?: string;
  price: number;
  currency: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'all';
  duration_hours?: number;
  language: string;
  what_you_will_learn?: string[];
  teacher_name?: string;
  enrollment_date: string;
  enrollment_status: 'active' | 'completed' | 'cancelled' | 'suspended';
  progress_percentage: number;
  last_accessed_at?: string;
  certificate_issued: boolean;
  created_at: string;
  updated_at: string;
}

// Module type
export interface Module {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

// Content type
export interface Content {
  id: string;
  module_id: string;
  content_type: 'video' | 'document' | 'quiz' | 'assignment' | 'text' | 'link';
  title: string;
  description?: string;
  youtube_video_id?: string;
  google_drive_file_id?: string;
  content_url?: string;
  text_content?: string;
  duration_minutes?: number;
  file_size_mb?: number;
  order_index: number;
  is_free_preview: boolean;
  created_at: string;
  updated_at: string;
}

// Module with content
export interface ModuleWithContent extends Module {
  content: Content[];
}