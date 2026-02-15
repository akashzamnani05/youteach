interface Module {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

interface Content {
  id: string;
  module_id: string;
  content_type: 'video' | 'document' | 'quiz' | 'assignment' | 'text' | 'link';
  title: string;
  description?: string;
  youtube_video_id?: string;
  google_drive_file_id?: string;
  content_url?: string;
  text_content?: string;
  duration_minutes?: number;
  file_size_mb?: number;
  order_index: number;
  is_free_preview: boolean;
  created_at: string;
  updated_at: string;
}

interface ModulesResponse {
  success: boolean;
  message: string;
  data: {
    modules: Module[];
    count: number;
  };
}

interface ContentResponse {
  success: boolean;
  message: string;
  data: {
    content: Content[];
    count: number;
  };
}