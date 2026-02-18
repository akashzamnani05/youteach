// lib/calendar.ts

import apiClient from './api';
import { CalendarEvent } from '../types/calendar.types';

export const calendarApi = {
  // GET /api/calendar/events?start=YYYY-MM-DD&end=YYYY-MM-DD
  getEvents: async (start: string, end: string): Promise<CalendarEvent[]> => {
    const res = await apiClient.get('/calendar/events', { params: { start, end } });
    return res.data.data.events;
  },
};
