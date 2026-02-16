'use client';

import { useEffect, useState } from 'react';
import { Clock, Users, Video, Loader2, Layers } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { batchesApi } from '@/lib/batches';
import { Batch } from '@/types/batches.types';

function formatTime(time: string) {
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
}

// MySQL DATE columns may arrive as full ISO strings ("2026-02-16T00:00:00.000Z")
// — always take just the YYYY-MM-DD prefix.
function nd(val: string): string {
  return val.substring(0, 10);
}

function formatDate(dateStr: string) {
  return new Date(nd(dateStr) + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  });
}

/** Returns true if current time is within [sessionStart - 10min, sessionStart + durationMinutes] */
function canJoinNow(sessionDate: string, classTime: string, durationMinutes: number): boolean {
  const [h, m] = classTime.split(':').map(Number);
  const sessionStart = new Date(nd(sessionDate) + 'T00:00:00');
  sessionStart.setHours(h, m, 0, 0);
  const joinFrom = new Date(sessionStart.getTime() - 10 * 60 * 1000);
  const sessionEnd = new Date(sessionStart.getTime() + durationMinutes * 60 * 1000);
  const now = new Date();
  return now >= joinFrom && now <= sessionEnd;
}

/** Returns minutes until join window opens (negative = join window passed) */
function minutesUntilJoin(sessionDate: string, classTime: string): number {
  const [h, m] = classTime.split(':').map(Number);
  const sessionStart = new Date(nd(sessionDate) + 'T00:00:00');
  sessionStart.setHours(h, m, 0, 0);
  const joinFrom = new Date(sessionStart.getTime() - 10 * 60 * 1000);
  return Math.round((joinFrom.getTime() - Date.now()) / 60000);
}

export default function StudentBatchesPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [, setTick] = useState(0);

  useEffect(() => {
    batchesApi
      .getBatches()
      .then(setBatches)
      .catch((err) => setError(err.response?.data?.message || err.message || 'Failed to load batches'))
      .finally(() => setLoading(false));
  }, []);

  // Re-render every minute so the join button state stays current
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(timer);
  }, []);

  const today = new Date().toISOString().split('T')[0];

  return (
    <DashboardLayout role="student">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Batches</h1>
        <p className="text-gray-500 mt-1">Live sessions with your teacher</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-500">
          <p className="text-sm">{error}</p>
        </div>
      ) : batches.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
          <Layers className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">No batches yet</p>
          <p className="text-sm text-gray-400 mt-1">Your teacher hasn't added you to any batch yet</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {batches.map((batch) => {
            // Normalise and discard past dates — the backend may return a stale date
            // (e.g. due to server/DB timezone offsets); the browser's "today" is authoritative.
            const rawNext = batch.next_session_date ? nd(batch.next_session_date) : null;
            const nextDate = rawNext && rawNext >= today ? rawNext : null;
            const joinable = nextDate
              ? canJoinNow(nextDate, batch.class_time, batch.duration_minutes)
              : false;
            const minsUntil = nextDate && !joinable ? minutesUntilJoin(nextDate, batch.class_time) : null;
            const sessionIsToday = nextDate === today;

            return (
              <div key={batch.id} className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-4">
                {/* Info */}
                <div>
                  <h2 className="text-base font-semibold text-gray-900">{batch.name}</h2>
                  {batch.teacher_name && (
                    <p className="text-sm text-gray-500 mt-0.5">by {batch.teacher_name}</p>
                  )}
                  {batch.description && (
                    <p className="text-sm text-gray-400 mt-1 line-clamp-2">{batch.description}</p>
                  )}
                </div>

                {/* Details */}
                <div className="flex flex-col gap-1.5 text-sm text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-gray-400" />
                    {formatTime(batch.class_time)} · {batch.duration_minutes} min
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-gray-400" />
                    {batch.student_count ?? 0} students
                  </span>
                </div>

                {/* Next session + join */}
                <div className="border-t border-gray-100 pt-3">
                  {!nextDate ? (
                    <p className="text-xs text-gray-400">No upcoming sessions</p>
                  ) : joinable ? (
                    <>
                      <p className="text-xs font-medium text-green-600 mb-2">
                        Class is live now{sessionIsToday ? '' : ` · ${formatDate(nextDate)}`}
                      </p>
                      <a
                        href={batch.meeting_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 w-full justify-center"
                      >
                        <Video className="h-4 w-4" />
                        Join Now
                      </a>
                    </>
                  ) : (
                    <>
                      <p className="text-xs text-gray-500 mb-2">
                        Next:{' '}
                        <span className="font-medium text-gray-700">
                          {formatDate(nextDate)} at {formatTime(batch.class_time)}
                        </span>
                        {sessionIsToday && ' · Today'}
                      </p>
                      {minsUntil !== null && minsUntil > 0 && minsUntil <= 1440 && (
                        <p className="text-xs text-gray-400 mb-2">
                          Join link opens in {minsUntil >= 60
                            ? `${Math.floor(minsUntil / 60)}h ${minsUntil % 60}m`
                            : `${minsUntil}m`}
                        </p>
                      )}
                      <button
                        disabled
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-gray-400 text-sm font-medium rounded-lg w-full justify-center cursor-not-allowed"
                      >
                        <Video className="h-4 w-4" />
                        Join Meeting
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
