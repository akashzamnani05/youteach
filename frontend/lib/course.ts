import { Course, CourseModule, UpdateCourseData, CreateCourseData, CreateModuleData, UpdateModuleData,EnrolledStudent,EnrollmentStats } from '../types/course.types';
import apiClient from './api';

export const courseApi = {
  // ========== COURSES ==========
  
  // Get all courses for logged-in teacher
  getCourses: async (): Promise<Course[]> => {
    const response = await apiClient.get('/courses');
    return response.data.data.courses;
  },

  // Get single course by ID
  getCourseById: async (courseId: string): Promise<Course> => {
    const response = await apiClient.get(`/courses/${courseId}`);
    return response.data.data.course;
  },

  // Create new course
  createCourse: async (data: CreateCourseData): Promise<Course> => {
    const response = await apiClient.post('/courses', data);
    return response.data.data.course;
  },

  // Update course
  updateCourse: async (
    courseId: string,
    data: UpdateCourseData
  ): Promise<Course> => {
    const response = await apiClient.put(`/courses/${courseId}`, data);
    return response.data.data.course;
  },

  // Delete course
  deleteCourse: async (courseId: string): Promise<void> => {
    await apiClient.delete(`/courses/${courseId}`);
  },

  // Publish/unpublish course
  togglePublish: async (courseId: string, isPublished: boolean): Promise<Course> => {
    const response = await apiClient.put(`/courses/${courseId}`, { is_published: isPublished });
    return response.data.data.course;
  },

  // ========== MODULES ==========

  // Get all modules for a course
  getModulesByCourse: async (courseId: string): Promise<CourseModule[]> => {
    const response = await apiClient.get(`/courses/${courseId}/modules`);
    return response.data.data.modules;
  },

  // Get single module by ID
  getModuleById: async (moduleId: string): Promise<CourseModule> => {
    const response = await apiClient.get(`/modules/${moduleId}`);
    return response.data.data.module;
  },

  // Create new module
  createModule: async (data: CreateModuleData): Promise<CourseModule> => {
    const response = await apiClient.post('/modules', data);
    return response.data.data.module;
  },

  // Update module
  updateModule: async (
    moduleId: string,
    data: UpdateModuleData
  ): Promise<CourseModule> => {
    const response = await apiClient.put(`/modules/${moduleId}`, data);
    return response.data.data.module;
  },

  // Delete module
  deleteModule: async (moduleId: string): Promise<void> => {
    await apiClient.delete(`/modules/${moduleId}`);
  },

  // ========== REORDERING (NEW) ==========

  // Reorder modules
  reorderModules: async (
    courseId: string,
    moduleOrders: { id: string; order_index: number }[]
  ): Promise<void> => {
    const response = await apiClient.put(`/courses/${courseId}/reorder-modules`, {
      modules: moduleOrders,
    });
    return response.data;
  },

  getEnrolledStudents: async (courseId: string): Promise<EnrolledStudent[]> => {
    const response = await apiClient.get(`/courses/${courseId}/students`);
    return response.data.data.students;
  },

  // Get enrollment statistics for a course
  getEnrollmentStats: async (courseId: string): Promise<EnrollmentStats> => {
    const response = await apiClient.get(`/courses/${courseId}/stats`);
    return response.data.data.stats;
  },

  // Get single enrolled student details
  getEnrolledStudentById: async (
    courseId: string,
    studentId: string
  ): Promise<EnrolledStudent> => {
    const response = await apiClient.get(`/courses/${courseId}/students/${studentId}`);
    return response.data.data.student;
  },

  // Unenroll student from course (teacher action)
  unenrollStudent: async (courseId: string, studentId: string): Promise<void> => {
    await apiClient.delete(`/courses/${courseId}/students/${studentId}`);
  },
};