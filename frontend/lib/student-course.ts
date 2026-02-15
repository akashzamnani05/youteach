// lib/student-course.ts

import apiClient from './api';
import type {
  ApiResponse,
  CourseWithEnrollment,
  EnrolledCourse,
  Module,
  Content,
  ModuleWithContent,
} from '@/types/course-student';

// Get all courses for student (returns full response with success flag)
export const getAllCourses = async (): Promise<ApiResponse<{ courses: CourseWithEnrollment[]; count: number }>> => {
  const response = await apiClient.get('/student-courses');
  return response.data;
};

// Get enrolled courses (returns full response with success flag)
export const getEnrolledCourses = async (): Promise<ApiResponse<{ courses: EnrolledCourse[]; count: number }>> => {
  const response = await apiClient.get('/student-courses/enrolled');
  return response.data;
};

// Get single course by ID
export const getCourseById = async (courseId: string): Promise<CourseWithEnrollment> => {
  const response = await apiClient.get(`/student-courses/${courseId}`);
  return response.data.data.course;
};

// Enroll in course
export const enrollInCourse = async (courseId: string): Promise<ApiResponse<any>> => {
  const response = await apiClient.post(`/student-courses/${courseId}/enroll`);
  return response.data;
};

// Unenroll from course
export const unenrollFromCourse = async (courseId: string): Promise<ApiResponse<any>> => {
  const response = await apiClient.delete(`/student-courses/${courseId}/enroll`);
  return response.data;
};

// Update last accessed
export const updateLastAccessed = async (courseId: string): Promise<ApiResponse<any>> => {
  const response = await apiClient.patch(`/student-courses/${courseId}/last-accessed`);
  return response.data;
};

// Update progress
export const updateProgress = async (courseId: string, progressPercentage: number): Promise<ApiResponse<any>> => {
  const response = await apiClient.patch(`/student-courses/${courseId}/progress`, {
    progress_percentage: progressPercentage,
  });
  return response.data;
};

// Course Content API - for learn page
export const getModulesByCourse = async (courseId: string): Promise<Module[]> => {
  const response = await apiClient.get(`/student-course-content/course/${courseId}/modules`);
  return response.data.data.modules;
};

export const getContentByModule = async (moduleId: string): Promise<Content[]> => {
  const response = await apiClient.get(`/student-course-content/module/${moduleId}/content`);
  return response.data.data.content;
};

export const getFullCourseContent = async (courseId: string): Promise<ModuleWithContent[]> => {
  const response = await apiClient.get(`/student-course-content/course/${courseId}/content`);
  return response.data.data.modules;
};