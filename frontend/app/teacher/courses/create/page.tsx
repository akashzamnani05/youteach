// app/teacher/courses/create/page.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { VideoUploadForm } from '@/components/VideoUploadForm';
import { courseApi } from '@/lib/course';
import { courseVideoApi } from '@/lib/courseVideo';
import { CourseModule } from '@/types/course.types';
import { CourseVideo } from '@/types/courseVideo.types';
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  Video, 
  Save,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  ExternalLink
} from 'lucide-react';

type Step = 'details' | 'modules' | 'preview';

export default function CreateCoursePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>('details');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Course Details
  const [courseId, setCourseId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('0');
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced' | 'all'>('all');
  const [language, setLanguage] = useState('English');
  const [requirements, setRequirements] = useState('');
  const [learningPoints, setLearningPoints] = useState<string[]>(['']);

  // Modules
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [newModuleDescription, setNewModuleDescription] = useState('');
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  // Videos
  const [moduleVideos, setModuleVideos] = useState<Record<string, CourseVideo[]>>({});
  const [uploadingForModule, setUploadingForModule] = useState<string | null>(null);

  // ========== COURSE DETAILS HANDLERS ==========

  const handleSaveCourse = async () => {
    if (!title.trim()) {
      setError('Course title is required');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const courseData = {
        title: title.trim(),
        short_description: shortDescription.trim() || undefined,
        description: description.trim() || undefined,
        price: parseFloat(price) || 0,
        level,
        language,
        requirements: requirements.trim() || undefined,
        what_you_will_learn: learningPoints.filter(p => p.trim()),
      };

      const course = await courseApi.createCourse(courseData);
      setCourseId(course.id);
      setCurrentStep('modules');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create course');
    } finally {
      setSaving(false);
    }
  };

  const addLearningPoint = () => {
    setLearningPoints([...learningPoints, '']);
  };

  const updateLearningPoint = (index: number, value: string) => {
    const updated = [...learningPoints];
    updated[index] = value;
    setLearningPoints(updated);
  };

  const removeLearningPoint = (index: number) => {
    setLearningPoints(learningPoints.filter((_, i) => i !== index));
  };

  // ========== MODULE HANDLERS ==========

  const handleCreateModule = async () => {
    if (!courseId || !newModuleTitle.trim()) {
      setError('Module title is required');
      return;
    }

    try {
      setError(null);
      const module = await courseApi.createModule({
        course_id: courseId,
        title: newModuleTitle.trim(),
        description: newModuleDescription.trim() || undefined,
        order_index: modules.length + 1,
      });

      setModules([...modules, module]);
      setNewModuleTitle('');
      setNewModuleDescription('');
      setExpandedModules(new Set([...expandedModules, module.id]));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create module');
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!window.confirm('Delete this module and all its videos?')) return;

    try {
      await courseApi.deleteModule(moduleId);
      setModules(modules.filter(m => m.id !== moduleId));
      delete moduleVideos[moduleId];
      setModuleVideos({ ...moduleVideos });
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete module');
    }
  };

  const toggleModuleExpanded = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
      // Fetch videos for this module if not already loaded
      if (!moduleVideos[moduleId]) {
        fetchModuleVideos(moduleId);
      }
    }
    setExpandedModules(newExpanded);
  };

  // ========== VIDEO HANDLERS ==========

  const fetchModuleVideos = async (moduleId: string) => {
    try {
      const videos = await courseVideoApi.getVideosByModule(moduleId);
      setModuleVideos({
        ...moduleVideos,
        [moduleId]: videos,
      });
    } catch (err: any) {
      console.error('Failed to fetch videos:', err);
    }
  };

  const handleVideoUploadSuccess = (moduleId: string) => {
    setUploadingForModule(null);
    fetchModuleVideos(moduleId);
  };

  const handleDeleteVideo = async (moduleId: string, videoId: string) => {
    if (!window.confirm('Delete this video from YouTube too?')) return;

    try {
      await courseVideoApi.deleteVideo(videoId);
      setModuleVideos({
        ...moduleVideos,
        [moduleId]: moduleVideos[moduleId]?.filter(v => v.id !== videoId) || [],
      });
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete video');
    }
  };

  // ========== RENDER ==========

  return (
    <DashboardLayout role="teacher">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create New Course</h1>
            <p className="text-gray-600 mt-1">
              {currentStep === 'details' && 'Step 1: Course Details'}
              {currentStep === 'modules' && 'Step 2: Add Modules & Videos'}
              {currentStep === 'preview' && 'Step 3: Preview & Publish'}
            </p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center space-x-4 mb-8">
        <div className={`flex items-center space-x-2 ${currentStep === 'details' ? 'text-blue-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'details' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
            1
          </div>
          <span className="font-medium">Details</span>
        </div>
        <div className="flex-1 h-0.5 bg-gray-200"></div>
        <div className={`flex items-center space-x-2 ${currentStep === 'modules' ? 'text-blue-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'modules' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
            2
          </div>
          <span className="font-medium">Modules</span>
        </div>
        <div className="flex-1 h-0.5 bg-gray-200"></div>
        <div className={`flex items-center space-x-2 ${currentStep === 'preview' ? 'text-blue-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'preview' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
            3
          </div>
          <span className="font-medium">Preview</span>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* STEP 1: COURSE DETAILS */}
      {currentStep === 'details' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Course Information</h2>
          
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="e.g., Complete Web Development Bootcamp"
                required
              />
            </div>

            {/* Short Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Short Description
              </label>
              <input
                type="text"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="Brief one-liner about the course"
                maxLength={200}
              />
              <p className="text-xs text-gray-500 mt-1">{shortDescription.length}/200 characters</p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="Detailed course description..."
                rows={6}
              />
            </div>

            {/* Price and Level */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price ($)
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Level
                </label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value as any)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                >
                  <option value="all">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Language
                </label>
                <input
                  type="text"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
              </div>
            </div>

            {/* Requirements */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Requirements
              </label>
              <textarea
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="What students need before taking this course..."
                rows={3}
              />
            </div>

            {/* What You'll Learn */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What You'll Learn
              </label>
              {learningPoints.map((point, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={point}
                    onChange={(e) => updateLearningPoint(index, e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder={`Learning point ${index + 1}`}
                  />
                  {learningPoints.length > 1 && (
                    <button
                      onClick={() => removeLearningPoint(index)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addLearningPoint}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center space-x-1"
              >
                <Plus className="w-4 h-4" />
                <span>Add learning point</span>
              </button>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <button
                onClick={handleSaveCourse}
                disabled={saving || !title.trim()}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                <Save className="w-5 h-5" />
                <span>{saving ? 'Saving...' : 'Save & Continue'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: MODULES & VIDEOS */}
      {currentStep === 'modules' && courseId && (
        <div className="space-y-6">
          {/* Add Module Form */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add New Module</h2>
            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  value={newModuleTitle}
                  onChange={(e) => setNewModuleTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="Module title (e.g., Introduction to React)"
                />
              </div>
              <div>
                <textarea
                  value={newModuleDescription}
                  onChange={(e) => setNewModuleDescription(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="Module description (optional)"
                  rows={2}
                />
              </div>
              <button
                onClick={handleCreateModule}
                disabled={!newModuleTitle.trim()}
                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>Add Module</span>
              </button>
            </div>
          </div>

          {/* Modules List */}
          {modules.length > 0 ? (
            <div className="space-y-4">
              {modules.map((module, index) => {
                const isExpanded = expandedModules.has(module.id);
                const videos = moduleVideos[module.id] || [];
                const isUploading = uploadingForModule === module.id;

                return (
                  <div key={module.id} className="bg-white rounded-lg shadow overflow-hidden">
                    {/* Module Header */}
                    <div
                      className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                      onClick={() => toggleModuleExpanded(module.id)}
                    >
                      <div className="flex items-center space-x-3">
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-gray-600" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-600" />
                        )}
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {index + 1}. {module.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {videos.length} {videos.length === 1 ? 'video' : 'videos'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteModule(module.id);
                        }}
                        className="text-red-600 hover:bg-red-50 p-2 rounded"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Module Content (Videos) */}
                    {isExpanded && (
                      <div className="p-4 border-t bg-gray-50">
                        {/* Upload Form */}
                        {isUploading ? (
                          <VideoUploadForm
                            moduleId={module.id}
                            onUploadSuccess={() => handleVideoUploadSuccess(module.id)}
                            onCancel={() => setUploadingForModule(null)}
                          />
                        ) : (
                          <button
                            onClick={() => setUploadingForModule(module.id)}
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mb-4"
                          >
                            <Video className="w-5 h-5" />
                            <span>Upload Video</span>
                          </button>
                        )}

                        {/* Videos List */}
                        {videos.length > 0 && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            {videos.map((video) => (
                              <div key={video.id} className="bg-white rounded-lg shadow overflow-hidden">
                                <div className="relative bg-gray-900 aspect-video">
                                  {video.youtube_video_id && (
                                    <img
                                      src={`https://img.youtube.com/vi/${video.youtube_video_id}/hqdefault.jpg`}
                                      alt={video.title}
                                      className="w-full h-full object-cover"
                                    />
                                  )}
                                  {video.is_free_preview && (
                                    <span className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs">
                                      Free Preview
                                    </span>
                                  )}
                                </div>
                                <div className="p-3">
                                  <h4 className="font-semibold text-sm mb-1">{video.title}</h4>
                                  <p className="text-xs text-gray-600 mb-2 line-clamp-1">
                                    {video.description}
                                  </p>
                                  <div className="flex gap-2">
                                    {video.youtube_video_id && (
                                      <a
                                        href={`https://www.youtube.com/watch?v=${video.youtube_video_id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 flex items-center justify-center gap-1 bg-red-600 text-white px-2 py-1 rounded text-xs"
                                      >
                                        <ExternalLink className="w-3 h-3" />
                                        YouTube
                                      </a>
                                    )}
                                    <button
                                      onClick={() => handleDeleteVideo(module.id, video.id)}
                                      className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">No modules yet</p>
              <p className="text-sm text-gray-500">
                Add your first module above to organize your course content
              </p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4">
            <button
              onClick={() => setCurrentStep('details')}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
            <button
              onClick={() => router.push('/teacher/courses')}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Finish & View Courses
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}