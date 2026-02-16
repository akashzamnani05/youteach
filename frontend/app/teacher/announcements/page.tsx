'use client';

import { useEffect, useState } from 'react';
import { Plus, Megaphone, Loader2 } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import AnnouncementCard from '@/components/announcements/AnnouncementCard';
import AnnouncementModal from '@/components/announcements/AnnouncementModal';
import { announcementsApi } from '@/lib/announcements';
import { Announcement } from '@/types/announcements.types';

export default function TeacherAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);

  async function loadAnnouncements() {
    setLoading(true);
    setError('');
    try {
      const data = await announcementsApi.getAnnouncements();
      setAnnouncements(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load announcements');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadAnnouncements(); }, []);

  function openCreate() {
    setEditingAnnouncement(null);
    setShowModal(true);
  }

  function openEdit(announcement: Announcement) {
    setEditingAnnouncement(announcement);
    setShowModal(true);
  }

  async function handleConfirm(title: string, description: string) {
    if (editingAnnouncement) {
      await announcementsApi.updateAnnouncement(editingAnnouncement.id, title, description);
    } else {
      await announcementsApi.createAnnouncement(title, description);
    }
    await loadAnnouncements();
  }

  async function handleDelete(announcement: Announcement) {
    if (!confirm(`Delete "${announcement.title}"? This cannot be undone.`)) return;
    try {
      await announcementsApi.deleteAnnouncement(announcement.id);
      await loadAnnouncements();
    } catch (err: any) {
      alert(err.message || 'Failed to delete announcement');
    }
  }

  return (
    <DashboardLayout role="teacher">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Announcements</h1>
          <p className="text-gray-500 mt-1">
            Post updates visible to all your enrolled students
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          <span>New Announcement</span>
        </button>
      </div>

      {/* Stats chip */}
      {!loading && !error && (
        <div className="mb-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium">
            <Megaphone className="h-4 w-4 mr-1.5" />
            {announcements.length} {announcements.length === 1 ? 'announcement' : 'announcements'}
          </span>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-500">
          <p className="text-sm">{error}</p>
          <button
            onClick={loadAnnouncements}
            className="mt-2 text-sm text-blue-600 hover:underline"
          >
            Retry
          </button>
        </div>
      ) : announcements.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
          <Megaphone className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">No announcements yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Click "New Announcement" to post your first update
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map((a) => (
            <AnnouncementCard
              key={a.id}
              announcement={a}
              showActions
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <AnnouncementModal
          announcement={editingAnnouncement}
          onClose={() => setShowModal(false)}
          onConfirm={handleConfirm}
        />
      )}
    </DashboardLayout>
  );
}
