# Documents Feature — Setup Steps

---

## Step 1: Run SQL to Create New Tables

Each teacher's documents are completely isolated. The `teacher_profile_id` column is the scope key on both tables. Connect to your MySQL database and choose **Option A** or **Option B**.

---

### Option A — Fresh install (drop & recreate, recommended for dev)

```sql
-- Drop in reverse dependency order
DROP TABLE IF EXISTS document_files;
DROP TABLE IF EXISTS document_folders;

-- ============================================
-- DOCUMENTS: FOLDERS
-- ============================================

CREATE TABLE document_folders (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    teacher_profile_id CHAR(36) NOT NULL,
    parent_folder_id CHAR(36) NULL,
    created_by_user_id CHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_profile_id) REFERENCES teacher_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_folder_id) REFERENCES document_folders(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_folders_teacher (teacher_profile_id),
    INDEX idx_folders_parent (parent_folder_id),
    INDEX idx_folders_user (created_by_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- DOCUMENTS: FILES
-- ============================================

CREATE TABLE document_files (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    mime_type VARCHAR(127) NOT NULL,
    size_bytes BIGINT NOT NULL DEFAULT 0,
    teacher_profile_id CHAR(36) NOT NULL,
    folder_id CHAR(36) NULL,
    uploaded_by_user_id CHAR(36) NOT NULL,
    storage_path VARCHAR(1000) NOT NULL,
    download_url TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_profile_id) REFERENCES teacher_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (folder_id) REFERENCES document_folders(id) ON DELETE SET NULL,
    FOREIGN KEY (uploaded_by_user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_files_teacher (teacher_profile_id),
    INDEX idx_files_folder (folder_id),
    INDEX idx_files_user (uploaded_by_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### Option B — Preserve existing data (ALTER TABLE)

> Only use this if you have data worth keeping. Since `teacher_profile_id` is NOT NULL, you
> must supply a real `teacher_profiles.id` as the temporary default before removing the default.

```sql
-- Replace 'YOUR_TEACHER_PROFILE_ID_HERE' with an actual teacher_profiles.id from your DB
-- (SELECT id FROM teacher_profiles LIMIT 1;)

ALTER TABLE document_folders
  ADD COLUMN teacher_profile_id CHAR(36) NOT NULL
    DEFAULT 'YOUR_TEACHER_PROFILE_ID_HERE'
    AFTER name,
  ADD FOREIGN KEY idx_folders_teacher_fk (teacher_profile_id)
    REFERENCES teacher_profiles(id) ON DELETE CASCADE,
  ADD INDEX idx_folders_teacher (teacher_profile_id);

-- Remove the temporary default (column is now populated)
ALTER TABLE document_folders
  ALTER COLUMN teacher_profile_id DROP DEFAULT;

ALTER TABLE document_files
  ADD COLUMN teacher_profile_id CHAR(36) NOT NULL
    DEFAULT 'YOUR_TEACHER_PROFILE_ID_HERE'
    AFTER size_bytes,
  ADD FOREIGN KEY idx_files_teacher_fk (teacher_profile_id)
    REFERENCES teacher_profiles(id) ON DELETE CASCADE,
  ADD INDEX idx_files_teacher (teacher_profile_id);

ALTER TABLE document_files
  ALTER COLUMN teacher_profile_id DROP DEFAULT;
