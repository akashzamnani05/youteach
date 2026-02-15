// types/index.ts

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  profile_picture_url?: string;
  is_active: boolean;
  email_verified: boolean;
  role: 'teacher' | 'student' | 'none';
  teacher_profile_id?: string;
  student_profile_id?: string;
  website_slug?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface TeacherSignupData {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  bio?: string;
  headline?: string;
  specializations?: string[];
  experience_years?: number;
  hourly_rate?: number;
}

export interface StudentSignupData {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  date_of_birth?: string;
  interests?: string[];
  education_level?: string;
}

export interface StudentData {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  date_of_birth?: string;
  interests?: string[];
  education_level?: string;
}

export interface Student {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  phone?: string;
  date_of_birth?: string;
  interests?: string[];
  education_level?: string;
  bio?: string;
  is_active: boolean;
  created_at: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}