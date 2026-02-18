'use client';

import { Video, Layers } from 'lucide-react';
import { CalendarEvent } from '@/types/calendar.types';

interface Props {
  event: CalendarEvent;
  top: number;       // px offset from top of the day column
  height: number;    // px height (proportional to duration)
  onClick: () => void;
}

function formatTime(t: string) {
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
}

export default function EventBlock({ event, top, height, onClick }: Props) {
  const isWebinar = event.type === 'webinar';
  const minH = Math.max(height, 22); // minimum visible height

  return (
    <button
      onClick={onClick}
      style={{ top: `${top}px`, height: `${minH}px` }}
      className={`absolute left-1 right-1 rounded-md px-1.5 py-0.5 border-l-[3px] overflow-hidden text-left cursor-pointer transition-shadow hover:shadow-md z-10 ${
        isWebinar
          ? 'bg-blue-50 border-l-blue-500 hover:bg-blue-100'
          : 'bg-green-50 border-l-green-500 hover:bg-green-100'
      }`}
    >
      <div className="flex items-center gap-1 min-w-0">
        {isWebinar
          ? <Video className="h-3 w-3 shrink-0 text-blue-500" />
          : <Layers className="h-3 w-3 shrink-0 text-green-500" />}
        <span className={`text-[10px] font-semibold truncate ${isWebinar ? 'text-blue-700' : 'text-green-700'}`}>
          {event.title}
        </span>
      </div>
      {minH >= 34 && (
        <p className={`text-[10px] mt-0.5 ${isWebinar ? 'text-blue-500' : 'text-green-500'}`}>
          {formatTime(event.start_time)} · {event.duration_minutes}m
        </p>
      )}
    </button>
  );
}
