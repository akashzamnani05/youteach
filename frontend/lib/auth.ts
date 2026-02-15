// lib/auth.ts

import apiClient from './api';
import Cookies from 'js-cookie';
import {
  User,
  LoginCredentials,
  TeacherSignupData,
  StudentSignupData,
  ApiResponse,
} from '@/types';

export const authApi = {
  // Login
  login: async (credentials: LoginCredentials): Promise<ApiResponse<{ user: User; tokens: any }>> => {
    const { data } = await apiClient.post('/auth/login', credentials);
    return data;
  },

  // Teacher Signup
  signupTeacher: async (signupData: TeacherSignupData): Promise<ApiResponse<{ user: User; tokens: any }>> => {
    const { data } = await apiClient.post('/auth/signup/teacher', signupData);
    return data;
  },

  // Student Signup
  signupStudent: async (signupData: StudentSignupData): Promise<ApiResponse<{ user: User; tokens: any }>> => {
    const { data } = await apiClient.post('/auth/signup/student', signupData);
    return data;
  },

  // Get current user
  getCurrentUser: async (): Promise<ApiResponse<{ user: User }>> => {
    const { data } = await apiClient.get('/auth/me');
    return data;
  },

  // Logout
  logout: async (): Promise<ApiResponse> => {
    const { data } = await apiClient.post('/auth/logout');
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
    return data;
  },

  // Refresh token
  refreshToken: async (): Promise<ApiResponse> => {
    const { data } = await apiClient.post('/auth/refresh');
    return data;
  },
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!Cookies.get('accessToken');
};

// Get user role from cookies or token
export const getUserRole = (): 'teacher' | 'student' | null => {
  // This would need to decode the token or fetch from API
  // For now, we'll need to call getCurrentUser
  return null;
};
