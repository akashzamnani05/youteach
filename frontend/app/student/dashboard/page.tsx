// app/student/dashboard/page.tsx

'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { BookOpen, GraduationCap, Video, Clock } from 'lucide-react';
import Link from 'next/link';

export default function StudentDashboard() {
  return (
    <DashboardLayout role="student">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Enrolled Courses */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Enrolled Courses</p>
              <p className="text-3xl font-bold text-gray-900">0</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Completed */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-3xl font-bold text-gray-900">0</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <GraduationCap className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Upcoming Webinars */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Upcoming Webinars</p>
              <p className="text-3xl font-bold text-gray-900">0</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Video className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Hours Learned */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Hours Learned</p>
              <p className="text-3xl font-bold text-gray-900">0</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Continue Learning */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Continue Learning</h2>
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No courses in progress</p>
            <p className="text-sm text-gray-400 mt-2">
              Browse and enroll in courses to start learning
            </p>
            <Link
              href="/student/courses"
              className="mt-4 inline-block px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Browse Courses
            </Link>
          </div>
        </div>
      </div>

      {/* Upcoming Webinars */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Upcoming Webinars</h2>
            <Link
              href="/student/webinars"
              className="text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              View All
            </Link>
          </div>
          <div className="text-center py-12">
            <Video className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No upcoming webinars</p>
            <p className="text-sm text-gray-400 mt-2">
              Registered webinars will appear here
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}