'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Loader2, Save, Users, CheckCircle, XCircle, Clock,
  CalendarDays, Timer, BarChart3,
} from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { batchesApi } from '@/lib/batches';
import { Batch, BatchSession, AttendanceRecord } from '@/types/batches.types';

type Tab = 'details' | 'attendance';
type Status = 'present' | 'absent' | 'late';

const STATUS_CONFIG: Record<Status, { label: string; className: string }> = {
  present: { label: 'P', className: 'bg-green-100 text-green-700 border-green-300' },
  absent:  { label: 'A', className: 'bg-red-100 text-red-700 border-red-300' },
  late:    { label: 'L', className: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
};

function nd(val: string): string { return val.substring(0, 10); }

function formatDate(dateStr: string) {
  return new Date(nd(dateStr) + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
}

function formatTime(time: string) {
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
}

export default function SessionDetailPage() {
  const { id, sessionId } = useParams<{ id: string; sessionId: string }>();

  const [session, setSession] = useState<BatchSession | null>(null);
  const [batch, setBatch] = useState<Batch | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [localStatus, setLocalStatus] = useState<Record<string, Status>>({});
  const [activeTab, setActiveTab] = useState<Tab>('details');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    batchesApi
      .getSessionDetails(sessionId)
      .then(({ session, batch, attendance }) => {
        setSession(session);
        setBatch(batch);
        setAttendance(attendance);
        const initial: Record<string, Status> = {};
        for (const r of attendance) {
          initial[r.student_user_id] = r.status as Status;
        }
        setLocalStatus(initial);
      })
      .catch((err) => setError(err.response?.data?.message || err.message || 'Failed to load'))
      .finally(() => setLoading(false));
  }, [sessionId]);

  function setStatus(studentUserId: string, status: Status) {
    setSaved(false);
    setLocalStatus((prev) => ({ ...prev, [studentUserId]: status }));
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    setError('');
    try {
      const records = Object.entries(localStatus).map(([student_user_id, status]) => ({
        student_user_id,
        status,
      }));
      await batchesApi.markAttendance(sessionId, records);
      setSaved(true);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  const totalStudents = attendance.length;
  const presentCount  = Object.values(localStatus).filter((s) => s === 'present').length;
  const lateCount     = Object.values(localStatus).filter((s) => s === 'late').length;
  const absentCount   = Object.values(localStatus).filter((s) => s === 'absent').length;
  const attendanceRate = totalStudents > 0
    ? Math.round(((presentCount + lateCount) / totalStudents) * 100)
    : 0;

  return (
    <DashboardLayout role="teacher">
      {/* Back */}
      <Link
        href={`/teacher/batches/${id}`}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-5"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to {batch?.name ?? 'Batch'}
      </Link>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
        </div>
      ) : error && !session ? (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-500">
          <p className="text-sm">{error}</p>
        </div>
      ) : session && batch ? (
        <div className="space-y-5">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Session Details</h1>
            <p className="text-gray-500 mt-0.5">
              {formatDate(session.session_date)} · {batch.name}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('details')}
              className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'details'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              Details
            </button>
            <button
              onClick={() => setActiveTab('attendance')}
              className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'attendance'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              Attendance
            </button>
          </div>

          {/* ── Tab: Details ── */}
          {activeTab === 'details' && (
            <div className="space-y-5">
              {/* Session info card */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                  Session Info
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <CalendarDays className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Date</p>
                      <p className="text-sm font-medium text-gray-800">{formatDate(session.session_date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-50 rounded-lg">
                      <Clock className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Class Time</p>
                      <p className="text-sm font-medium text-gray-800">{formatTime(batch.class_time)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-50 rounded-lg">
                      <Timer className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Duration</p>
                      <p className="text-sm font-medium text-gray-800">{batch.duration_minutes} minutes</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-50 rounded-lg">
                      <Users className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Total Students</p>
                      <p className="text-sm font-medium text-gray-800">{totalStudents}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Attendance stats card */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                  Attendance Summary
                </h2>

                {totalStudents === 0 ? (
                  <p className="text-sm text-gray-400">No students in this batch yet.</p>
                ) : (
                  <>
                    {/* Attendance rate bar */}
                    <div className="mb-5">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm text-gray-600 flex items-center gap-1.5">
                          <BarChart3 className="h-4 w-4 text-gray-400" />
                          Attendance Rate
                        </span>
                        <span className="text-sm font-semibold text-gray-800">{attendanceRate}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full transition-all ${
                            attendanceRate >= 75 ? 'bg-green-500' : attendanceRate >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${attendanceRate}%` }}
                        />
                      </div>
                    </div>

                    {/* Stat cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="bg-gray-50 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-gray-800">{totalStudents}</p>
                        <p className="text-xs text-gray-500 mt-0.5">Total</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-green-700">{presentCount}</p>
                        <p className="text-xs text-green-600 mt-0.5">Present</p>
                      </div>
                      <div className="bg-yellow-50 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-yellow-700">{lateCount}</p>
                        <p className="text-xs text-yellow-600 mt-0.5">Late</p>
                      </div>
                      <div className="bg-red-50 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-red-700">{absentCount}</p>
                        <p className="text-xs text-red-600 mt-0.5">Absent</p>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Quick link to attendance tab */}
              {totalStudents > 0 && (
                <button
                  onClick={() => setActiveTab('attendance')}
                  className="text-sm text-blue-600 hover:underline font-medium"
                >
                  Mark / edit attendance →
                </button>
              )}
            </div>
          )}

          {/* ── Tab: Attendance ── */}
          {activeTab === 'attendance' && (
            <div className="space-y-4">
              {/* Quick stats row */}
              <div className="flex gap-3">
                {[
                  { label: 'Present', count: presentCount, color: 'bg-green-50 text-green-700' },
                  { label: 'Late',    count: lateCount,    color: 'bg-yellow-50 text-yellow-700' },
                  { label: 'Absent',  count: absentCount,  color: 'bg-red-50 text-red-700' },
                ].map((s) => (
                  <div key={s.label} className={`px-4 py-2 rounded-lg text-sm font-medium ${s.color}`}>
                    {s.label}: {s.count}
                  </div>
                ))}
              </div>

              {/* Table */}
              {attendance.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
                  <p className="text-gray-500 text-sm">No students in this batch yet.</p>
                </div>
              ) : (
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                  <div className="divide-y divide-gray-100">
                    {attendance.map((record) => {
                      const current = localStatus[record.student_user_id] ?? 'absent';
                      return (
                        <div key={record.student_user_id} className="flex items-center justify-between px-4 py-3">
                          <div>
                            <p className="text-sm font-medium text-gray-800">{record.full_name}</p>
                            <p className="text-xs text-gray-400">{record.email}</p>
                          </div>
                          <div className="flex gap-1.5">
                            {(['present', 'absent', 'late'] as Status[]).map((status) => (
                              <button
                                key={status}
                                onClick={() => setStatus(record.student_user_id, status)}
                                className={`w-8 h-8 rounded-md text-xs font-bold border transition-all ${
                                  current === status
                                    ? STATUS_CONFIG[status].className + ' shadow-sm'
                                    : 'bg-gray-50 text-gray-400 border-gray-200 hover:border-gray-400'
                                }`}
                              >
                                {STATUS_CONFIG[status].label}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Error */}
              {error && <p className="text-sm text-red-600">{error}</p>}

              {/* Save button */}
              {attendance.length > 0 && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save Attendance
                  </button>
                  {saved && (
                    <span className="text-sm text-green-600 font-medium">Saved successfully</span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      ) : null}
    </DashboardLayout>
  );
}
