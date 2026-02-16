'use client';

import { useEffect, useState } from 'react';
import { Megaphone, Loader2 } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import AnnouncementCard from '@/components/announcements/AnnouncementCard';
import { announcementsApi } from '@/lib/announcements';
import { Announcement } from '@/types/announcements.types';

export default function StudentAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    announcementsApi
      .getAnnouncements()
      .then(setAnnouncements)
      .catch((err: any) => setError(err.message || 'Failed to load announcements'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout role="student">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Announcements</h1>
        <p className="text-gray-500 mt-1">Updates from your teacher</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-500">
          <p className="text-sm">{error}</p>
        </div>
      ) : announcements.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
          <Megaphone className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">No announcements yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Your teacher hasn't posted anything yet — check back later
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map((a) => (
            <AnnouncementCard
              key={a.id}
              announcement={a}
              showActions={false}
            />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
