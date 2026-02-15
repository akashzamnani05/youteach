// app/student/settings/page.tsx

'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { User, Bell, Lock } from 'lucide-react';

export default function StudentSettings() {
  return (
    <DashboardLayout role="student">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Settings</h1>

      <div className="grid gap-6">
        {/* Profile Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-3 mb-4">
            <User className="h-6 w-6 text-purple-600" />
            <h2 className="text-xl font-bold text-gray-900">Profile Settings</h2>
          </div>
          <p className="text-gray-600">Manage your profile information and preferences</p>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Bell className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
          </div>
          <p className="text-gray-600">Configure your notification preferences</p>
        </div>

        {/* Security */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Lock className="h-6 w-6 text-green-600" />
            <h2 className="text-xl font-bold text-gray-900">Security</h2>
          </div>
          <p className="text-gray-600">Update your password and security settings</p>
        </div>
      </div>
    </DashboardLayout>
  );
}