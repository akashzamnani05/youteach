// src/types/course.types.ts

export interface Course {
  id: string;
  teacher_id: string;
  title: string;
  slug: string;
  description?: string;
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
  created_at: Date;
  updated_at: Date;
}

export interface CourseModule {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  order_index: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateCourseData {
  title: string;
  description?: string;
  short_description?: string;
  thumbnail_url?: string;
  price?: number;
  level?: 'beginner' | 'intermediate' | 'advanced' | 'all';
  language?: string;
  requirements?: string;
  what_you_will_learn?: string[];
}

export interface UpdateCourseData {
  title?: string;
  slug?: string;
  description?: string;
  short_description?: string;
  thumbnail_url?: string;
  trailer_youtube_id?: string;
  price?: number;
  currency?: string;
  level?: 'beginner' | 'intermediate' | 'advanced' | 'all';
  duration_hours?: number;
  language?: string;
  requirements?: string;
  what_you_will_learn?: string[];
  is_published?: boolean;
}

export interface CreateModuleData {
  course_id: string;
  title: string;
  description?: string;
  order_index: number;
}

export interface UpdateModuleData {
  title?: string;
  description?: string;
  order_index?: number;
}



export interface Enrollment {
  id: string;
  student_id: string;
  course_id: string;
  enrollment_date: Date;
  status: string;
  progress_percentage: number;
  last_accessed_at?: Date;
  completed_at?: Date;
  certificate_issued: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CourseWithEnrollment extends Course {
  is_enrolled: boolean;
  enrollment_status?: string;
  progress_percentage?: number;
  enrollment_date?: Date;
  last_accessed_at?: Date;
}

export interface EnrolledCourseDetails extends Course {
  enrollment_id: string;
  enrollment_date: Date;
  enrollment_status: string;
  progress_percentage: number;
  last_accessed_at?: Date;
  completed_at?: Date;
  certificate_issued: boolean;
  teacher_name?: string;
}