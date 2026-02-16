'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Users, BookOpen, Clock, Loader2, Layers } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import CreateBatchModal from '@/components/batches/CreateBatchModal';
import { batchesApi } from '@/lib/batches';
import { Batch } from '@/types/batches.types';

function formatTime(time: string) {
  // time is HH:MM or HH:MM:SS
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
}

export default function TeacherBatchesPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = await batchesApi.getBatches();
      setBatches(data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to load batches');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <DashboardLayout role="teacher">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Batches</h1>
          <p className="text-gray-500 mt-1">Manage your live teaching groups</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          <span>New Batch</span>
        </button>
      </div>

      {/* Stats chip */}
      {!loading && !error && (
        <div className="mb-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium">
            <Layers className="h-4 w-4 mr-1.5" />
            {batches.length} {batches.length === 1 ? 'batch' : 'batches'}
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
          <button onClick={load} className="mt-2 text-sm text-blue-600 hover:underline">Retry</button>
        </div>
      ) : batches.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
          <Layers className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">No batches yet</p>
          <p className="text-sm text-gray-400 mt-1">Click "New Batch" to create your first live teaching group</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {batches.map((batch) => (
            <Link
              key={batch.id}
              href={`/teacher/batches/${batch.id}`}
              className="bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all group"
            >
              <div className="mb-3">
                <h2 className="text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {batch.name}
                </h2>
                {batch.description && (
                  <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{batch.description}</p>
                )}
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {formatTime(batch.class_time)} · {batch.duration_minutes}m
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {batch.student_count ?? 0} students
                </span>
                <span className="flex items-center gap-1">
                  <BookOpen className="h-3.5 w-3.5" />
                  {batch.session_count ?? 0} sessions
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {showCreate && (
        <CreateBatchModal
          onClose={() => setShowCreate(false)}
          onCreated={load}
        />
      )}
    </DashboardLayout>
  );
}
