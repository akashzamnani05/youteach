'use client';

import DashboardLayout from '@/components/DashboardLayout';
import WeekView from '@/components/calendar/WeekView';

export default function StudentCalendarPage() {
  return (
    <DashboardLayout role="student">
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
        <p className="text-gray-500 mt-1">Your upcoming webinars and batch sessions</p>
      </div>
      <WeekView role="student" />
    </DashboardLayout>
  );
}
