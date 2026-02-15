# Documents Feature — Implementation Plan

## What We're Building

A standalone **Documents** section accessible from the sidebar for both teachers and students. Users can upload/download files, create folders and subfolders (unlimited depth), and navigate with breadcrumbs.

**Single scope only — no course attachment.** This is a shared class drive: all authenticated users (any teacher or student on the platform) can see and interact with all documents and folders.

**Storage split:**
- **Firebase Storage** — stores the actual file bytes only
- **MySQL** — stores all metadata (name, size, MIME type, uploader, folder location, Firebase path, download URL)

---

## Storage: Firebase Storage + Signed URLs

Since the project uses custom JWT auth (not Firebase Auth), the integration works as follows:

- **Backend** uses `firebase-admin` SDK (server-side only) to generate short-lived signed URLs
- **Browser** uploads file bytes directly to Google Cloud Storage via a signed PUT URL — file bytes never pass through the Express server
- **Frontend** needs no Firebase client SDK — upload is a plain XHR PUT to the signed URL
- **Download** — backend generates a fresh 15-minute signed GET URL on each download request; the stored MySQL `download_url` is a long-lived backup reference
- **Security** — Firebase Storage rules set to `deny all`; Admin SDK bypasses these rules

**Upload flow (3 steps):**
```
1. Frontend  →  POST /api/documents/files/upload-url
               ← { file_id, signed_url, storage_path }

2. Frontend  →  PUT signed_url   (direct to GCS, XHR for progress tracking)
               ← 200 OK from GCS

3. Frontend  →  POST /api/documents/files
               ← { file }   (backend writes row to MySQL)
```

---

## Database (MySQL)

**No changes to any existing tables.** Add two new tables to `database/mysql_schema.sql`:

### `document_folders`

