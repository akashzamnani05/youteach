// app/teacher/dashboard/page.tsx

'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { BookOpen, Users, Video, DollarSign } from 'lucide-react';
import Link from 'next/link';

export default function TeacherDashboard() {
  return (
    <DashboardLayout role="teacher">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Courses */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Courses</p>
              <p className="text-3xl font-bold text-gray-900">0</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Total Students */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Students</p>
              <p className="text-3xl font-bold text-gray-900">0</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Webinars */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Webinars</p>
              <p className="text-3xl font-bold text-gray-900">0</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Video className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Earnings */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Earnings</p>
              <p className="text-3xl font-bold text-gray-900">$0</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/teacher/courses"
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
            >
              <BookOpen className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="font-medium text-gray-700">Create New Course</p>
            </Link>

            <Link
              href="/teacher/webinars"
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors text-center"
            >
              <Video className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="font-medium text-gray-700">Schedule Webinar</p>
            </Link>

            <Link
              href="/teacher/students"
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-center"
            >
              <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="font-medium text-gray-700">Manage Students</p>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No activity yet</p>
            <p className="text-sm text-gray-400 mt-2">
              Start by creating your first course or scheduling a webinar
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}