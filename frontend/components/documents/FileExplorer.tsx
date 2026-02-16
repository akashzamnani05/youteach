// components/documents/FileExplorer.tsx

'use client';

import { useCallback, useEffect, useState } from 'react';
import { FolderPlus, Upload, Loader2 } from 'lucide-react';
import { documentsApi } from '@/lib/documents';
import {
  DocumentFile,
  DocumentFolder,
  FolderContents,
} from '@/types/documents.types';
import Breadcrumb from './Breadcrumb';
import FolderItem from './FolderItem';
import FileItem from './FileItem';
import CreateFolderModal from './CreateFolderModal';
import UploadFileModal from './UploadFileModal';

interface FileExplorerProps {
  // Omit for teacher accounts (backend auto-determines scope from JWT).
  // Required for student accounts — pass the selected teacher's profile ID.
  scopeTeacherId?: string | null;
}

export default function FileExplorer({ scopeTeacherId }: FileExplorerProps) {
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [contents, setContents] = useState<FolderContents>({
    folders: [],
    files: [],
    breadcrumb: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal states
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  // Rename states
  const [renamingFolder, setRenamingFolder] = useState<DocumentFolder | null>(null);
  const [renamingFile, setRenamingFile] = useState<DocumentFile | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [renameLoading, setRenameLoading] = useState(false);

  const loadContents = useCallback(async (folderId: string | null) => {
    setLoading(true);
    setError('');
    try {
      const data = await documentsApi.getFolderContents(folderId, scopeTeacherId);
      setContents(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  }, [scopeTeacherId]);

  useEffect(() => {
    loadContents(currentFolderId);
  }, [currentFolderId, loadContents]);

  function navigateTo(folderId: string | null) {
    setCurrentFolderId(folderId);
  }

  // ---- Create folder ----
  async function handleCreateFolder(name: string) {
    await documentsApi.createFolder(name, currentFolderId, scopeTeacherId);
    await loadContents(currentFolderId);
  }

  // ---- Delete folder ----
  async function handleDeleteFolder(folder: DocumentFolder) {
    if (!confirm(`Delete folder "${folder.name}" and all its contents? This cannot be undone.`)) return;
    try {
      await documentsApi.deleteFolder(folder.id, scopeTeacherId);
      await loadContents(currentFolderId);
    } catch (err: any) {
      alert(err.message || 'Failed to delete folder');
    }
  }

  // ---- Rename folder ----
  function openRenameFolder(folder: DocumentFolder) {
    setRenamingFolder(folder);
    setRenameValue(folder.name);
  }

  async function submitRenameFolder() {
    if (!renamingFolder || !renameValue.trim()) return;
    setRenameLoading(true);
    try {
      await documentsApi.renameFolder(renamingFolder.id, renameValue.trim(), scopeTeacherId);
      setRenamingFolder(null);
      await loadContents(currentFolderId);
    } catch (err: any) {
      alert(err.message || 'Failed to rename folder');
    } finally {
      setRenameLoading(false);
    }
  }

  // ---- Download file ----
  async function handleDownloadFile(file: DocumentFile) {
    try {
      await documentsApi.downloadFile(file.id, file.name, scopeTeacherId);
    } catch (err: any) {
      alert(err.message || 'Failed to download file');
    }
  }

  // ---- Delete file ----
  async function handleDeleteFile(file: DocumentFile) {
    if (!confirm(`Delete "${file.name}"? This cannot be undone.`)) return;
    try {
      await documentsApi.deleteFile(file.id, scopeTeacherId);
      await loadContents(currentFolderId);
    } catch (err: any) {
      alert(err.message || 'Failed to delete file');
    }
  }

  // ---- Rename file ----
  function openRenameFile(file: DocumentFile) {
    setRenamingFile(file);
    setRenameValue(file.name);
  }

  async function submitRenameFile() {
    if (!renamingFile || !renameValue.trim()) return;
    setRenameLoading(true);
    try {
      await documentsApi.renameFile(renamingFile.id, renameValue.trim(), scopeTeacherId);
      setRenamingFile(null);
      await loadContents(currentFolderId);
    } catch (err: any) {
      alert(err.message || 'Failed to rename file');
    } finally {
      setRenameLoading(false);
    }
  }

  const isEmpty = !loading && contents.folders.length === 0 && contents.files.length === 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <Breadcrumb items={contents.breadcrumb} onNavigate={navigateTo} />

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowCreateFolder(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <FolderPlus className="h-4 w-4" />
            <span>New Folder</span>
          </button>
          <button
            onClick={() => setShowUpload(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            <Upload className="h-4 w-4" />
            <span>Upload</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="min-h-[300px]">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-500">
            <p className="text-sm">{error}</p>
            <button
              onClick={() => loadContents(currentFolderId)}
              className="mt-2 text-sm text-blue-600 hover:underline"
            >
              Retry
            </button>
          </div>
        ) : isEmpty ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-400">
            <p className="text-sm">This folder is empty</p>
            <p className="text-xs mt-1">Upload a file or create a folder to get started</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {contents.folders.map((folder) => (
              <FolderItem
                key={folder.id}
                folder={folder}
                onOpen={(f) => navigateTo(f.id)}
                onRename={openRenameFolder}
                onDelete={handleDeleteFolder}
              />
            ))}
            {contents.files.map((file) => (
              <FileItem
                key={file.id}
                file={file}
                onDownload={handleDownloadFile}
                onRename={openRenameFile}
                onDelete={handleDeleteFile}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Folder Modal */}
      {showCreateFolder && (
        <CreateFolderModal
          onClose={() => setShowCreateFolder(false)}
          onConfirm={handleCreateFolder}
        />
      )}

      {/* Upload Modal */}
      {showUpload && (
        <UploadFileModal
          folderId={currentFolderId}
          scopeTeacherId={scopeTeacherId}
          onClose={() => setShowUpload(false)}
          onSuccess={() => loadContents(currentFolderId)}
        />
      )}

      {/* Rename Folder dialog */}
      {renamingFolder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Rename Folder</h2>
            <input
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && submitRenameFolder()}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => setRenamingFolder(null)}
                className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={submitRenameFolder}
                disabled={renameLoading}
                className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {renameLoading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rename File dialog */}
      {renamingFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Rename File</h2>
            <input
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && submitRenameFile()}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => setRenamingFile(null)}
                className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={submitRenameFile}
                disabled={renameLoading}
                className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {renameLoading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
