'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { calendarApi } from '@/lib/calendar';
import { CalendarEvent } from '@/types/calendar.types';
import EventBlock from './EventBlock';
import EventDetailModal from './EventDetailModal';

// ─── Constants ──────────────────────────────────────────────────
const START_HOUR = 6;       // 6 AM
const END_HOUR = 24;        // midnight
const TOTAL_HOURS = END_HOUR - START_HOUR; // 18
const HOUR_HEIGHT = 60;     // px per hour — makes 1 min = 1 px
const GRID_HEIGHT = TOTAL_HOURS * HOUR_HEIGHT; // 1080 px

// ─── Helpers ────────────────────────────────────────────────────
function toDateStr(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/** Monday of the week containing `d`. */
function getMonday(d: Date): Date {
  const copy = new Date(d);
  const day = copy.getDay(); // 0=Sun
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function addDays(d: Date, n: number): Date {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + n);
  return copy;
}

function formatWeekRange(mon: Date): string {
  const sun = addDays(mon, 6);
  const mOpts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  const yOpts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
  return `${mon.toLocaleDateString('en-US', mOpts)} – ${sun.toLocaleDateString('en-US', yOpts)}`;
}

function formatHour(h: number): string {
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour} ${ampm}`;
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// ─── Component ──────────────────────────────────────────────────
interface Props {
  role: 'teacher' | 'student';
}

export default function WeekView({ role }: Props) {
  const today = toDateStr(new Date());
  const [monday, setMonday] = useState<Date>(() => getMonday(new Date()));
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<CalendarEvent | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Week dates: Mon-Sun
  const weekDates = Array.from({ length: 7 }, (_, i) => toDateStr(addDays(monday, i)));

  // Fetch events whenever the displayed week changes
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    calendarApi
      .getEvents(weekDates[0], weekDates[6])
      .then((data) => { if (!cancelled) setEvents(data); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [weekDates[0]]);

  // Scroll to ~current hour on first load
  useEffect(() => {
    if (scrollRef.current) {
      const now = new Date();
      const scrollTo = Math.max(0, (now.getHours() - START_HOUR - 1) * HOUR_HEIGHT);
      scrollRef.current.scrollTop = scrollTo;
    }
  }, []);

  // Group events by date
  const byDate: Record<string, CalendarEvent[]> = {};
  for (const d of weekDates) byDate[d] = [];
  for (const ev of events) {
    if (byDate[ev.date]) byDate[ev.date].push(ev);
  }

  // Current time indicator
  const now = new Date();
  const nowMinutes = (now.getHours() - START_HOUR) * 60 + now.getMinutes();
  const showNowLine = nowMinutes >= 0 && nowMinutes <= GRID_HEIGHT;
  const todayColIdx = weekDates.indexOf(today);

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMonday(addDays(monday, -7))}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setMonday(addDays(monday, 7))}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <span className="text-sm font-semibold text-gray-700 ml-1">
            {formatWeekRange(monday)}
          </span>
        </div>
        <button
          onClick={() => setMonday(getMonday(new Date()))}
          className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-100"
        >
          Today
        </button>
      </div>

      {/* Loader overlay */}
      {loading && (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
        </div>
      )}

      {/* Calendar grid */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col flex-1 min-h-0">
        {/* Day headers */}
        <div className="grid grid-cols-[56px_repeat(7,1fr)] border-b border-gray-200 bg-gray-50">
          <div /> {/* time gutter */}
          {weekDates.map((d, i) => {
            const isToday = d === today;
            const dayNum = new Date(d + 'T00:00:00').getDate();
            return (
              <div key={d} className={`text-center py-2 border-l border-gray-200 ${isToday ? 'bg-blue-50' : ''}`}>
                <p className="text-[10px] font-medium text-gray-400 uppercase">{DAY_LABELS[i]}</p>
                <p className={`text-sm font-bold ${isToday ? 'text-blue-600' : 'text-gray-800'}`}>{dayNum}</p>
              </div>
            );
          })}
        </div>

        {/* Scrollable body */}
        <div ref={scrollRef} className="overflow-y-auto flex-1 relative">
          <div className="grid grid-cols-[56px_repeat(7,1fr)]" style={{ height: `${GRID_HEIGHT}px` }}>
            {/* Time gutter */}
            <div className="relative">
              {Array.from({ length: TOTAL_HOURS }, (_, i) => (
                <div
                  key={i}
                  className="absolute left-0 right-0 text-[10px] text-gray-400 text-right pr-2 -translate-y-1/2"
                  style={{ top: `${i * HOUR_HEIGHT}px` }}
                >
                  {formatHour(START_HOUR + i)}
                </div>
              ))}
            </div>

            {/* Day columns */}
            {weekDates.map((d, colIdx) => {
              const isToday = d === today;
              const dayEvents = byDate[d] || [];
              return (
                <div
                  key={d}
                  className={`relative border-l border-gray-200 ${isToday ? 'bg-blue-50/30' : ''}`}
                >
                  {/* Hour lines */}
                  {Array.from({ length: TOTAL_HOURS }, (_, i) => (
                    <div
                      key={i}
                      className="absolute left-0 right-0 border-t border-gray-100"
                      style={{ top: `${i * HOUR_HEIGHT}px` }}
                    />
                  ))}

                  {/* Now indicator */}
                  {showNowLine && colIdx === todayColIdx && (
                    <div
                      className="absolute left-0 right-0 z-20 border-t-2 border-red-500"
                      style={{ top: `${nowMinutes}px` }}
                    >
                      <div className="absolute -left-1 -top-[5px] w-2.5 h-2.5 rounded-full bg-red-500" />
                    </div>
                  )}

                  {/* Events */}
                  {dayEvents.map((ev) => {
                    const [h, m] = ev.start_time.split(':').map(Number);
                    const topPx = (h - START_HOUR) * HOUR_HEIGHT + m;
                    const heightPx = ev.duration_minutes;
                    return (
                      <EventBlock
                        key={ev.id}
                        event={ev}
                        top={topPx}
                        height={heightPx}
                        onClick={() => setSelected(ev)}
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Detail modal */}
      {selected && (
        <EventDetailModal
          event={selected}
          role={role}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
