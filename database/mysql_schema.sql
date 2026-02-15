-- ============================================
-- TEACHING PLATFORM DATABASE SCHEMA
-- MySQL 8.0+
-- Simplified Core Version
-- ============================================

-- ============================================
-- USERS & AUTHENTICATION
-- ============================================

CREATE TABLE users (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    profile_picture_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_email (email),
    INDEX idx_users_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TEACHER PROFILES
-- ============================================

CREATE TABLE teacher_profiles (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL UNIQUE,
    bio TEXT,
    headline VARCHAR(500),
    specializations JSON,
    experience_years INT,
    qualifications TEXT,
    website_slug VARCHAR(100) UNIQUE NOT NULL,
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_students INT DEFAULT 0,
    total_courses INT DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    hourly_rate DECIMAL(10,2),
    social_links JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_teacher_user_id (user_id),
    INDEX idx_teacher_slug (website_slug),
    INDEX idx_teacher_rating (rating DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- STUDENT PROFILES
-- ============================================

CREATE TABLE student_profiles (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL UNIQUE,
    date_of_birth DATE,
    interests JSON,
    education_level VARCHAR(50),
    bio TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_student_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- COURSES
-- ============================================

CREATE TABLE courses (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    teacher_id CHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT,
    short_description VARCHAR(500),
    thumbnail_url TEXT,
    trailer_youtube_id VARCHAR(50),
    price DECIMAL(10,2) DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'USD',
    level ENUM('beginner', 'intermediate', 'advanced', 'all') DEFAULT 'all',
    duration_hours DECIMAL(5,2),
    language VARCHAR(50) DEFAULT 'English',
    requirements TEXT,
    what_you_will_learn JSON,
    is_published BOOLEAN DEFAULT FALSE,
    enrollment_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES teacher_profiles(id) ON DELETE CASCADE,
    UNIQUE KEY unique_teacher_slug (teacher_id, slug),
    INDEX idx_courses_teacher (teacher_id),
    INDEX idx_courses_published (is_published),
    INDEX idx_courses_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- COURSE MODULES (Sections/Chapters)
-- ============================================

CREATE TABLE course_modules (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    course_id CHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    INDEX idx_modules_course (course_id),
    INDEX idx_modules_order (course_id, order_index)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- COURSE CONTENT (Videos, Documents, etc.)
-- ============================================

CREATE TABLE course_content (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    module_id CHAR(36) NOT NULL,
    content_type ENUM('video', 'document', 'quiz', 'assignment', 'text', 'link') NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    youtube_video_id VARCHAR(50),
    google_drive_file_id VARCHAR(100),
    content_url TEXT,
    text_content TEXT,
    duration_minutes INT,
    file_size_mb DECIMAL(10,2),
    order_index INT NOT NULL,
    is_free_preview BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (module_id) REFERENCES course_modules(id) ON DELETE CASCADE,
    INDEX idx_content_module (module_id),
    INDEX idx_content_order (module_id, order_index),
    INDEX idx_content_type (content_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- ENROLLMENTS
-- ============================================

CREATE TABLE enrollments (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    student_id CHAR(36) NOT NULL,
    course_id CHAR(36) NOT NULL,
    enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('active', 'completed', 'cancelled', 'suspended') DEFAULT 'active',
    progress_percentage DECIMAL(5,2) DEFAULT 0.00,
    last_accessed_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    certificate_issued BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE KEY unique_enrollment (student_id, course_id),
    INDEX idx_enrollments_student (student_id),
    INDEX idx_enrollments_course (course_id),
    INDEX idx_enrollments_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- STUDENT PROGRESS (Track video/content completion)
-- ============================================

CREATE TABLE student_progress (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    enrollment_id CHAR(36) NOT NULL,
    content_id CHAR(36) NOT NULL,
    status ENUM('not_started', 'in_progress', 'completed') DEFAULT 'not_started',
    time_spent_seconds INT DEFAULT 0,
    last_position_seconds INT DEFAULT 0,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE,
    FOREIGN KEY (content_id) REFERENCES course_content(id) ON DELETE CASCADE,
    UNIQUE KEY unique_progress (enrollment_id, content_id),
    INDEX idx_progress_enrollment (enrollment_id),
    INDEX idx_progress_content (content_id),
    INDEX idx_progress_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- WEBINARS / LIVE SESSIONS
-- ============================================

CREATE TABLE webinars (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    teacher_id CHAR(36) NOT NULL,
    course_id CHAR(36) NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    scheduled_at TIMESTAMP NOT NULL,
    duration_minutes INT NOT NULL,
    meeting_link TEXT,
    meeting_password VARCHAR(50),
    max_participants INT,
    is_recorded BOOLEAN DEFAULT FALSE,
    recording_youtube_id VARCHAR(50),
    status ENUM('scheduled', 'live', 'completed', 'cancelled') DEFAULT 'scheduled',
    reminder_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES teacher_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL,
    INDEX idx_webinars_teacher (teacher_id),
    INDEX idx_webinars_course (course_id),
    INDEX idx_webinars_scheduled (scheduled_at),
    INDEX idx_webinars_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- WEBINAR REGISTRATIONS
-- ============================================

CREATE TABLE webinar_registrations (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    webinar_id CHAR(36) NOT NULL,
    student_id CHAR(36) NOT NULL,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    attended BOOLEAN DEFAULT FALSE,
    attendance_duration_minutes INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (webinar_id) REFERENCES webinars(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE,
    UNIQUE KEY unique_registration (webinar_id, student_id),
    INDEX idx_webinar_reg_webinar (webinar_id),
    INDEX idx_webinar_reg_student (student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- SAMPLE DATA INSERTION (Optional - for testing)
-- ============================================

-- Sample User (Teacher)
INSERT INTO users (id, email, password_hash, full_name, phone) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'john.doe@example.com', '$2b$10$hash...', 'John Doe', '+1234567890');

-- Sample Teacher Profile
INSERT INTO teacher_profiles (id, user_id, bio, headline, specializations, website_slug, hourly_rate) VALUES
('550e8400-e29b-41d4-a716-446655440011', 
 '550e8400-e29b-41d4-a716-446655440001',
 'Experienced mathematics tutor with 10+ years of experience',
 'Expert Math Tutor - Making Math Easy',
 '["Algebra", "Calculus", "Geometry"]',
 'john-doe',
 50.00);

-- Sample User (Student)
INSERT INTO users (id, email, password_hash, full_name) VALUES
('550e8400-e29b-41d4-a716-446655440002', 'jane.smith@example.com', '$2b$10$hash...', 'Jane Smith');

-- Sample Student Profile
INSERT INTO student_profiles (id, user_id, interests, education_level) VALUES
('550e8400-e29b-41d4-a716-446655440022',
 '550e8400-e29b-41d4-a716-446655440002',
 '["Mathematics", "Programming", "Science"]',
 'High School');

-- Sample Course
INSERT INTO courses (id, teacher_id, title, slug, description, short_description, price, level, is_published) VALUES
('550e8400-e29b-41d4-a716-446655440033',
 '550e8400-e29b-41d4-a716-446655440011',
 'Complete Algebra Masterclass',
 'complete-algebra-masterclass',
 'Master algebra from basics to advanced topics with practical examples and exercises',
 'Learn algebra from scratch with an experienced tutor',
 49.99,
 'beginner',
 TRUE);

-- Sample Module
INSERT INTO course_modules (id, course_id, title, description, order_index) VALUES
('550e8400-e29b-41d4-a716-446655440044',
 '550e8400-e29b-41d4-a716-446655440033',
 'Introduction to Algebra',
 'Learn the fundamentals of algebraic expressions and equations',
 1);

-- Sample Content (Video)
INSERT INTO course_content (id, module_id, content_type, title, description, youtube_video_id, duration_minutes, order_index, is_free_preview) VALUES
('550e8400-e29b-41d4-a716-446655440055',
 '550e8400-e29b-41d4-a716-446655440044',
 'video',
 'What is Algebra?',
 'Introduction to algebraic concepts and their real-world applications',
 'dQw4w9WgXcQ',
 15,
 1,
 TRUE);

-- Sample Content (Document)
INSERT INTO course_content (id, module_id, content_type, title, description, google_drive_file_id, file_size_mb, order_index) VALUES
('550e8400-e29b-41d4-a716-446655440056',
 '550e8400-e29b-41d4-a716-446655440044',
 'document',
 'Algebra Basics - Study Guide',
 'Comprehensive study guide covering basic algebraic concepts',
 '1abc123def456ghi789jkl',
 2.5,
 2);




