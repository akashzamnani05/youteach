'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import FileExplorer from '@/components/documents/FileExplorer';
import { documentsApi } from '@/lib/documents';
import { AccessibleTeacher } from '@/types/documents.types';
import { Loader2, BookOpen } from 'lucide-react';

export default function DocumentsPage() {
  const [teachers, setTeachers] = useState<AccessibleTeacher[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    documentsApi
      .getAccessibleTeachers()
      .then((list) => {
        setTeachers(list);
        // Auto-select if only one teacher
        if (list.length === 1) {
          setSelectedTeacherId(list[0].teacher_profile_id);
        }
      })
      .catch((err: any) => setError(err.message || 'Failed to load teachers'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout role="student">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Documents</h1>
        <p className="text-gray-500 mt-1">Shared class documents and files</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
          <p className="text-sm">{error}</p>
        </div>
      ) : teachers.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <BookOpen className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">No courses enrolled</p>
          <p className="text-sm text-gray-400 mt-1">
            Enroll in a course to access shared documents
          </p>
        </div>
      ) : (
        <>
          {/* Teacher picker — only shown when enrolled with multiple teachers */}
          {teachers.length > 1 && (
            <div className="mb-4 flex items-center space-x-3">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                View documents for:
              </label>
              <select
                value={selectedTeacherId ?? ''}
                onChange={(e) => setSelectedTeacherId(e.target.value || null)}
                className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">— Select a teacher —</option>
                {teachers.map((t) => (
                  <option key={t.teacher_profile_id} value={t.teacher_profile_id}>
                    {t.teacher_name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {selectedTeacherId ? (
            <FileExplorer scopeTeacherId={selectedTeacherId} />
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">
              <p className="text-sm">Select a teacher above to view their documents</p>
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
}