```

Verify with:
```sql
DESCRIBE document_folders;
DESCRIBE document_files;
```

Verify with:
```sql
SHOW TABLES LIKE 'document_%';
DESCRIBE document_folders;
DESCRIBE document_files;
```

---

## Announcements Feature — SQL

Run this single statement to add the announcements table (no Firebase needed — stored entirely in MySQL):

```sql
CREATE TABLE announcements (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    teacher_profile_id CHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_profile_id) REFERENCES teacher_profiles(id) ON DELETE CASCADE,
    INDEX idx_announcements_teacher (teacher_profile_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

Verify:
```sql
DESCRIBE announcements;
```

---

## Batches Feature — SQL

Run these four statements to create the batches tables:

```sql
CREATE TABLE batches (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    teacher_profile_id CHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    meeting_link TEXT NOT NULL,
    class_time TIME NOT NULL,
    duration_minutes INT NOT NULL DEFAULT 60,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_profile_id) REFERENCES teacher_profiles(id) ON DELETE CASCADE,
    INDEX idx_batches_teacher (teacher_profile_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE batch_students (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    batch_id CHAR(36) NOT NULL,
    student_user_id CHAR(36) NOT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE CASCADE,
    FOREIGN KEY (student_user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_batch_student (batch_id, student_user_id),
    INDEX idx_batch_students_batch (batch_id),
    INDEX idx_batch_students_student (student_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE batch_sessions (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    batch_id CHAR(36) NOT NULL,
    session_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE CASCADE,
    UNIQUE KEY unique_batch_date (batch_id, session_date),
    INDEX idx_sessions_batch (batch_id),
    INDEX idx_sessions_date (session_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE batch_attendance (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    session_id CHAR(36) NOT NULL,
    student_user_id CHAR(36) NOT NULL,
    status ENUM('present', 'absent', 'late') NOT NULL DEFAULT 'absent',
    marked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES batch_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (student_user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_attendance (session_id, student_user_id),
    INDEX idx_attendance_session (session_id),
    INDEX idx_attendance_student (student_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

Verify:
```sql
SHOW TABLES LIKE 'batch%';
DESCRIBE batches;
DESCRIBE batch_students;
DESCRIBE batch_sessions;
DESCRIBE batch_attendance;
```

---

## Step 2: Firebase Storage Setup (from scratch)

### 2.1 — Create or open your Firebase project

1. Go to [https://console.firebase.google.com](https://console.firebase.google.com)
2. Click **Add project** (or select an existing project)
3. Follow the wizard (you can skip Google Analytics)

### 2.2 — Enable Firebase Storage

1. In the left sidebar click **Build → Storage**
2. Click **Get started**
3. Choose a storage location (pick the one closest to your users, e.g. `us-central1`) — **this cannot be changed later**
4. Click **Done**

### 2.3 — Set Storage Security Rules to deny all public access

In the Storage section click the **Rules** tab and replace the default rules with:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

Click **Publish**. The backend uses the Admin SDK which bypasses these rules.

### 2.4 — Generate a service account private key

1. Click the gear icon (top-left) → **Project settings**
2. Click the **Service accounts** tab
3. Make sure **Node.js** is selected
4. Click **Generate new private key** → **Generate key**
5. A JSON file downloads — keep it safe, do not commit it to git

### 2.5 — Add values to backend/.env

Open the downloaded JSON file and copy values into `backend/.env`:

```
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEv...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your_client_id
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
FIREBASE_SIGNED_URL_EXPIRY_MINUTES=15
```

**Important for FIREBASE_PRIVATE_KEY:**
- Copy the entire `private_key` value from the JSON (including the `-----BEGIN...-----END-----` lines)
- Wrap it in double quotes in .env
- The actual newlines in the JSON become literal `\n` in the .env file — that is correct, the code handles it with `.replace(/\\n/g, '\n')`

### 2.6 — Configure CORS on the GCS bucket

The browser does a direct PUT to Google Cloud Storage. Without CORS that PUT is blocked.

1. Install the Google Cloud SDK if you haven't: [https://cloud.google.com/sdk/docs/install](https://cloud.google.com/sdk/docs/install)
2. Authenticate:
   ```bash
   gcloud auth login
   ```
3. Create a file called `cors.json` in any directory:
   ```json
   [
     {
       "origin": ["http://localhost:3000"],
       "method": ["PUT"],
       "responseHeader": ["Content-Type"],
       "maxAgeSeconds": 3600
     }
   ]
   ```
   For production add your real domain too:
   ```json
   [
     {
       "origin": ["http://localhost:3000", "https://yourdomain.com"],
       "method": ["PUT"],
       "responseHeader": ["Content-Type"],
       "maxAgeSeconds": 3600
     }
   ]
   ```
4. Apply the CORS config (replace with your actual bucket name from `FIREBASE_STORAGE_BUCKET`):
   ```bash
   gsutil cors set cors.json gs://your-project-id.appspot.com
   ```
5. Verify:
   ```bash
   gsutil cors get gs://your-project-id.appspot.com
   ```

### 2.7 — Install backend packages

```bash
cd backend
npm install firebase-admin uuid
npm install --save-dev @types/uuid
```

---

## Step 3: Verify Everything

After completing steps 1–2, run the backend and test with Postman:

1. `GET /api/documents/contents` — should return `{ folders: [], files: [], breadcrumb: [] }`
2. `POST /api/documents/folders` with body `{ "name": "Test Folder" }` — should return folder object
3. `POST /api/documents/files/upload-url` with body `{ "filename": "test.pdf", "mime_type": "application/pdf", "size_bytes": 1024 }` — should return `{ file_id, signed_url, storage_path }`
4. PUT to the `signed_url` with a file binary — should return 200 from GCS
5. `POST /api/documents/files` with the returned metadata — should create the file row in MySQL

---

## Notes

- `storage_path` in MySQL = the GCS object path used for deleting the file from Firebase
- `download_url` = used by the frontend to serve downloads; backend generates a fresh 15-min signed URL on each download request
- Folder deletion cascades: deleting a folder removes all subfolders and their contents from MySQL AND Firebase Storage
- Files whose folder is deleted are NOT deleted — they fall back to root level (`folder_id` becomes NULL)
