// app/teacher/courses/[id]/edit/page.tsx
// COMPLETE VERSION WITH DRAG & DROP

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { VideoUploadForm } from '@/components/VideoUploadForm';
import { VideoPlayerModal } from '@/components/videoPlayerModal';
import { courseApi } from '@/lib/course';
import { courseVideoApi } from '@/lib/courseVideo';
import { Course, CourseModule } from '@/types/course.types';
import { CourseVideo } from '@/types/courseVideo.types';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  BookOpen,
  Edit,
  Trash2,
  Plus,
  ChevronDown,
  ChevronRight,
  Video,
  Clock,
  ArrowLeft,
  Save,
  X,
  PlayCircle,
  Eye,
  GripVertical,
  ImagePlus,
  ChevronUp,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ModuleWithVideos extends CourseModule {
  videos: CourseVideo[];
  isExpanded?: boolean;
}

// Sortable Module Component
function SortableModule({ 
  module, 
  moduleIndex, 
  isExpanded, 
  editingModuleId,
  moduleFormData,
  deletingModuleId,
  onToggleExpand,
  onEdit,
  onDelete,
  onAddVideo,
  onUpdateModule,
  onCancelEdit,
  onFormChange,
  children 
}: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: module.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-gray-50 p-4">
        {editingModuleId === module.id ? (
          <form onSubmit={onUpdateModule} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Module Title *
              </label>
              <input
                type="text"
                value={moduleFormData.title}
                onChange={(e) => onFormChange({ ...moduleFormData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={moduleFormData.description}
                onChange={(e) => onFormChange({ ...moduleFormData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                rows={2}
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Save className="h-4 w-4" />
                <span>Save Changes</span>
              </button>
              <button
                type="button"
                onClick={onCancelEdit}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                <X className="h-4 w-4" />
                <span>Cancel</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1">
              <button
                onClick={onToggleExpand}
                className="text-gray-600 hover:text-gray-900"
              >
                {isExpanded ? (
                  <ChevronDown className="h-5 w-5" />
                ) : (
                  <ChevronRight className="h-5 w-5" />
                )}
              </button>
              <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing"
              >
                <GripVertical className="h-5 w-5 text-gray-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  Module {moduleIndex + 1}: {module.title}
                </h3>
                {module.description && (
                  <p className="text-sm text-gray-600 mt-1">{module.description}</p>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  {module.videos.length} videos
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={onAddVideo}
                className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
              >
                <Plus className="h-4 w-4" />
                <span>Add Video</span>
              </button>
              <button
                onClick={onEdit}
                className="p-2 text-gray-600 hover:bg-gray-200 rounded transition-colors"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={onDelete}
                disabled={deletingModuleId === module.id}
                className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {isExpanded && editingModuleId !== module.id && children}
    </div>
  );
}

// Sortable Video Component
function SortableVideo({
  video,
  videoIndex,
  editingVideoId,
  videoFormData,
  deletingVideoId,
  onPlay,
  onEdit,
  onDelete,
  onUpdateVideo,
  onCancelEdit,
  onFormChange,
}: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: video.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      {editingVideoId === video.id ? (
        <form onSubmit={onUpdateVideo} className="w-full space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Video Title *
              </label>
              <input
                type="text"
                value={videoFormData.title}
                onChange={(e) => onFormChange({ ...videoFormData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (minutes)
              </label>
              <input
                type="number"
                value={videoFormData.duration_minutes}
                onChange={(e) => onFormChange({ ...videoFormData, duration_minutes: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 text-sm"
                min="0"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={videoFormData.description}
              onChange={(e) => onFormChange({ ...videoFormData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 text-sm"
              rows={2}
            />
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id={`free-preview-${video.id}`}
              checked={videoFormData.is_free_preview}
              onChange={(e) => onFormChange({ ...videoFormData, is_free_preview: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor={`free-preview-${video.id}`} className="text-sm text-gray-700">
              Free Preview
            </label>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
            >
              <Save className="h-4 w-4" />
              <span>Save</span>
            </button>
            <button
              type="button"
              onClick={onCancelEdit}
              className="flex items-center space-x-1 px-3 py-1.5 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors text-sm"
            >
              <X className="h-4 w-4" />
              <span>Cancel</span>
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="flex items-center space-x-3 flex-1">
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing"
            >
              <GripVertical className="h-5 w-5 text-gray-400" />
            </div>
            <button
              onClick={onPlay}
              className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
            >
              <PlayCircle className="h-6 w-6" />
            </button>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-900">
                  {videoIndex + 1}. {video.title}
                </span>
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

          <div className="flex items-center space-x-2">
            <button
              onClick={onPlay}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
              title="Preview video"
            >
              <Eye className="h-4 w-4" />
            </button>
            <button
              onClick={onEdit}
              className="p-2 text-gray-600 hover:bg-gray-200 rounded transition-colors"
              title="Edit video"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={onDelete}
              disabled={deletingVideoId === video.id}
              className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Delete video"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function CourseEditPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params?.id as string;

  const [playingVideo, setPlayingVideo] = useState<CourseVideo | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<ModuleWithVideos[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Course details editing
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsSaving, setDetailsSaving] = useState(false);
  const [detailsTitle, setDetailsTitle] = useState('');
  const [detailsShortDesc, setDetailsShortDesc] = useState('');
  const [detailsDesc, setDetailsDesc] = useState('');
  const [detailsLevel, setDetailsLevel] = useState<'beginner' | 'intermediate' | 'advanced' | 'all'>('all');
  const [detailsLanguage, setDetailsLanguage] = useState('English');
  const [detailsRequirements, setDetailsRequirements] = useState('');
  const [detailsLearningPoints, setDetailsLearningPoints] = useState<string[]>(['']);
  const [detailsThumbnailFile, setDetailsThumbnailFile] = useState<File | null>(null);
  const [detailsThumbnailPreview, setDetailsThumbnailPreview] = useState<string | null>(null);
  const [detailsThumbnailUploading, setDetailsThumbnailUploading] = useState(false);
  
  // Drag state
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<'module' | 'video' | null>(null);
  
  // Edit states
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null);
  const [showAddModuleForm, setShowAddModuleForm] = useState(false);
  
  // Deletion states
  const [deletingVideoId, setDeletingVideoId] = useState<string | null>(null);
  const [deletingModuleId, setDeletingModuleId] = useState<string | null>(null);

  // Form states
  const [moduleFormData, setModuleFormData] = useState({
    title: '',
    description: '',
    order_index: 0,
  });

  const [videoFormData, setVideoFormData] = useState({
    title: '',
    description: '',
    duration_minutes: 0,
    is_free_preview: false,
  });

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

      // Pre-fill course details form
      setDetailsTitle(courseData.title);
      setDetailsShortDesc(courseData.short_description || '');
      setDetailsDesc(courseData.description || '');
      setDetailsLevel(courseData.level as any);
      setDetailsLanguage(courseData.language || 'English');
      setDetailsRequirements(courseData.requirements || '');
      const points = Array.isArray(courseData.what_you_will_learn) && courseData.what_you_will_learn.length > 0
        ? courseData.what_you_will_learn as string[]
        : [''];
      setDetailsLearningPoints(points);
      setDetailsThumbnailPreview(courseData.thumbnail_url || null);

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
      toast.error('Failed to load course data');
    } finally {
      setLoading(false);
    }
  };

  // Course details handlers
  const handleDetailsThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be less than 5MB'); return; }
    setDetailsThumbnailFile(file);
    setDetailsThumbnailPreview(URL.createObjectURL(file));
  };

  const removeDetailsThumbnail = () => {
    setDetailsThumbnailFile(null);
    if (detailsThumbnailPreview?.startsWith('blob:')) URL.revokeObjectURL(detailsThumbnailPreview);
    setDetailsThumbnailPreview(null);
  };

  const handleSaveCourseDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!detailsTitle.trim()) { toast.error('Course title is required'); return; }

    try {
      setDetailsSaving(true);

      let thumbnailUrl: string | undefined | null = undefined;
      if (detailsThumbnailFile) {
        setDetailsThumbnailUploading(true);
        thumbnailUrl = await courseApi.uploadThumbnail(detailsThumbnailFile);
        setDetailsThumbnailUploading(false);
        setDetailsThumbnailFile(null);
      } else if (detailsThumbnailPreview === null && course?.thumbnail_url) {
        // Teacher removed existing thumbnail
        thumbnailUrl = null;
      }

      const updateData: any = {
        title: detailsTitle.trim(),
        short_description: detailsShortDesc.trim() || undefined,
        description: detailsDesc.trim() || undefined,
        level: detailsLevel,
        language: detailsLanguage,
        requirements: detailsRequirements.trim() || undefined,
        what_you_will_learn: detailsLearningPoints.filter(p => p.trim()),
      };
      if (thumbnailUrl !== undefined) updateData.thumbnail_url = thumbnailUrl;

      const updated = await courseApi.updateCourse(courseId, updateData);
      setCourse(updated);
      toast.success('Course details saved');
      setDetailsOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save course details');
    } finally {
      setDetailsSaving(false);
      setDetailsThumbnailUploading(false);
    }
  };

  // Drag handlers
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    
    // Determine if dragging module or video
    const isModule = modules.some(m => m.id === active.id);
    setActiveType(isModule ? 'module' : 'video');
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) {
      setActiveId(null);
      setActiveType(null);
      return;
    }

    if (activeType === 'module') {
      // Reorder modules
      const oldIndex = modules.findIndex((m) => m.id === active.id);
      const newIndex = modules.findIndex((m) => m.id === over.id);

      if (oldIndex !== newIndex) {
        const newModules = arrayMove(modules, oldIndex, newIndex);
        
        // Update order_index for all modules
        const updatedModules = newModules.map((module, index) => ({
          ...module,
          order_index: index + 1,
        }));
        
        setModules(updatedModules);

        // Save to backend
        try {
          const moduleOrders = updatedModules.map((m) => ({
            id: m.id,
            order_index: m.order_index,
          }));
          await courseApi.reorderModules(courseId, moduleOrders);
          toast.success('Modules reordered successfully');
        } catch (err: any) {
          toast.error('Failed to reorder modules');
          fetchCourseData(); // Revert on error
        }
      }
    } else if (activeType === 'video') {
      // Reorder videos within module
      const moduleIndex = modules.findIndex((m) =>
        m.videos.some((v) => v.id === active.id)
      );

      if (moduleIndex !== -1) {
        const module = modules[moduleIndex];
        const oldIndex = module.videos.findIndex((v) => v.id === active.id);
        const newIndex = module.videos.findIndex((v) => v.id === over.id);

        if (oldIndex !== newIndex) {
          const newVideos = arrayMove(module.videos, oldIndex, newIndex);
          
          // Update order_index for all videos
          const updatedVideos = newVideos.map((video, index) => ({
            ...video,
            order_index: index + 1,
          }));

          const newModules = [...modules];
          newModules[moduleIndex] = {
            ...module,
            videos: updatedVideos,
          };
          
          setModules(newModules);

          // Save to backend
          try {
            const videoOrders = updatedVideos.map((v) => ({
              id: v.id,
              order_index: v.order_index,
            }));
            await courseVideoApi.reorderVideos(module.id, videoOrders);
            toast.success('Videos reordered successfully');
          } catch (err: any) {
            toast.error('Failed to reorder videos');
            fetchCourseData(); // Revert on error
          }
        }
      }
    }

    setActiveId(null);
    setActiveType(null);
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

  // Module CRUD operations
  const handleAddModuleClick = () => {
    setModuleFormData({
      title: '',
      description: '',
      order_index: modules.length + 1,
    });
    setShowAddModuleForm(true);
  };

  const handleCreateModule = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!moduleFormData.title.trim()) {
      toast.error('Module title is required');
      return;
    }

    try {
      await courseApi.createModule({
        course_id: courseId,
        ...moduleFormData,
      });
      toast.success('Module created successfully');
      setShowAddModuleForm(false);
      setModuleFormData({ title: '', description: '', order_index: 0 });
      fetchCourseData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create module');
    }
  };

  const handleEditModuleClick = (module: CourseModule) => {
    setEditingModuleId(module.id);
    setModuleFormData({
      title: module.title,
      description: module.description || '',
      order_index: module.order_index,
    });
  };

  const handleUpdateModule = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingModuleId) return;

    if (!moduleFormData.title.trim()) {
      toast.error('Module title is required');
      return;
    }

    try {
      await courseApi.updateModule(editingModuleId, moduleFormData);
      toast.success('Module updated successfully');
      setEditingModuleId(null);
      setModuleFormData({ title: '', description: '', order_index: 0 });
      fetchCourseData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update module');
    }
  };

  const handleDeleteModule = async (moduleId: string, moduleTitle: string) => {
    if (!window.confirm(`Are you sure you want to delete module "${moduleTitle}"? This will also delete all videos in this module.`)) {
      return;
    }

    try {
      setDeletingModuleId(moduleId);
      await courseApi.deleteModule(moduleId);
      toast.success('Module deleted successfully');
      fetchCourseData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete module');
    } finally {
      setDeletingModuleId(null);
    }
  };

  // Video CRUD operations
  const handleAddVideo = (moduleId: string) => {
    setSelectedModuleId(moduleId);
    setShowUploadForm(true);
  };

  const handleUploadSuccess = () => {
    setShowUploadForm(false);
    setSelectedModuleId(null);
    toast.success('Video uploaded successfully');
    fetchCourseData();
  };

  const handleEditVideoClick = (video: CourseVideo) => {
    setEditingVideoId(video.id);
    setVideoFormData({
      title: video.title,
      description: video.description || '',
      duration_minutes: video.duration_minutes || 0,
      is_free_preview: video.is_free_preview,
    });
  };

  const handleUpdateVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingVideoId) return;

    if (!videoFormData.title.trim()) {
      toast.error('Video title is required');
      return;
    }

    try {
      await courseVideoApi.updateVideo(editingVideoId, videoFormData);
      toast.success('Video updated successfully');
      setEditingVideoId(null);
      setVideoFormData({ title: '', description: '', duration_minutes: 0, is_free_preview: false });
      fetchCourseData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update video');
    }
  };

  const handleDeleteVideo = async (videoId: string, videoTitle: string) => {
    if (!window.confirm(`Are you sure you want to delete "${videoTitle}"?`)) {
      return;
    }

    try {
      setDeletingVideoId(videoId);
      await courseVideoApi.deleteVideo(videoId);
      toast.success('Video deleted successfully');
      fetchCourseData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete video');
    } finally {
      setDeletingVideoId(null);
    }
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

  if (showUploadForm && selectedModuleId) {
    return (
      <DashboardLayout role="teacher">
        <VideoUploadForm
          moduleId={selectedModuleId}
          onUploadSuccess={handleUploadSuccess}
          onCancel={() => {
            setShowUploadForm(false);
            setSelectedModuleId(null);
          }}
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="teacher">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push(`/teacher/courses/${courseId}`)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Course View</span>
        </button>

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit: {course.title}</h1>
            <p className="text-gray-600 mt-2">Drag and drop to reorder modules and videos</p>
          </div>

          <button
            onClick={() => router.push(`/teacher/courses/${course.id}`)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Eye className="h-5 w-5" />
            <span>View Mode</span>
          </button>
        </div>
      </div>

      {/* Course Details Editor */}
      <div className="bg-white rounded-lg shadow-md mb-6 overflow-hidden">
        <button
          onClick={() => setDetailsOpen(!detailsOpen)}
          className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Edit className="h-5 w-5 text-blue-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Course Details</h2>
              <p className="text-sm text-gray-500 mt-0.5">Edit title, description, thumbnail, and more</p>
            </div>
          </div>
          {detailsOpen ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
        </button>

        {detailsOpen && (
          <form onSubmit={handleSaveCourseDetails} className="px-6 pb-6 border-t border-gray-100">
            <div className="space-y-5 mt-5">

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course Title *</label>
                <input
                  type="text"
                  value={detailsTitle}
                  onChange={e => setDetailsTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  required
                />
              </div>

              {/* Short Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
                <input
                  type="text"
                  value={detailsShortDesc}
                  onChange={e => setDetailsShortDesc(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  maxLength={200}
                />
              </div>

              {/* Thumbnail */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Thumbnail <span className="text-gray-400 font-normal">(optional, max 5MB)</span>
                </label>
                {detailsThumbnailPreview ? (
                  <div className="relative w-full max-w-xs">
                    <img src={detailsThumbnailPreview} alt="Thumbnail" className="w-full h-48 object-cover rounded-lg border border-gray-300" />
                    <button type="button" onClick={removeDetailsThumbnail} className="absolute top-2 right-2 bg-white rounded-full p-1 shadow hover:bg-red-50 text-gray-600 hover:text-red-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full max-w-xs h-36 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                    <ImagePlus className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">Click to upload image</span>
                    <span className="text-xs text-gray-400 mt-1">JPEG, PNG, WebP</span>
                    <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp" onChange={handleDetailsThumbnailChange} className="hidden" />
                  </label>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Description</label>
                <textarea
                  value={detailsDesc}
                  onChange={e => setDetailsDesc(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  rows={5}
                />
              </div>

              {/* Level / Language */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                  <select
                    value={detailsLevel}
                    onChange={e => setDetailsLevel(e.target.value as any)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  >
                    <option value="all">All Levels</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                  <input
                    type="text"
                    value={detailsLanguage}
                    onChange={e => setDetailsLanguage(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                </div>
              </div>

              {/* Requirements */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Requirements</label>
                <textarea
                  value={detailsRequirements}
                  onChange={e => setDetailsRequirements(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  rows={3}
                />
              </div>

              {/* What You'll Learn */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">What You'll Learn</label>
                {detailsLearningPoints.map((point, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={point}
                      onChange={e => {
                        const updated = [...detailsLearningPoints];
                        updated[index] = e.target.value;
                        setDetailsLearningPoints(updated);
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      placeholder={`Learning point ${index + 1}`}
                    />
                    {detailsLearningPoints.length > 1 && (
                      <button type="button" onClick={() => setDetailsLearningPoints(detailsLearningPoints.filter((_, i) => i !== index))} className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={() => setDetailsLearningPoints([...detailsLearningPoints, ''])} className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 mt-1">
                  <Plus className="w-4 h-4" />
                  Add learning point
                </button>
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={detailsSaving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {detailsThumbnailUploading ? 'Uploading thumbnail...' : detailsSaving ? 'Saving...' : 'Save Course Details'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* Course Content Editor */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Course Content</h2>
          <button
            onClick={handleAddModuleClick}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>Add Module</span>
          </button>
        </div>

        {/* Add Module Form */}
        {showAddModuleForm && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Module</h3>
            <form onSubmit={handleCreateModule} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Module Title *
                </label>
                <input
                  type="text"
                  value={moduleFormData.title}
                  onChange={(e) => setModuleFormData({ ...moduleFormData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="e.g., Introduction to React"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={moduleFormData.description}
                  onChange={(e) => setModuleFormData({ ...moduleFormData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="Brief description of this module"
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Save className="h-5 w-5" />
                  <span>Create Module</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModuleForm(false);
                    setModuleFormData({ title: '', description: '', order_index: 0 });
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  <X className="h-5 w-5" />
                  <span>Cancel</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {modules.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-xl text-gray-500 mb-2">No modules yet</p>
            <p className="text-gray-400 mb-6">
              Create your first module to start organizing course content
            </p>
            <button
              onClick={handleAddModuleClick}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Create First Module
            </button>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={modules.map((m) => m.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {modules.map((module, moduleIndex) => (
                  <SortableModule
                    key={module.id}
                    module={module}
                    moduleIndex={moduleIndex}
                    isExpanded={module.isExpanded}
                    editingModuleId={editingModuleId}
                    moduleFormData={moduleFormData}
                    deletingModuleId={deletingModuleId}
                    onToggleExpand={() => toggleModuleExpand(module.id)}
                    onEdit={() => handleEditModuleClick(module)}
                    onDelete={() => handleDeleteModule(module.id, module.title)}
                    onAddVideo={() => handleAddVideo(module.id)}
                    onUpdateModule={handleUpdateModule}
                    onCancelEdit={() => {
                      setEditingModuleId(null);
                      setModuleFormData({ title: '', description: '', order_index: 0 });
                    }}
                    onFormChange={setModuleFormData}
                  >
                    <div className="p-4">
                      {module.videos.length === 0 ? (
                        <div className="text-center py-8">
                          <Video className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                          <p className="text-gray-500 text-sm mb-3">No videos in this module</p>
                          <button
                            onClick={() => handleAddVideo(module.id)}
                            className="text-sm text-blue-600 hover:text-blue-700"
                          >
                            Add first video
                          </button>
                        </div>
                      ) : (
                        <SortableContext
                          items={module.videos.map((v) => v.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          <div className="space-y-2">
                            {module.videos.map((video, videoIndex) => (
                              <SortableVideo
                                key={video.id}
                                video={video}
                                videoIndex={videoIndex}
                                editingVideoId={editingVideoId}
                                videoFormData={videoFormData}
                                deletingVideoId={deletingVideoId}
                                onPlay={() => handlePlayVideo(video)}
                                onEdit={() => handleEditVideoClick(video)}
                                onDelete={() => handleDeleteVideo(video.id, video.title)}
                                onUpdateVideo={handleUpdateVideo}
                                onCancelEdit={() => {
                                  setEditingVideoId(null);
                                  setVideoFormData({ title: '', description: '', duration_minutes: 0, is_free_preview: false });
                                }}
                                onFormChange={setVideoFormData}
                              />
                            ))}
                          </div>
                        </SortableContext>
                      )}
                    </div>
                  </SortableModule>
                ))}
              </div>
            </SortableContext>

            <DragOverlay>
              {activeId && activeType === 'module' && (
                <div className="bg-white border-2 border-blue-500 rounded-lg p-4 shadow-lg opacity-90">
                  <div className="flex items-center space-x-3">
                    <GripVertical className="h-5 w-5 text-gray-400" />
                    <span className="font-semibold text-gray-900">
                      {modules.find((m) => m.id === activeId)?.title}
                    </span>
                  </div>
                </div>
              )}
              {activeId && activeType === 'video' && (
                <div className="bg-white border-2 border-blue-500 rounded-lg p-3 shadow-lg opacity-90">
                  <div className="flex items-center space-x-3">
                    <GripVertical className="h-5 w-5 text-gray-400" />
                    <PlayCircle className="h-6 w-6 text-blue-600" />
                    <span className="font-medium text-gray-900">
                      {modules
                        .flatMap((m) => m.videos)
                        .find((v) => v.id === activeId)?.title}
                    </span>
                  </div>
                </div>
              )}
            </DragOverlay>
          </DndContext>
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