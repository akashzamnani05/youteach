'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { BookOpen, Video, ExternalLink, Calendar, Clock, ArrowRight, User } from 'lucide-react';
import Link from 'next/link';
import { dashboardApi, StudentDashboardData } from '@/lib/dashboard';

function formatScheduledAt(iso: string) {
  const d = new Date(iso);
  return (
    d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) +
    ' · ' +
    d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  );
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function formatTime(timeStr: string) {
  const [h, m] = timeStr.split(':');
  const d = new Date();
  d.setHours(parseInt(h), parseInt(m));
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export default function StudentDashboard() {
  const [data, setData] = useState<StudentDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    dashboardApi.getStudentDashboard()
      .then(setData)
      .catch((e) => setError(e?.response?.data?.message || 'Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <DashboardLayout role="student">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !data) {
    return (
      <DashboardLayout role="student">
        <div className="text-center py-16 text-red-500">{error || 'Failed to load dashboard'}</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="student">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Enrolled Courses</p>
              <p className="text-3xl font-bold text-gray-900">{data.stats.enrolledCourses}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <Link href="/student/courses" className="mt-3 text-xs text-purple-600 hover:underline block">
            View all courses →
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Upcoming Webinars</p>
              <p className="text-3xl font-bold text-gray-900">{data.stats.upcomingWebinarsCount}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Video className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <Link href="/student/webinars" className="mt-3 text-xs text-blue-600 hover:underline block">
            View all webinars →
          </Link>
        </div>
      </div>

      {/* My Courses — direct jump with progress */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-purple-500" />
            My Courses
          </h2>
          <Link href="/student/courses" className="text-sm text-purple-600 hover:underline font-medium">
            View all
          </Link>
        </div>

        {data.enrolledCourses.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <BookOpen className="h-10 w-10 mx-auto mb-2 text-gray-200" />
            <p>You haven't enrolled in any courses yet</p>
            <Link
              href="/student/courses"
              className="mt-3 inline-block px-5 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
            >
              Browse Courses
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {data.enrolledCourses.map((course) => (
              <Link
                key={course.id}
                href={`/student/courses/${course.id}/learn`}
                className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors group"
              >
                {/* Thumbnail */}
                <div className="w-16 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-purple-100 flex items-center justify-center">
                  {course.thumbnail_url ? (
                    <img
                      src={course.thumbnail_url}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <BookOpen className="h-6 w-6 text-purple-400" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate group-hover:text-purple-700 transition-colors">
                    {course.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {course.teacher_name}
                  </p>
                  {/* Progress bar */}
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                      <div
                        className="bg-purple-500 h-1.5 rounded-full transition-all"
                        style={{ width: `${Math.min(course.progress_percentage, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {Math.round(course.progress_percentage)}%
                    </span>
                  </div>
                </div>

                <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-purple-500 transition-colors flex-shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming Webinars */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Video className="h-5 w-5 text-blue-500" />
            Upcoming Webinars
          </h2>
          <Link href="/student/webinars" className="text-sm text-blue-600 hover:underline font-medium">
            View all
          </Link>
        </div>

        {data.upcomingWebinars.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <Video className="h-10 w-10 mx-auto mb-2 text-gray-200" />
            <p>No upcoming webinars</p>
            <Link href="/student/webinars" className="mt-3 inline-block text-sm text-blue-600 hover:underline">
              Browse webinars →
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {data.upcomingWebinars.map((w) => (
              <div key={w.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{w.title}</p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {formatScheduledAt(w.scheduled_at)} · {w.duration_minutes} min
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {w.teacher_name}
                  </p>
                </div>
                {w.meeting_link && (
                  <a
                    href={w.meeting_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-4 flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Join
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming Batch Sessions */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-green-500" />
            Upcoming Batch Sessions
          </h2>
          <Link href="/student/batches" className="text-sm text-green-600 hover:underline font-medium">
            View all
          </Link>
        </div>

        {data.upcomingBatchSessions.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <Calendar className="h-10 w-10 mx-auto mb-2 text-gray-200" />
            <p>No upcoming batch sessions</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {data.upcomingBatchSessions.map((s) => (
              <div key={s.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{s.batch_name}</p>
                  <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-2">
                    <span>{formatDate(s.session_date)}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {formatTime(s.class_time)}
                    </span>
                    <span>·</span>
                    <span>{s.duration_minutes} min</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {s.teacher_name}
                  </p>
                </div>
                <a
                  href={s.meeting_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-4 flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Join
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
