'use client';

import { useEffect, useState } from 'react';
import { X, Loader2, UserPlus, UserMinus } from 'lucide-react';
import { batchesApi } from '@/lib/batches';
import { BatchStudent, TeacherStudent } from '@/types/batches.types';

interface Props {
  batchId: string;
  batchName: string;
  onClose: () => void;
}

export default function ManageStudentsModal({ batchId, batchName, onClose }: Props) {
  const [enrolled, setEnrolled] = useState<BatchStudent[]>([]);
  const [available, setAvailable] = useState<TeacherStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    try {
      const [batchStudents, allStudents] = await Promise.all([
        batchesApi.getBatchStudents(batchId),
        batchesApi.getTeacherStudents(),
      ]);
      setEnrolled(batchStudents);
      const enrolledIds = new Set(batchStudents.map((s) => s.student_user_id));
      setAvailable(allStudents.filter((s) => !enrolledIds.has(s.user_id)));
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleAdd(studentUserId: string) {
    setActionId(studentUserId);
    setError('');
    try {
      await batchesApi.addStudent(batchId, studentUserId);
      await load();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to add student');
    } finally {
      setActionId(null);
    }
  }

  async function handleRemove(studentUserId: string) {
    setActionId(studentUserId);
    setError('');
    try {
      await batchesApi.removeStudent(batchId, studentUserId);
      await load();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to remove student');
    } finally {
      setActionId(null);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Manage Students</h2>
            <p className="text-xs text-gray-400">{batchName}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-gray-100">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-5">
          {error && <p className="text-sm text-red-600">{error}</p>}

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            </div>
          ) : (
            <>
              {/* Enrolled */}
              <section>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Enrolled ({enrolled.length})
                </h3>
                {enrolled.length === 0 ? (
                  <p className="text-sm text-gray-400">No students in this batch yet.</p>
                ) : (
                  <div className="divide-y divide-gray-100 border border-gray-200 rounded-lg">
                    {enrolled.map((s) => (
                      <div key={s.student_user_id} className="flex items-center justify-between px-3 py-2">
                        <div>
                          <p className="text-sm font-medium text-gray-800">{s.full_name}</p>
                          <p className="text-xs text-gray-400">{s.email}</p>
                        </div>
                        <button
                          onClick={() => handleRemove(s.student_user_id)}
                          disabled={actionId === s.student_user_id}
                          className="p-1.5 rounded-md text-red-500 hover:bg-red-50 disabled:opacity-40"
                          title="Remove from batch"
                        >
                          {actionId === s.student_user_id
                            ? <Loader2 className="h-4 w-4 animate-spin" />
                            : <UserMinus className="h-4 w-4" />}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Available */}
              <section>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Available to Add ({available.length})
                </h3>
                {available.length === 0 ? (
                  <p className="text-sm text-gray-400">All enrolled students are already in this batch.</p>
                ) : (
                  <div className="divide-y divide-gray-100 border border-gray-200 rounded-lg">
                    {available.map((s) => (
                      <div key={s.user_id} className="flex items-center justify-between px-3 py-2">
                        <div>
                          <p className="text-sm font-medium text-gray-800">{s.full_name}</p>
                          <p className="text-xs text-gray-400">{s.email}</p>
                        </div>
                        <button
                          onClick={() => handleAdd(s.user_id)}
                          disabled={actionId === s.user_id}
                          className="p-1.5 rounded-md text-blue-600 hover:bg-blue-50 disabled:opacity-40"
                          title="Add to batch"
                        >
                          {actionId === s.user_id
                            ? <Loader2 className="h-4 w-4 animate-spin" />
                            : <UserPlus className="h-4 w-4" />}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
