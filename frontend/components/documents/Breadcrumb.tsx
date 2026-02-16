// components/documents/Breadcrumb.tsx

'use client';

import { ChevronRight } from 'lucide-react';
import { BreadcrumbItem } from '@/types/documents.types';

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  onNavigate: (folderId: string | null) => void;
}

export default function Breadcrumb({ items, onNavigate }: BreadcrumbProps) {
  return (
    <nav className="flex items-center space-x-1 text-sm text-gray-500">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <span key={item.id ?? 'root'} className="flex items-center space-x-1">
            {index > 0 && <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />}
            {isLast ? (
              <span className="font-medium text-gray-900">{item.name}</span>
            ) : (
              <button
                onClick={() => onNavigate(item.id)}
                className="hover:text-blue-600 transition-colors"
              >
                {item.name}
              </button>
            )}
          </span>
        );
      })}
    </nav>
  );
}
