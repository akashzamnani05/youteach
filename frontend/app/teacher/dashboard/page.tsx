'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { BookOpen, Users, Video, ExternalLink, Calendar, Clock } from 'lucide-react';
import Link from 'next/link';
import { dashboardApi, TeacherDashboardData } from '@/lib/dashboard';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function formatTime(timeStr: string) {
  // timeStr may be HH:MM or full ISO
  const [h, m] = timeStr.split(':');
  const d = new Date();
  d.setHours(parseInt(h), parseInt(m));
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function formatScheduledAt(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }) + ' · ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export default function TeacherDashboard() {
  const [data, setData] = useState<TeacherDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    dashboardApi.getTeacherDashboard()
      .then(setData)
      .catch((e) => setError(e?.response?.data?.message || 'Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <DashboardLayout role="teacher">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !data) {
    return (
      <DashboardLayout role="teacher">
        <div className="text-center py-16 text-red-500">{error || 'Failed to load dashboard'}</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="teacher">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Courses</p>
              <p className="text-3xl font-bold text-gray-900">{data.stats.totalCourses}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <Link href="/teacher/courses" className="mt-3 text-xs text-blue-600 hover:underline block">
            Manage courses →
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Students</p>
              <p className="text-3xl font-bold text-gray-900">{data.stats.totalStudents}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <Link href="/teacher/students" className="mt-3 text-xs text-green-600 hover:underline block">
            View students →
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Upcoming Webinars</p>
              <p className="text-3xl font-bold text-gray-900">{data.stats.upcomingWebinarsCount}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Video className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <Link href="/teacher/webinars" className="mt-3 text-xs text-purple-600 hover:underline block">
            Manage webinars →
          </Link>
        </div>
      </div>

      {/* Upcoming Webinars */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Video className="h-5 w-5 text-purple-500" />
            Upcoming Webinars
          </h2>
          <Link href="/teacher/webinars" className="text-sm text-purple-600 hover:underline font-medium">
            View all
          </Link>
        </div>

        {data.upcomingWebinars.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <Video className="h-10 w-10 mx-auto mb-2 text-gray-200" />
            <p>No upcoming webinars</p>
            <Link href="/teacher/webinars" className="mt-3 inline-block text-sm text-purple-600 hover:underline">
              Schedule one →
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
                  <p className="text-xs text-gray-400 mt-0.5">{w.registration_count} registered</p>
                </div>
                {w.meeting_link && (
                  <a
                    href={w.meeting_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-4 flex items-center gap-1 px-3 py-1.5 bg-purple-600 text-white text-xs rounded-lg hover:bg-purple-700 transition-colors whitespace-nowrap"
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
          <Link href="/teacher/batches" className="text-sm text-green-600 hover:underline font-medium">
            View all
          </Link>
        </div>

        {data.upcomingBatchSessions.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <Calendar className="h-10 w-10 mx-auto mb-2 text-gray-200" />
            <p>No upcoming batch sessions</p>
            <Link href="/teacher/batches" className="mt-3 inline-block text-sm text-green-600 hover:underline">
              Manage batches →
            </Link>
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
                  <p className="text-xs text-gray-400 mt-0.5">{s.student_count} students</p>
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
