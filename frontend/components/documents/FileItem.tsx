// components/documents/FileItem.tsx

'use client';

import { useState, useRef, useEffect } from 'react';
import { FileText, Download, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { DocumentFile } from '@/types/documents.types';

interface FileItemProps {
  file: DocumentFile;
  onDownload: (file: DocumentFile) => void;
  onRename: (file: DocumentFile) => void;
  onDelete: (file: DocumentFile) => void;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function FileItem({ file, onDownload, onRename, onDelete }: FileItemProps) {
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
    <div className="flex items-center justify-between px-4 py-3 rounded-lg hover:bg-gray-50 group">
      {/* Left — icon + name */}
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        <FileText className="h-5 w-5 text-gray-400 flex-shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
          <p className="text-xs text-gray-400">
            {formatBytes(file.size_bytes)} · {formatDate(file.created_at)}
          </p>
        </div>
      </div>

      {/* Right — download button + ⋮ menu */}
      <div className="flex items-center space-x-1 flex-shrink-0">
        <button
          onClick={() => onDownload(file)}
          className="p-1.5 rounded hover:bg-blue-50 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"
          title="Download"
        >
          <Download className="h-4 w-4" />
        </button>

        <div className="relative" ref={menuRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((prev) => !prev);
            }}
            className="p-1 rounded hover:bg-gray-200 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreVertical className="h-4 w-4 text-gray-500" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-7 z-10 bg-white border border-gray-200 rounded-lg shadow-md py-1 w-36">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  onRename(file);
                }}
                className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <Pencil className="h-4 w-4" />
                <span>Rename</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  onDelete(file);
                }}
                className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
