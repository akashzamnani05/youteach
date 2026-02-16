'use client';

import DashboardLayout from '@/components/DashboardLayout';
import FileExplorer from '@/components/documents/FileExplorer';

export default function DocumentsPage() {
  return (
    <DashboardLayout role="teacher">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Documents</h1>
        <p className="text-gray-500 mt-1">Shared class documents and files</p>
      </div>
      <FileExplorer />
    </DashboardLayout>
  );
}
