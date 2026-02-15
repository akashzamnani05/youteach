// app/teacher/courses/[id]/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { VideoPlayerModal } from '@/components/videoPlayerModal';
import { courseApi } from '@/lib/course';
import { courseVideoApi } from '@/lib/courseVideo';
import { Course, CourseModule } from '@/types/course.types';
import { CourseVideo } from '@/types/courseVideo.types';
import {
  BookOpen,
  Edit,
  Trash2,
  ChevronDown,
  ChevronRight,
  Video,
  Clock,
  Users,
  DollarSign,
  Globe,
  CheckCircle,
  XCircle,
  PlayCircle,
  ArrowLeft,
  Eye,
  EyeOff,
} from 'lucide-react';

interface ModuleWithVideos extends CourseModule {
  videos: CourseVideo[];
  isExpanded?: boolean;
}

export default function CourseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params?.id as string;

  const [playingVideo, setPlayingVideo] = useState<CourseVideo | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<ModuleWithVideos[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingCourseId, setDeletingCourseId] = useState<string | null>(null);

  useEffect(() => {
    if (courseId) {
      fetchCourseData();
    }
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      setError(null);

      const courseData = await courseApi.getCourseById(courseId);
      setCourse(courseData);

      const modulesData = await courseApi.getModulesByCourse(courseId);

      const modulesWithVideos = await Promise.all(
        modulesData.map(async (module) => {
          const videos = await courseVideoApi.getVideosByModule(module.id);
          return {
            ...module,
            videos,
            isExpanded: true,
          };
        })
      );

      setModules(modulesWithVideos);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load course data');
    } finally {
      setLoading(false);
    }
  };

  const toggleModuleExpand = (moduleId: string) => {
    setModules(
      modules.map((m) =>
        m.id === moduleId ? { ...m, isExpanded: !m.isExpanded } : m
      )
    );
  };

  const handlePlayVideo = (video: CourseVideo) => {
    setPlayingVideo(video);
  };

  const handleTogglePublish = async () => {
    if (!course) return;

    try {
      await courseApi.togglePublish(course.id, !course.is_published);
      setCourse({ ...course, is_published: !course.is_published });
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update course status');
    }
  };

  const handleDeleteCourse = async () => {
    if (!course) return;

    if (!window.confirm(`Are you sure you want to delete "${course.title}"? This action cannot be undone and will delete all modules and videos.`)) {
      return;
    }

    try {
      setDeletingCourseId(course.id);
      await courseApi.deleteCourse(course.id);
      router.push('/teacher/courses');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete course');
      setDeletingCourseId(null);
    }
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (loading) {
    return (
      <DashboardLayout role="teacher">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !course) {
    return (
      <DashboardLayout role="teacher">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error || 'Course not found'}
        </div>
      </DashboardLayout>
    );
  }

  const totalVideos = modules.reduce((sum, m) => sum + m.videos.length, 0);
  const totalDuration = modules.reduce(
    (sum, m) => sum + m.videos.reduce((vSum, v) => vSum + (v.duration_minutes || 0), 0),
    0
  );

  return (
    <DashboardLayout role="teacher">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/teacher/courses')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Courses</span>
        </button>

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
            <div className="flex items-center space-x-4 mt-2">
              <span
                className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-semibold ${
                  course.is_published
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {course.is_published ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Published</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4" />
                    <span>Draft</span>
                  </>
                )}
              </span>
              <span className="text-sm text-gray-600 capitalize bg-gray-100 px-3 py-1 rounded-full">
                {course.level}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleTogglePublish}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                course.is_published
                  ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {course.is_published ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              <span>{course.is_published ? 'Unpublish' : 'Publish'}</span>
            </button>
            <button
              onClick={() => router.push(`/teacher/courses/${course.id}/edit`)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit className="h-5 w-5" />
              <span>Edit Course</span>
            </button>
            <button
  onClick={() => router.push(`/teacher/courses/${course.id}/students`)}
  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
>
  <Users className="h-5 w-5" />
  <span>View Students</span>
</button>
            <button
              onClick={handleDeleteCourse}
              disabled={deletingCourseId === course.id}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="h-5 w-5" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>

      {/* Course Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Course Image & Stats */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 aspect-video">
              {course.thumbnail_url ? (
                <img
                  src={course.thumbnail_url}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <BookOpen className="w-20 h-20 text-white opacity-50" />
                </div>
              )}
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between text-gray-700">
                <span className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-gray-500" />
                  <span className="text-sm">Students</span>
                </span>
                <span className="font-semibold text-gray-900">{course.enrollment_count}</span>
              </div>

              <div className="flex items-center justify-between text-gray-700">
                <span className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5 text-gray-500" />
                  <span className="text-sm">Price</span>
                </span>
                <span className="font-semibold text-gray-900">
                  ${course.price} {course.currency}
                </span>
              </div>

              <div className="flex items-center justify-between text-gray-700">
                <span className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-gray-500" />
                  <span className="text-sm">Duration</span>
                </span>
                <span className="font-semibold text-gray-900">
                  {course.duration_hours ? `${course.duration_hours}h` : formatDuration(totalDuration)}
                </span>
              </div>

              <div className="flex items-center justify-between text-gray-700">
                <span className="flex items-center space-x-2">
                  <Globe className="w-5 h-5 text-gray-500" />
                  <span className="text-sm">Language</span>
                </span>
                <span className="font-semibold text-gray-900">{course.language}</span>
              </div>

              <div className="flex items-center justify-between text-gray-700">
                <span className="flex items-center space-x-2">
                  <Video className="w-5 h-5 text-gray-500" />
                  <span className="text-sm">Total Videos</span>
                </span>
                <span className="font-semibold text-gray-900">{totalVideos}</span>
              </div>

              <div className="flex items-center justify-between text-gray-700">
                <span className="flex items-center space-x-2">
                  <BookOpen className="w-5 h-5 text-gray-500" />
                  <span className="text-sm">Modules</span>
                </span>
                <span className="font-semibold text-gray-900">{modules.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Course Details */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Course Description</h2>
            
            {course.short_description && (
              <p className="text-gray-700 mb-4 font-medium">{course.short_description}</p>
            )}

            {course.description && (
              <div className="text-gray-600 mb-6 whitespace-pre-line">
                {course.description}
              </div>
            )}

            {course.what_you_will_learn && course.what_you_will_learn.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  What You'll Learn
                </h3>
                <ul className="space-y-2">
                  {course.what_you_will_learn.map((item, index) => (
                    <li key={index} className="flex items-start space-x-2 text-gray-700">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {course.requirements && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Requirements</h3>
                <p className="text-gray-600 whitespace-pre-line">{course.requirements}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Course Content</h2>
        </div>

        {modules.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-xl text-gray-500 mb-2">No modules yet</p>
            <p className="text-gray-400 mb-6">
              Go to edit mode to start adding modules and content
            </p>
            <button
              onClick={() => router.push(`/teacher/courses/${course.id}/edit`)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Edit Course
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {modules.map((module, moduleIndex) => (
              <div
                key={module.id}
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                {/* Module Header */}
                <div className="bg-gray-50 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      <button
                        onClick={() => toggleModuleExpand(module.id)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        {module.isExpanded ? (
                          <ChevronDown className="h-5 w-5" />
                        ) : (
                          <ChevronRight className="h-5 w-5" />
                        )}
                      </button>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Module {moduleIndex + 1}: {module.title}
                        </h3>
                        {module.description && (
                          <p className="text-sm text-gray-600 mt-1">{module.description}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-2">
                          {module.videos.length} videos •{' '}
                          {formatDuration(
                            module.videos.reduce((sum, v) => sum + (v.duration_minutes || 0), 0)
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Module Videos */}
                {module.isExpanded && (
                  <div className="p-4">
                    {module.videos.length === 0 ? (
                      <div className="text-center py-8">
                        <Video className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">No videos in this module</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {module.videos.map((video, videoIndex) => (
                          <div
                            key={video.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex items-center space-x-3 flex-1">
                              <button
                                onClick={() => handlePlayVideo(video)}
                                className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                              >
                                <PlayCircle className="h-6 w-6" />
                              </button>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => handlePlayVideo(video)}
                                    className="font-medium text-gray-900 hover:text-blue-600 transition-colors text-left"
                                  >
                                    {videoIndex + 1}. {video.title}
                                  </button>
                                  {video.is_free_preview && (
                                    <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                                      Free Preview
                                    </span>
                                  )}
                                </div>
                                {video.description && (
                                  <p className="text-sm text-gray-600 mt-1">{video.description}</p>
                                )}
                                <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                                  <span className="flex items-center space-x-1">
                                    <Clock className="h-3 w-3" />
                                    <span>{formatDuration(video.duration_minutes)}</span>
                                  </span>
                                  {video.youtube_video_id && (
                                    <span className="text-blue-600">YouTube ID: {video.youtube_video_id}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Video Player Modal */}
      {playingVideo && (
        <VideoPlayerModal
          video={playingVideo}
          onClose={() => setPlayingVideo(null)}
        />
      )}
    </DashboardLayout>
  );
}