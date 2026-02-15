// types/course.types.ts

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
  created_at: string;
  updated_at: string;
}

export interface CourseModule {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface CreateCourseData {
  title: string;
  description?: string;
  short_description?: string;
  price?: number;
  level?: 'beginner' | 'intermediate' | 'advanced' | 'all';
  language?: string;
  requirements?: string;
  what_you_will_learn?: string[];
}

export interface UpdateCourseData {
  title?: string;
  description?: string;
  short_description?: string;
  thumbnail_url?: string;
  trailer_youtube_id?: string;
  price?: number;
  level?: 'beginner' | 'intermediate' | 'advanced' | 'all';
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

// Add these type definitions at the top of the file
export interface EnrolledStudent {
  enrollment_id: string;
  enrollment_date: string;
  enrollment_status: 'active' | 'completed' | 'cancelled' | 'suspended';
  progress_percentage: number;
  last_accessed_at?: string;
  completed_at?: string;
  certificate_issued: boolean;
  user_id: string;
  email: string;
  full_name: string;
  phone?: string;
  profile_picture_url?: string;
  student_profile_id: string;
  date_of_birth?: string;
  interests?: string[];
  education_level?: string;
  bio?: string;
}

export interface EnrollmentStats {
  total_enrollments: number;
  active_students: number;
  completed_students: number;
  cancelled_students: number;
  suspended_students: number;
  average_progress: string;
  certificates_issued: number;
}

