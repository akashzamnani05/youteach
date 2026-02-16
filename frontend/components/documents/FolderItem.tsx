// components/documents/FolderItem.tsx

'use client';

import { useState, useRef, useEffect } from 'react';
import { Folder, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { DocumentFolder } from '@/types/documents.types';

interface FolderItemProps {
  folder: DocumentFolder;
  onOpen: (folder: DocumentFolder) => void;
  onRename: (folder: DocumentFolder) => void;
  onDelete: (folder: DocumentFolder) => void;
}

export default function FolderItem({ folder, onOpen, onRename, onDelete }: FolderItemProps) {
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
    <div
      className="flex items-center justify-between px-4 py-3 rounded-lg hover:bg-gray-50 group cursor-pointer"
      onDoubleClick={() => onOpen(folder)}
    >
      {/* Left — icon + name */}
      <button
        className="flex items-center space-x-3 flex-1 text-left"
        onClick={() => onOpen(folder)}
      >
        <Folder className="h-5 w-5 text-blue-500 flex-shrink-0" />
        <span className="text-sm font-medium text-gray-800 truncate">{folder.name}</span>
      </button>

      {/* Right — ⋮ menu */}
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
                onRename(folder);
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
                onDelete(folder);
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
  );
}
