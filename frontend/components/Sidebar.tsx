// components/Sidebar.tsx

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, LayoutDashboard, Video, Users, Settings, X, Menu, FolderOpen, Megaphone, Layers, CalendarDays } from 'lucide-react';
import { useState } from 'react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface SidebarProps {
  role: 'teacher' | 'student';
}

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const teacherNavigation: NavItem[] = [
    { name: 'Dashboard', href: '/teacher/dashboard', icon: LayoutDashboard },
    { name: 'Courses', href: '/teacher/courses', icon: BookOpen },
    { name: 'Webinars', href: '/teacher/webinars', icon: Video },
    { name: 'Students', href: '/teacher/students', icon: Users },
    { name: 'Documents', href: '/teacher/documents', icon: FolderOpen },
    { name: 'Announcements', href: '/teacher/announcements', icon: Megaphone },
    { name: 'Batches', href: '/teacher/batches', icon: Layers },
    { name: 'Calendar', href: '/teacher/calendar', icon: CalendarDays },
    { name: 'Settings', href: '/teacher/settings', icon: Settings },
  ];

  const studentNavigation: NavItem[] = [
    { name: 'Dashboard', href: '/student/dashboard', icon: LayoutDashboard },
    { name: 'Courses', href: '/student/courses', icon: BookOpen },
    { name: 'Webinars', href: '/student/webinars', icon: Video },
    { name: 'Documents', href: '/student/documents', icon: FolderOpen },
    { name: 'Announcements', href: '/student/announcements', icon: Megaphone },
    { name: 'Batches', href: '/student/batches', icon: Layers },
    { name: 'Calendar', href: '/student/calendar', icon: CalendarDays },
    { name: 'Settings', href: '/student/settings', icon: Settings },
  ];

  const navigation = role === 'teacher' ? teacherNavigation : studentNavigation;

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out z-40 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 w-64`}
      >
        {/* Logo */}
        <div className="flex items-center space-x-3 px-6 py-6 border-b border-gray-200">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">YouTeach</h1>
            <p className="text-xs text-gray-500 capitalize">{role} Portal</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="px-4 py-6 space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            © 2024 YouTeach
          </div>
        </div>
      </aside>
    </>
  );
}