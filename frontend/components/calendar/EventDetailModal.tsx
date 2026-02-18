'use client';

import { X, Video, Layers, ExternalLink, Clock, CalendarDays } from 'lucide-react';
import { CalendarEvent } from '@/types/calendar.types';

interface Props {
  event: CalendarEvent;
  role: 'teacher' | 'student';
  onClose: () => void;
}

function formatTime(t: string) {
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
}

function formatDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
}

function canJoinNow(date: string, startTime: string, durationMinutes: number): boolean {
  const [h, m] = startTime.split(':').map(Number);
  const sessionStart = new Date(date + 'T00:00:00');
  sessionStart.setHours(h, m, 0, 0);
  const joinFrom = new Date(sessionStart.getTime() - 10 * 60 * 1000);
  const sessionEnd = new Date(sessionStart.getTime() + durationMinutes * 60 * 1000);
  const now = new Date();
  return now >= joinFrom && now <= sessionEnd;
}

export default function EventDetailModal({ event, role, onClose }: Props) {
  const isWebinar = event.type === 'webinar';
  const joinable = event.meeting_link
    ? (isWebinar || canJoinNow(event.date, event.start_time, event.duration_minutes))
    : false;

  const endH = Math.floor((parseInt(event.start_time.split(':')[0]) * 60 + parseInt(event.start_time.split(':')[1]) + event.duration_minutes) / 60);
  const endM = (parseInt(event.start_time.split(':')[0]) * 60 + parseInt(event.start_time.split(':')[1]) + event.duration_minutes) % 60;
  const endTime = `${endH}:${endM.toString().padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 rounded-t-xl ${
          isWebinar ? 'bg-blue-50' : 'bg-green-50'
        }`}>
          <div className="flex items-center gap-2 min-w-0">
            {isWebinar
              ? <Video className="h-5 w-5 text-blue-600 shrink-0" />
              : <Layers className="h-5 w-5 text-green-600 shrink-0" />}
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-gray-900 truncate">{event.title}</h2>
              <span className={`text-xs font-medium ${isWebinar ? 'text-blue-600' : 'text-green-600'}`}>
                {isWebinar ? 'Webinar' : 'Batch Session'}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-white/60">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-3">
          {event.description && (
            <p className="text-sm text-gray-600">{event.description}</p>
          )}

          <div className="flex items-center gap-2 text-sm text-gray-700">
            <CalendarDays className="h-4 w-4 text-gray-400" />
            {formatDate(event.date)}
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Clock className="h-4 w-4 text-gray-400" />
            {formatTime(event.start_time)} – {formatTime(endTime)} ({event.duration_minutes} min)
          </div>

          {event.teacher_name && role === 'student' && (
            <p className="text-sm text-gray-500">Teacher: <span className="font-medium text-gray-700">{event.teacher_name}</span></p>
          )}

          {event.batch_name && event.type === 'batch_session' && (
            <p className="text-sm text-gray-500">Batch: <span className="font-medium text-gray-700">{event.batch_name}</span></p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Close
          </button>

          {event.meeting_link && (
            joinable ? (
              <a
                href={event.meeting_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700"
              >
                <ExternalLink className="h-4 w-4" />
                Join Now
              </a>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-gray-400 text-sm font-medium rounded-lg cursor-not-allowed">
                <ExternalLink className="h-4 w-4" />
                {isWebinar ? 'Meeting Link' : 'Join (10 min before)'}
              </span>
            )
          )}
        </div>
      </div>
    </div>
  );
}
