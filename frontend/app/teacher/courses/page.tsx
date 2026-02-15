// app/teacher/courses/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { courseApi } from '@/lib/course';
import { Course } from '@/types/course.types';
import { 
  BookOpen, 
  Plus, 
  Eye, 
  Trash2, 
  Edit, 
  Users, 
  Clock,
  DollarSign,
  Globe,
  CheckCircle,
  XCircle
} from 'lucide-react';

export default function TeacherCourses() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedCourses = await courseApi.getCourses();
      setCourses(fetchedCourses);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (courseId: string, courseName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${courseName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeletingId(courseId);
      await courseApi.deleteCourse(courseId);
      setCourses(courses.filter(c => c.id !== courseId));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete course');
    } finally {
      setDeletingId(null);
    }
  };

  const handleTogglePublish = async (courseId: string, currentStatus: boolean) => {
    try {
      await courseApi.togglePublish(courseId, !currentStatus);
      setCourses(courses.map(c => 
        c.id === courseId ? { ...c, is_published: !currentStatus } : c
      ));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update course status');
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="teacher">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-600">Loading courses...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="teacher">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
          <p className="mt-2 text-gray-600">
            {courses.length} {courses.length === 1 ? 'course' : 'courses'}
          </p>
        </div>
        <button
          onClick={() => router.push('/teacher/courses/create')}
          className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Create Course</span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Empty State */}
      {courses.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-xl text-gray-500 mb-2">No courses yet</p>
            <p className="text-gray-400 mb-6">
              Start creating your first course to share knowledge with your students
            </p>
            <button
              onClick={() => router.push('/teacher/courses/create')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Your First Course
            </button>
          </div>
        </div>
      ) : (
        /* Courses Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Course Thumbnail */}
              <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 aspect-video">
                {course.thumbnail_url ? (
                  <img
                    src={course.thumbnail_url}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <BookOpen className="w-16 h-16 text-white opacity-50" />
                  </div>
                )}
                
                {/* Status Badge */}
                <div className="absolute top-2 right-2">
                  {course.is_published ? (
                    <span className="flex items-center space-x-1 bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold">
                      <CheckCircle className="w-3 h-3" />
                      <span>Published</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-1 bg-gray-500 text-white px-2 py-1 rounded text-xs font-semibold">
                      <XCircle className="w-3 h-3" />
                      <span>Draft</span>
                    </span>
                  )}
                </div>

                {/* Level Badge */}
                <div className="absolute top-2 left-2">
                  <span className="bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs font-semibold capitalize">
                    {course.level}
                  </span>
                </div>
              </div>

              {/* Course Info */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {course.title}
                </h3>
                
                {course.short_description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {course.short_description}
                  </p>
                )}

                {/* Course Stats */}
                <div className="grid grid-cols-2 gap-2 mb-4 text-xs text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{course.enrollment_count} students</span>
                  </div>
                  {course.duration_hours && (
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{course.duration_hours}h</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-1">
                    <DollarSign className="w-4 h-4" />
                    <span>${course.price}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Globe className="w-4 h-4" />
                    <span>{course.language}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => router.push(`/teacher/courses/${course.id}`)}
                    className="flex-1 flex items-center justify-center space-x-1 bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 transition-colors text-sm"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View</span>
                  </button>
                  <button
                    onClick={() => router.push(`/teacher/courses/${course.id}/edit`)}
                    className="flex items-center justify-center bg-gray-200 text-gray-700 px-3 py-2 rounded hover:bg-gray-300 transition-colors text-sm"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(course.id, course.title)}
                    disabled={deletingId === course.id}
                    className="flex items-center justify-center bg-red-100 text-red-600 px-3 py-2 rounded hover:bg-red-200 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Publish Toggle */}
                <button
                  onClick={() => handleTogglePublish(course.id, course.is_published)}
                  className="w-full mt-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {course.is_published ? 'Unpublish Course' : 'Publish Course'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}