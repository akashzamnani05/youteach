// app/student/courses/page.tsx

'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { BookOpen, Search, Clock, User, TrendingUp, CheckCircle, XCircle, ImageOff } from 'lucide-react';
import { getAllCourses, getEnrolledCourses, enrollInCourse, unenrollFromCourse, } from '@/lib/student-course';
import { CourseWithEnrollment, EnrolledCourse } from '@/types/course-student';
import { toast } from 'react-hot-toast';

export default function StudentCourses() {
  const [activeTab, setActiveTab] = useState<'all' | 'enrolled'>('all');
  const [allCourses, setAllCourses] = useState<CourseWithEnrollment[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [enrollingCourseId, setEnrollingCourseId] = useState<string | null>(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const [allCoursesData, enrolledCoursesData] = await Promise.all([
        getAllCourses(),
        getEnrolledCourses(),
      ]);

      if (allCoursesData.success) {
        setAllCourses(allCoursesData.data.courses);
      }

      if (enrolledCoursesData.success) {
        setEnrolledCourses(enrolledCoursesData.data.courses);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId: string) => {
    try {
      setEnrollingCourseId(courseId);
      const response = await enrollInCourse(courseId);
      
      if (response.success) {
        toast.success('Successfully enrolled in course!');
        await fetchCourses(); // Refresh data
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to enroll in course');
    } finally {
      setEnrollingCourseId(null);
    }
  };

  const handleUnenroll = async (courseId: string, event?: React.MouseEvent) => {
    // Prevent event propagation if event is provided
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (!window.confirm('Are you sure you want to unenroll from this course?')) {
      return;
    }

    try {
      setEnrollingCourseId(courseId);
      console.log('Unenrolling from course:', courseId); // Debug log
      const response = await unenrollFromCourse(courseId);
      
      console.log('Unenroll response:', response); // Debug log
      
      if (response.success) {
        toast.success('Successfully unenrolled from course');
        await fetchCourses(); // Refresh data
      }
    } catch (error: any) {
      console.error('Unenroll error:', error); // Debug log
      toast.error(error.response?.data?.message || 'Failed to unenroll from course');
    } finally {
      setEnrollingCourseId(null);
    }
  };

  const filteredAllCourses = allCourses.filter(course =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.short_description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.level.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredEnrolledCourses = enrolledCourses.filter(course =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderCourseCard = (course: CourseWithEnrollment) => (
    <div key={course.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden">
      {course.thumbnail_url ? (
        <img
          src={course.thumbnail_url}
          alt={course.title}
          className="w-full h-48 object-cover"
        />
      ) : (
        <div className="w-full h-48 bg-gradient-to-br from-purple-100 to-blue-100 flex flex-col items-center justify-center">
          <BookOpen className="h-12 w-12 text-purple-300 mb-2" />
          <span className="text-xs text-purple-400">No thumbnail</span>
        </div>
      )}
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{course.title}</h3>
            <p className="text-gray-600 text-sm line-clamp-2 mb-3">{course.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            <span className="capitalize">{course.level}</span>
          </div>
          {course.duration_hours && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{course.duration_hours}h</span>
            </div>
          )}
        </div>

        {course.what_you_will_learn && course.what_you_will_learn.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">What you'll learn:</p>
            <ul className="text-sm text-gray-600 space-y-1">
              {course.what_you_will_learn.slice(0, 2).map((item: string, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="line-clamp-1">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-2xl font-bold text-purple-600">
            {course.currency === 'USD' ? '$' : course.currency} {course.price}
          </div>
          
          {course.is_enrolled ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-green-600 font-medium">Enrolled</span>
              <button
                onClick={(e) => handleUnenroll(course.id, e)}
                disabled={enrollingCourseId === course.id}
                className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {enrollingCourseId === course.id ? 'Processing...' : 'Unenroll'}
              </button>
            </div>
          ) : (
            <button
              onClick={() => handleEnroll(course.id)}
              disabled={enrollingCourseId === course.id}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {enrollingCourseId === course.id ? 'Enrolling...' : 'Enroll Now'}
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const renderEnrolledCourseCard = (course: EnrolledCourse) => (
    <div key={course.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden">
      {course.thumbnail_url ? (
        <img
          src={course.thumbnail_url}
          alt={course.title}
          className="w-full h-48 object-cover"
        />
      ) : (
        <div className="w-full h-48 bg-gradient-to-br from-purple-100 to-blue-100 flex flex-col items-center justify-center">
          <BookOpen className="h-12 w-12 text-purple-300 mb-2" />
          <span className="text-xs text-purple-400">No thumbnail</span>
        </div>
      )}
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{course.title}</h3>
            <p className="text-gray-600 text-sm line-clamp-2 mb-3">{course.description}</p>
          </div>
        </div>

        {course.teacher_name && (
          <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
            <User className="h-4 w-4" />
            <span>Instructor: {course.teacher_name}</span>
          </div>
        )}

        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm font-semibold text-purple-600">
              {course.progress_percentage}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-purple-600 h-2 rounded-full transition-all"
              style={{ width: `${course.progress_percentage}%` }}
            />
          </div>
        </div>

        {course.enrollment_status === 'completed' && (
          <div className="flex items-center gap-2 mb-4 text-green-600 text-sm font-medium">
            <CheckCircle className="h-5 w-5" />
            <span>Completed</span>
            {course.certificate_issued && (
              <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                Certificate Issued
              </span>
            )}
          </div>
        )}

        <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>
              Enrolled {new Date(course.enrollment_date).toLocaleDateString()}
            </span>
          </div>
          {course.last_accessed_at && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>
                Last accessed {new Date(course.last_accessed_at).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <button
            onClick={() => window.location.href = `/student/courses/${course.id}/learn`}
            className="flex-1 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors mr-2"
          >
            Continue Learning
          </button>
          <button
            onClick={(e) => handleUnenroll(course.id, e)}
            disabled={enrollingCourseId === course.id}
            className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Unenroll from course"
          >
            <XCircle className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <DashboardLayout role="student">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">My Courses</h1>
        
        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'all'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All Courses ({allCourses.length})
          </button>
          <button
            onClick={() => setActiveTab('enrolled')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'enrolled'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Enrolled Courses ({enrolledCourses.length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      ) : (
        <>
          {/* All Courses Tab */}
          {activeTab === 'all' && (
            <div>
              {filteredAllCourses.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="text-center py-12">
                    <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-xl text-gray-500 mb-2">No courses found</p>
                    <p className="text-gray-400">
                      {searchQuery ? 'Try adjusting your search terms' : 'No courses available at the moment'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredAllCourses.map(renderCourseCard)}
                </div>
              )}
            </div>
          )}

          {/* Enrolled Courses Tab */}
          {activeTab === 'enrolled' && (
            <div>
              {filteredEnrolledCourses.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="text-center py-12">
                    <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-xl text-gray-500 mb-2">No enrolled courses</p>
                    <p className="text-gray-400 mb-6">
                      {searchQuery ? 'Try adjusting your search terms' : 'Browse available courses and start your learning journey'}
                    </p>
                    {!searchQuery && (
                      <button
                        onClick={() => setActiveTab('all')}
                        className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        Browse Courses
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredEnrolledCourses.map(renderEnrolledCourseCard)}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
}