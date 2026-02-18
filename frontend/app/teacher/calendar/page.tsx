'use client';

import DashboardLayout from '@/components/DashboardLayout';
import WeekView from '@/components/calendar/WeekView';

export default function TeacherCalendarPage() {
  return (
    <DashboardLayout role="teacher">
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
        <p className="text-gray-500 mt-1">Your webinars and batch sessions at a glance</p>
      </div>
      <WeekView role="teacher" />
    </DashboardLayout>
  );
}
