// app/teacher/courses/[id]/students/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { courseApi } from '@/lib/course';
import { EnrolledStudent, EnrollmentStats } from '@/types/course.types';
import { Course } from '@/types/course.types';
import {
  ArrowLeft,
  Users,
  Search,
  Mail,
  Phone,
  Calendar,
  TrendingUp,
  Award,
  BookOpen,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Trash2,
  Filter,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function CourseStudentsPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params?.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [students, setStudents] = useState<EnrolledStudent[]>([]);
  const [stats, setStats] = useState<EnrollmentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deletingStudentId, setDeletingStudentId] = useState<string | null>(null);

  useEffect(() => {
    if (courseId) {
      fetchData();
    }
  }, [courseId]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [courseData, studentsData, statsData] = await Promise.all([
        courseApi.getCourseById(courseId),
        courseApi.getEnrolledStudents(courseId),
        courseApi.getEnrollmentStats(courseId),
      ]);

      setCourse(courseData);
      setStudents(studentsData);
      setStats(statsData);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleUnenroll = async (studentId: string, studentName: string) => {
    if (!window.confirm(`Are you sure you want to unenroll ${studentName} from this course?`)) {
      return;
    }

    try {
      setDeletingStudentId(studentId);
      await courseApi.unenrollStudent(courseId, studentId);
      toast.success('Student unenrolled successfully');
      fetchData(); // Refresh data
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to unenroll student');
    } finally {
      setDeletingStudentId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800',
      suspended: 'bg-yellow-100 text-yellow-800',
    };
    return styles[status as keyof typeof styles] || styles.active;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4" />;
      case 'completed':
        return <Award className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      case 'suspended':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <CheckCircle className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || student.enrollment_status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <DashboardLayout role="teacher">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="teacher">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push(`/teacher/courses/${courseId}`)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Course</span>
        </button>

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Enrolled Students</h1>
            <p className="text-gray-600">{course?.title}</p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-600">Total Students</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.total_enrollments}</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-gray-600">Active</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.active_students}</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Award className="h-5 w-5 text-purple-600" />
                <span className="text-sm font-medium text-gray-600">Completed</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.completed_students}</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-orange-600" />
                <span className="text-sm font-medium text-gray-600">Avg Progress</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.average_progress}%</p>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
            />
          </div>

          {/* Status Filter */}
          <div className="w-full md:w-48">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 appearance-none bg-white"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Students List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {filteredStudents.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-xl text-gray-500 mb-2">
              {searchQuery || statusFilter !== 'all'
                ? 'No students found matching your filters'
                : 'No students enrolled yet'}
            </p>
            {!searchQuery && statusFilter === 'all' && (
              <p className="text-gray-400">
                Students will appear here once they enroll in your course
              </p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Enrolled
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Accessed
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.map((student) => (
                  <tr key={student.enrollment_id} className="hover:bg-gray-50">
                    {/* Student */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {student.profile_picture_url ? (
                            <img
                              className="h-10 w-10 rounded-full"
                              src={student.profile_picture_url}
                              alt={student.full_name}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                              <span className="text-purple-600 font-semibold text-sm">
                                {student.full_name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {student.full_name}
                          </div>
                          {student.education_level && (
                            <div className="text-xs text-gray-500">
                              {student.education_level}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center text-sm text-gray-900">
                          <Mail className="h-3 w-3 text-gray-400 mr-2" />
                          {student.email}
                        </div>
                        {student.phone && (
                          <div className="flex items-center text-sm text-gray-500">
                            <Phone className="h-3 w-3 text-gray-400 mr-2" />
                            {student.phone}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(
                          student.enrollment_status
                        )}`}
                      >
                        {getStatusIcon(student.enrollment_status)}
                        <span className="capitalize">{student.enrollment_status}</span>
                      </span>
                      {student.certificate_issued && (
                        <div className="mt-1">
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <Award className="h-3 w-3" />
                            <span>Certified</span>
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Progress */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-24">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-gray-700">
                              {student.progress_percentage}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-purple-600 h-2 rounded-full transition-all"
                              style={{ width: `${student.progress_percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Enrolled Date */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        {formatDate(student.enrollment_date)}
                      </div>
                    </td>

                    {/* Last Accessed */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 text-gray-400 mr-2" />
                        {student.last_accessed_at
                          ? formatDate(student.last_accessed_at)
                          : 'Never'}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleUnenroll(student.student_profile_id, student.full_name)}
                        disabled={deletingStudentId === student.student_profile_id}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Unenroll student"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Unenroll</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary Footer */}
      {filteredStudents.length > 0 && (
        <div className="mt-4 bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              Showing {filteredStudents.length} of {students.length} students
            </span>
            {(searchQuery || statusFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                }}
                className="text-purple-600 hover:text-purple-700 font-medium"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}