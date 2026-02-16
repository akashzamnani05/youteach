// types/documents.types.ts

export interface DocumentFolder {
  id: string;
  name: string;
  teacher_profile_id: string;
  parent_folder_id: string | null;
  created_by_user_id: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentFile {
  id: string;
  name: string;
  original_filename: string;
  mime_type: string;
  size_bytes: number;
  teacher_profile_id: string;
  folder_id: string | null;
  uploaded_by_user_id: string;
  storage_path: string;
  download_url: string;
  created_at: string;
  updated_at: string;
}

export interface BreadcrumbItem {
  id: string | null; // null = root
  name: string;
}

export interface FolderContents {
  folders: DocumentFolder[];
  files: DocumentFile[];
  breadcrumb: BreadcrumbItem[];
}

export interface UploadUrlResponse {
  file_id: string;
  signed_url: string;
  storage_path: string;
}

export interface AccessibleTeacher {
  teacher_profile_id: string;
  teacher_name: string;
}