```sql
CREATE TABLE document_folders (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    parent_folder_id CHAR(36) NULL,        -- NULL = root level; self-referential
    created_by_user_id CHAR(36) NOT NULL,  -- FK to users.id
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_folder_id) REFERENCES document_folders(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_folders_parent (parent_folder_id),
    INDEX idx_folders_user (created_by_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### `document_files`

```sql
CREATE TABLE document_files (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,              -- display name (user can rename)
    original_filename VARCHAR(255) NOT NULL, -- original name at upload time
    mime_type VARCHAR(127) NOT NULL,
    size_bytes BIGINT NOT NULL DEFAULT 0,
    folder_id CHAR(36) NULL,                 -- NULL = root level; SET NULL if folder deleted
    uploaded_by_user_id CHAR(36) NOT NULL,   -- FK to users.id
    storage_path VARCHAR(1000) NOT NULL,     -- GCS object path (used for deletion)
    download_url TEXT NOT NULL,              -- long-lived signed URL stored at upload time
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (folder_id) REFERENCES document_folders(id) ON DELETE SET NULL,
    FOREIGN KEY (uploaded_by_user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_files_folder (folder_id),
    INDEX idx_files_user (uploaded_by_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Design notes:**
- No `course_id` — completely standalone, not linked to any course
- `parent_folder_id` self-reference enables unlimited subdirectory depth
- `folder_id ON DELETE SET NULL` — files survive folder deletion; they fall back to root rather than being deleted (safer default)
- Folder deletion cascades through children via `ON DELETE CASCADE` on `parent_folder_id`
- MySQL 8.0 **recursive CTE** used to collect all descendant file `storage_path` values before a folder delete, so Firebase objects can be cleaned up
- `storage_path` in MySQL is the GCS path needed to call Firebase delete; `download_url` is what the frontend uses to serve downloads
- Use MySQL NULL-safe equals `<=>` in WHERE clauses (e.g. `WHERE folder_id <=> ?`) to correctly match NULL root-level items

---

## Firebase Storage Path Structure

File bytes only are stored in Firebase. MySQL holds everything else.

```
gs://your-bucket/
  documents/
    root/
      {fileId}-{sanitizedFilename}      ← files at root level (no folder)
    {folderId}/
      {fileId}-{sanitizedFilename}      ← files inside a folder
```

The `fileId` (UUID generated server-side before the upload) is prefixed to the filename to guarantee uniqueness even if the same filename is uploaded multiple times.

---

## Environment Variables

Add to `backend/.env`:

```
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY_ID=
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=
FIREBASE_CLIENT_ID=
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
FIREBASE_SIGNED_URL_EXPIRY_MINUTES=15
```

Values come from: Firebase Console → Project Settings → Service Accounts → Generate new private key.

**Frontend:** no new env vars needed.

---

## New Backend Files

Follows existing project conventions (`youtube.config.ts`, `youtube.service.ts`, `course.service.ts`, etc.):

```
backend/src/
├── config/
│   └── firebase.config.ts      ← NEW: init firebase-admin singleton (matches youtube.config.ts pattern)
├── services/
│   ├── storage.service.ts      ← NEW: signed URL generation + GCS file deletion (matches youtube.service.ts pattern)
│   └── documents.service.ts    ← NEW: all MySQL CRUD logic
├── controllers/
│   └── documents.controller.ts ← NEW: HTTP handlers (static class, matches course.controller.ts pattern)
├── routes/
│   └── documents.routes.ts     ← NEW: route definitions (matches course.routes.ts pattern)
└── types/
    └── documents.types.ts      ← NEW: TypeScript interfaces (matches course.types.ts pattern)
```

**Modified:**
- `backend/src/app.ts` — one import line + one `app.use('/api/documents', documentsRoutes)` line

---

### `firebase.config.ts`

Initializes `firebase-admin` once (guards against hot-reload double-init in dev). Matches the pattern of `youtube.config.ts`:

```ts
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKeyId: process.env.FIREBASE_PRIVATE_KEY_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      clientId: process.env.FIREBASE_CLIENT_ID,
    } as admin.ServiceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
}

export const storageBucket = admin.storage().bucket();
```

Note: `FIREBASE_PRIVATE_KEY` needs `.replace(/\\n/g, '\n')` because `.env` files escape newlines as literal `\n`.

---

### `storage.service.ts`

Static class. Handles all Firebase Storage operations — backend only:

```ts
export class StorageService {
  // Generate signed PUT URL for browser-direct upload
  static async getUploadUrl(storagePath: string, mimeType: string): Promise<string>

  // Generate fresh signed GET URL for download (15 min default)
  static async getDownloadUrl(storagePath: string, expiryMinutes?: number): Promise<string>

  // Delete a file from GCS (used on file/folder delete)
  static async deleteFile(storagePath: string): Promise<void>

  // Build the GCS path from fileId + folderId + filename
  static buildStoragePath(fileId: string, folderId: string | null, filename: string): string
  // Result: "documents/root/{fileId}-{safe}" or "documents/{folderId}/{fileId}-{safe}"
}
```

---

### `documents.service.ts`

Static class. All MySQL operations using `query`/`queryOne` from `database.ts`. Access control: any authenticated user can read/write (JWT `authenticate` middleware handles auth; no further role/course checks needed).

Key methods:

| Method | Description |
|---|---|
| `getFolderContents(folderId)` | Returns `{ folders[], files[], breadcrumb[] }` for the given folder (null = root) |
| `buildBreadcrumb(folderId)` | Walks `parent_folder_id` chain upward; returns `[{ id, name }]` from root to current |
| `createFolder(name, parentFolderId, userId)` | Inserts row; validates parent exists if parentFolderId given |
| `renameFolder(folderId, name, userId)` | UPDATE name |
| `deleteFolder(folderId, userId)` | Recursive CTE to collect descendant file `storage_path` values → DELETE folder row (CASCADE handles children) → StorageService.deleteFile for each |
| `requestUploadUrl(filename, mimeType, sizeBytes, folderId, userId)` | Generates `fileId` (uuidv4), builds path, calls `StorageService.getUploadUrl` → returns `{ file_id, signed_url, storage_path }` |
| `saveFile(params)` | Called after upload: generates long-lived download URL, inserts `document_files` row |
| `getDownloadUrl(fileId)` | Generates fresh 15-min signed URL via `StorageService.getDownloadUrl` |
| `deleteFile(fileId, userId)` | DELETE from MySQL → `StorageService.deleteFile` |
| `renameFile(fileId, name, userId)` | UPDATE `name` only — Firebase path unchanged |

---

### `documents.controller.ts`

Static class. Follows the exact pattern of `course.controller.ts` — reads from `req.user.userId` (set by `authenticate` middleware), calls service methods, returns `{ success, message, data }` JSON responses.

---

### `documents.routes.ts`

All routes behind `authenticate` middleware from `auth.middleware.ts`. Route order matters — static paths before parameterized ones:

```
GET    /api/documents/contents              ?folderId=   → getFolderContents
POST   /api/documents/folders                            → createFolder
PUT    /api/documents/folders/:id                        → renameFolder
DELETE /api/documents/folders/:id                        → deleteFolder
POST   /api/documents/files/upload-url                  → requestUploadUrl   (before /files/:id)
POST   /api/documents/files                             → saveFile
GET    /api/documents/files/:id/download                → getDownloadUrl
PUT    /api/documents/files/:id                         → renameFile
DELETE /api/documents/files/:id                         → deleteFile
```

---

## API Endpoint Reference

| Method | Path | Body / Query | Response `data` |
|---|---|---|---|
| `GET` | `/api/documents/contents` | `?folderId=<uuid\|omit>` | `{ folders[], files[], breadcrumb[] }` |
| `POST` | `/api/documents/folders` | `{ name, parent_folder_id? }` | `{ folder }` |
| `PUT` | `/api/documents/folders/:id` | `{ name }` | `{ folder }` |
| `DELETE` | `/api/documents/folders/:id` | — | `{}` |
| `POST` | `/api/documents/files/upload-url` | `{ filename, mime_type, size_bytes, folder_id? }` | `{ file_id, signed_url, storage_path }` |
| `POST` | `/api/documents/files` | `{ file_id, filename, original_filename, mime_type, size_bytes, folder_id?, storage_path }` | `{ file }` |
| `GET` | `/api/documents/files/:id/download` | — | `{ download_url, filename }` |
| `PUT` | `/api/documents/files/:id` | `{ name }` | `{ file }` |
| `DELETE` | `/api/documents/files/:id` | — | `{}` |

**Breadcrumb item shape:** `{ id: string | null, name: string }` — `id: null` means root.

---

## New Frontend Files

Follows existing project conventions (`lib/course.ts`, `lib/webinar.ts`, `types/course.types.ts`, `components/VideoUploadForm.tsx`, etc.):

```
frontend/
├── app/
│   ├── teacher/
│   │   └── documents/
│   │       └── page.tsx            ← NEW (matches teacher/webinars/page.tsx pattern)
│   └── student/
│       └── documents/
│           └── page.tsx            ← NEW (matches student/webinars/page.tsx pattern)
├── components/
│   └── documents/
│       ├── FileExplorer.tsx        ← NEW: main component, manages all state
│       ├── Breadcrumb.tsx          ← NEW: clickable path navigation
│       ├── FolderItem.tsx          ← NEW: folder row with hover ⋮ menu (open / rename / delete)
│       ├── FileItem.tsx            ← NEW: file row with size, date, download button, ⋮ menu
│       ├── CreateFolderModal.tsx   ← NEW: name input modal (matches course create pattern)
│       └── UploadFileModal.tsx     ← NEW: file picker + XHR progress bar
├── lib/
│   └── documents.ts                ← NEW: all API calls (matches lib/course.ts pattern)
└── types/
    └── documents.types.ts          ← NEW: TypeScript interfaces (matches types/course.types.ts)
```

**Modified files (sidebar only):**
- `components/Sidebar.tsx` — add `FolderOpen` to lucide-react import + Documents nav entry for both roles

No changes to any course, learn, or webinar pages.

---

### `types/documents.types.ts`

```ts
export interface DocumentFolder {
  id: string;
  name: string;
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
  folder_id: string | null;
  uploaded_by_user_id: string;
  storage_path: string;
  download_url: string;
  created_at: string;
  updated_at: string;
}

export interface BreadcrumbItem {
  id: string | null;  // null = root
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
```

---

### `lib/documents.ts`

Follows the pattern of `lib/course.ts` and `lib/courseVideo.ts` — uses `apiClient` from `lib/api.ts`:

```ts
export const documentsApi = {
  // GET /api/documents/contents?folderId=
  getFolderContents: async (folderId?: string | null): Promise<FolderContents>

  // POST /api/documents/folders
  createFolder: async (name: string, parentFolderId?: string | null): Promise<DocumentFolder>

  // PUT /api/documents/folders/:id
  renameFolder: async (folderId: string, name: string): Promise<DocumentFolder>

  // DELETE /api/documents/folders/:id
  deleteFolder: async (folderId: string): Promise<void>

  // Full 3-step upload: request URL → PUT to GCS via XHR → save metadata
  uploadFile: async (params: {
    file: File;
    folderId?: string | null;
    onProgress?: (pct: number) => void;
  }): Promise<DocumentFile>

  // GET /api/documents/files/:id/download → triggers browser download
  downloadFile: async (fileId: string): Promise<void>

  // PUT /api/documents/files/:id
  renameFile: async (fileId: string, name: string): Promise<DocumentFile>

  // DELETE /api/documents/files/:id
  deleteFile: async (fileId: string): Promise<void>
}
```

The `uploadFile` method handles all three steps internally. It uses `XMLHttpRequest` (not `fetch`) so the `onProgress` callback works for the GCS PUT step.

---

### `components/documents/FileExplorer.tsx`

No props — always the shared workspace. Manages:
- `currentFolderId: string | null` — tracks navigation (null = root)
- `contents: FolderContents` — current folder's folders + files + breadcrumb
- `loading: boolean`
- Modal open states (`showCreateFolder`, `showUpload`)

Actions:
- Navigate into folder: call `getFolderContents(folderId)`, update state
- Breadcrumb click: navigate to that folder (null = root)
- Delete folder: confirm dialog → `deleteFolder` → reload
- Delete file: confirm dialog → `deleteFile` → reload
- Download file: `downloadFile` (triggers browser download)

---

### `Sidebar.tsx` changes

```ts
// Add FolderOpen to the existing lucide-react import:
import { BookOpen, LayoutDashboard, Video, Users, Settings, X, Menu, FolderOpen } from 'lucide-react';

// teacherNavigation — insert before Settings entry:
{ name: 'Documents', href: '/teacher/documents', icon: FolderOpen },

// studentNavigation — insert before Settings entry:
{ name: 'Documents', href: '/student/documents', icon: FolderOpen },
```

---

### Page files

`app/teacher/documents/page.tsx` and `app/student/documents/page.tsx` — identical structure, just role differs:

```tsx
'use client';
import DashboardLayout from '@/components/DashboardLayout';
import FileExplorer from '@/components/documents/FileExplorer';

export default function DocumentsPage() {
  return (
    <DashboardLayout role="teacher">  {/* or "student" */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Documents</h1>
        <p className="text-gray-500 mt-1">Shared class documents and files</p>
      </div>
      <FileExplorer />
    </DashboardLayout>
  );
}
```

---

## One-Time Firebase Setup

1. Firebase Console → create/select project → enable **Storage**
2. Project Settings → Service Accounts → **Generate new private key** → download JSON
3. Copy values from JSON into `backend/.env`
4. Set Storage Security Rules to `allow read, write: if false` (Admin SDK bypasses these)
5. Configure GCS **CORS** so the browser can do a PUT to the signed URL:

```json
[{
  "origin": ["http://localhost:3000"],
  "method": ["PUT"],
  "responseHeader": ["Content-Type"],
  "maxAgeSeconds": 3600
}]
```
```bash
gsutil cors set cors.json gs://your-bucket-name
```

---

## New npm Packages

```bash
# In /backend only
npm install firebase-admin uuid
npm install --save-dev @types/uuid
```

No new packages for frontend — upload uses native XHR.

---

## Implementation Order

**Backend first:**
1. Add two `CREATE TABLE` statements to `database/mysql_schema.sql` and run on local MySQL
2. Firebase project setup + CORS config
3. `npm install firebase-admin uuid` in `/backend`
4. Create `firebase.config.ts`
5. Create `storage.service.ts`
6. Create `documents.types.ts` (backend)
7. Create `documents.service.ts`
8. Create `documents.controller.ts`
9. Create `documents.routes.ts`
10. Modify `app.ts` — one import + one `app.use` line

**Test backend with Postman before touching frontend**

**Frontend:**
11. Create `types/documents.types.ts`
12. Create `lib/documents.ts`
13. Create components in order: `Breadcrumb` → `FolderItem` → `FileItem` → `CreateFolderModal` → `UploadFileModal` → `FileExplorer`
14. Create `app/teacher/documents/page.tsx` and `app/student/documents/page.tsx`
15. Modify `Sidebar.tsx`

---

## Verification Checklist

- [ ] Two new MySQL tables exist with correct foreign keys
- [ ] `GET /api/documents/contents` (no params) returns root folders + files + breadcrumb
- [ ] `GET /api/documents/contents?folderId=X` returns correct subfolder contents
- [ ] POST upload-url → XHR PUT to GCS → POST save file — all three steps complete
- [ ] Upload progress bar shows percentage during GCS PUT
- [ ] Create nested subfolder works; breadcrumb reflects correct path
- [ ] Deleting a folder removes all descendant files from both MySQL and Firebase
- [ ] `folder_id ON DELETE SET NULL` — files remain accessible at root after their folder is deleted
- [ ] Download triggers browser file download using original filename
- [ ] Rename updates only the display `name`; `storage_path` and `original_filename` unchanged
- [ ] Documents sidebar link appears for both teacher and student; active state highlights correctly
- [ ] `/teacher/documents` and `/student/documents` pages render `FileExplorer` inside `DashboardLayout`
- [ ] No changes to any course or learn pages
