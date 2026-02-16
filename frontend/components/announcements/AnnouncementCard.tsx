// components/announcements/AnnouncementCard.tsx

'use client';

import { useState, useRef, useEffect } from 'react';
import { Megaphone, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { Announcement } from '@/types/announcements.types';

interface AnnouncementCardProps {
  announcement: Announcement;
  showActions?: boolean; // false for student view
  onEdit?: (announcement: Announcement) => void;
  onDelete?: (announcement: Announcement) => void;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AnnouncementCard({
  announcement,
  showActions = false,
  onEdit,
  onDelete,
}: AnnouncementCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between gap-4">
        {/* Icon + content */}
        <div className="flex items-start space-x-3 flex-1 min-w-0">
          <div className="flex-shrink-0 w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center mt-0.5">
            <Megaphone className="h-5 w-5 text-blue-600" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-gray-900 leading-snug">
              {announcement.title}
            </h3>
            <p className="mt-1.5 text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
              {announcement.description}
            </p>
            <p className="mt-3 text-xs text-gray-400">
              {formatDate(announcement.created_at)}
              {announcement.updated_at !== announcement.created_at && ' · edited'}
            </p>
          </div>
        </div>

        {/* Actions menu — teacher only */}
        {showActions && (
          <div className="relative flex-shrink-0" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-8 z-10 bg-white border border-gray-200 rounded-lg shadow-md py-1 w-36">
                <button
                  onClick={() => { setMenuOpen(false); onEdit?.(announcement); }}
                  className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Pencil className="h-4 w-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => { setMenuOpen(false); onDelete?.(announcement); }}
                  className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
