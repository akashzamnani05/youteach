// types/webinar.ts

export interface Webinar {
  id: string;
  teacher_id: string;
  course_id?: string | null;
  title: string;
  description?: string;
  scheduled_at: string; // ISO string
  duration_minutes: number;
  meeting_link?: string;
  meeting_password?: string;
  max_participants?: number;
  is_recorded: boolean;
  recording_youtube_id?: string;
  status: 'scheduled' | 'live' | 'completed' | 'cancelled';
  reminder_sent: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateWebinarData {
  title: string;
  description?: string;
  scheduled_at: string; // ISO datetime string
  duration_minutes: number;
  meeting_link: string;
  meeting_password?: string;
  max_participants?: number;
  is_recorded?: boolean;
  course_id?: string;
}

export interface UpdateWebinarData {
  title?: string;
  description?: string;
  scheduled_at?: string;
  duration_minutes?: number;
  meeting_link?: string;
  meeting_password?: string;
  max_participants?: number;
  is_recorded?: boolean;
  status?: 'scheduled' | 'live' | 'completed' | 'cancelled';
}

export interface WebinarWithTimeLeft extends Webinar {
  timeLeft?: string;
  isPast: boolean;
  isLive: boolean;
}

export interface StudentWebinar extends Webinar {
  is_registered: boolean;
  registration_id?: string;
  teacher_name?: string;
}

export interface StudentWebinarWithTimeLeft extends StudentWebinar {
  timeLeft?: string;
  isPast: boolean;
  isLive: boolean;
  isUpcoming: boolean;
}