// src/types/batches.types.ts

export interface Batch {
  id: string;
  teacher_profile_id: string;
  name: string;
  description: string | null;
  meeting_link: string;
  class_time: string;        // HH:MM:SS
  duration_minutes: number;
  created_at: string;
  updated_at: string;
  // aggregated / joined (optional)
  student_count?: number;
  session_count?: number;
  teacher_name?: string;
  next_session_date?: string | null;
}

export interface BatchStudent {
  id: string;
  batch_id: string;
  student_user_id: string;
  added_at: string;
  full_name: string;
  email: string;
}

export interface BatchSession {
  id: string;
  batch_id: string;
  session_date: string;   // YYYY-MM-DD
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface AttendanceRecord {
  id?: string;
  session_id: string;
  student_user_id: string;
  status: 'present' | 'absent' | 'late';
  marked_at?: string;
  full_name: string;
  email: string;
}

export interface TeacherStudent {
  user_id: string;
  full_name: string;
  email: string;
}

export interface CreateBatchData {
  name: string;
  description?: string;
  meeting_link: string;
  class_time: string;           // HH:MM
  duration_minutes?: number;
  student_user_ids?: string[];
  // sessions
  session_type: 'single' | 'range';
  session_date?: string;        // YYYY-MM-DD (for single)
  start_date?: string;          // YYYY-MM-DD (for range)
  end_date?: string;            // YYYY-MM-DD (for range)
  days_of_week?: number[];      // 0=Sun … 6=Sat
}

export interface UpdateBatchData {
  name?: string;
  description?: string;
  meeting_link?: string;
  class_time?: string;
  duration_minutes?: number;
}

export interface CreateSessionsData {
  session_type: 'single' | 'range';
  session_date?: string;
  start_date?: string;
  end_date?: string;
  days_of_week?: number[];
}

export interface MarkAttendanceItem {
  student_user_id: string;
  status: 'present' | 'absent' | 'late';
}
