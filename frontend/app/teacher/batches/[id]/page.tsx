'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Pencil, Trash2, Users, Plus, CalendarDays, Clock, Loader2, ExternalLink, X,
} from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import EditBatchModal from '@/components/batches/EditBatchModal';
import ManageStudentsModal from '@/components/batches/ManageStudentsModal';
import AddSessionsModal from '@/components/batches/AddSessionsModal';
import { batchesApi } from '@/lib/batches';
import { Batch, BatchSession } from '@/types/batches.types';

// MySQL DATE columns may arrive as full ISO strings ("2026-02-16T00:00:00.000Z")
// — always take just the YYYY-MM-DD prefix before any further processing.
function d(val: string): string {
  return val.substring(0, 10);
}

function formatTime(time: string) {
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
}

function formatDate(dateStr: string) {
  return new Date(d(dateStr) + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
  });
}

function isToday(dateStr: string) {
  return new Date().toISOString().split('T')[0] === d(dateStr);
}

export default function TeacherBatchDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [batch, setBatch] = useState<Batch | null>(null);
  const [sessions, setSessions] = useState<BatchSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showEdit, setShowEdit] = useState(false);
  const [showStudents, setShowStudents] = useState(false);
  const [showAddSessions, setShowAddSessions] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const [batchData, sessionsData] = await Promise.all([
        batchesApi.getBatch(id),
        batchesApi.getBatchSessions(id),
      ]);
      setBatch(batchData);
      setSessions(sessionsData);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to load batch');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [id]);

  async function handleDelete() {
    if (!batch) return;
    if (!confirm(`Delete batch "${batch.name}"? All sessions and attendance records will be lost.`)) return;
    setDeleting(true);
    try {
      await batchesApi.deleteBatch(id);
      router.push('/teacher/batches');
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Failed to delete batch');
      setDeleting(false);
    }
  }

  async function handleDeleteSession(sessionId: string, dateLabel: string) {
    if (!confirm(`Delete session on ${dateLabel}? Attendance records for this session will also be lost.`)) return;
    setDeletingSessionId(sessionId);
    try {
      await batchesApi.deleteSession(sessionId);
      await load();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Failed to delete session');
    } finally {
      setDeletingSessionId(null);
    }
  }

  const today = new Date().toISOString().split('T')[0];
  const upcomingSessions = sessions.filter((s) => d(s.session_date) >= today);
  const pastSessions = sessions.filter((s) => d(s.session_date) < today);

  return (
    <DashboardLayout role="teacher">
      {/* Back */}
      <Link href="/teacher/batches" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-5">
        <ArrowLeft className="h-4 w-4" /> Back to Batches
      </Link>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-500">
          <p className="text-sm">{error}</p>
        </div>
      ) : batch ? (
        <div className="space-y-6">
          {/* Header card */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-gray-900">{batch.name}</h1>
                {batch.description && (
                  <p className="text-gray-500 mt-1">{batch.description}</p>
                )}
                <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-3 text-sm text-gray-600">
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-gray-400" />
                    {formatTime(batch.class_time)} · {batch.duration_minutes} min
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-gray-400" />
                    {batch.student_count ?? 0} students
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CalendarDays className="h-4 w-4 text-gray-400" />
                    {sessions.length} sessions
                  </span>
                </div>
                <a
                  href={batch.meeting_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-3 text-sm text-blue-600 hover:underline"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Open Meeting Link
                </a>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setShowEdit(true)}
                  className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 border border-gray-200"
                  title="Edit batch"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="p-2 rounded-lg text-red-500 hover:bg-red-50 border border-red-200 disabled:opacity-50"
                  title="Delete batch"
                >
                  {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Students */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-900">Students</h2>
              <button
                onClick={() => setShowStudents(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50"
              >
                <Users className="h-3.5 w-3.5" />
                Manage Students
              </button>
            </div>
            <p className="text-sm text-gray-500">
              {batch.student_count ?? 0} student{(batch.student_count ?? 0) !== 1 ? 's' : ''} enrolled in this batch.
              Click "Manage Students" to add or remove students.
            </p>
          </div>

          {/* Sessions */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-900">Sessions</h2>
              <button
                onClick={() => setShowAddSessions(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Sessions
              </button>
            </div>

            {sessions.length === 0 ? (
              <p className="text-sm text-gray-400">No sessions yet. Click "Add Sessions" to schedule classes.</p>
            ) : (
              <div className="space-y-4">
                {/* Upcoming */}
                {upcomingSessions.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Upcoming</p>
                    <div className="divide-y divide-gray-100 border border-gray-200 rounded-lg overflow-hidden">
                      {upcomingSessions.map((session) => (
                        <div
                          key={session.id}
                          className={`flex items-center justify-between px-4 py-3 ${
                            isToday(session.session_date) ? 'bg-blue-50' : 'hover:bg-gray-50'
                          }`}
                        >
                          <div>
                            <span className="text-sm font-medium text-gray-800">
                              {formatDate(session.session_date)}
                            </span>
                            {isToday(session.session_date) && (
                              <span className="ml-2 px-1.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                                Today
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <Link
                              href={`/teacher/batches/${id}/sessions/${session.id}`}
                              className="text-sm text-blue-600 hover:underline font-medium"
                            >
                              Take Attendance →
                            </Link>
                            <button
                              onClick={() => handleDeleteSession(session.id, formatDate(session.session_date))}
                              disabled={deletingSessionId === session.id}
                              className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 disabled:opacity-40"
                              title="Delete session"
                            >
                              {deletingSessionId === session.id
                                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                : <X className="h-3.5 w-3.5" />}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Past */}
                {pastSessions.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Past</p>
                    <div className="divide-y divide-gray-100 border border-gray-200 rounded-lg overflow-hidden">
                      {[...pastSessions].reverse().map((session) => (
                        <div
                          key={session.id}
                          className="flex items-center justify-between px-4 py-3 hover:bg-gray-50"
                        >
                          <span className="text-sm text-gray-600">{formatDate(session.session_date)}</span>
                          <div className="flex items-center gap-3">
                            <Link
                              href={`/teacher/batches/${id}/sessions/${session.id}`}
                              className="text-sm text-blue-600 hover:underline font-medium"
                            >
                              View Attendance →
                            </Link>
                            <button
                              onClick={() => handleDeleteSession(session.id, formatDate(session.session_date))}
                              disabled={deletingSessionId === session.id}
                              className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 disabled:opacity-40"
                              title="Delete session"
                            >
                              {deletingSessionId === session.id
                                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                : <X className="h-3.5 w-3.5" />}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* Modals */}
      {showEdit && batch && (
        <EditBatchModal
          batch={batch}
          onClose={() => setShowEdit(false)}
          onUpdated={load}
        />
      )}
      {showStudents && batch && (
        <ManageStudentsModal
          batchId={id}
          batchName={batch.name}
          onClose={() => { setShowStudents(false); load(); }}
        />
      )}
      {showAddSessions && batch && (
        <AddSessionsModal
          batchId={id}
          batchName={batch.name}
          onClose={() => setShowAddSessions(false)}
          onAdded={load}
        />
      )}
    </DashboardLayout>
  );
}
