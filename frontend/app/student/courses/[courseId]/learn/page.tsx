// app/student/courses/[courseId]/learn/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ChevronLeft, 
  ChevronRight, 
  PlayCircle, 
  FileText, 
  CheckCircle,
  Menu,
  X
} from 'lucide-react';
import { 
  getCourseById, 
  getFullCourseContent, 
  updateLastAccessed,
} from '@/lib/student-course';
import { toast } from 'react-hot-toast';
import { CourseWithEnrollment } from '@/types/course-student';

export default function CourseLearningPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;

  const [course, setCourse] = useState<CourseWithEnrollment | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [allContent, setAllContent] = useState<{ [moduleId: string]: Content[] }>({});
  const [currentContent, setCurrentContent] = useState<Content | null>(null);
  const [currentModule, setCurrentModule] = useState<Module | null>(null);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [completedContent, setCompletedContent] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (courseId) {
      fetchCourseData();
      updateLastAccessed(courseId); // Track that student accessed the course
    }
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      
      // Fetch course details
      const courseData = await getCourseById(courseId);
      setCourse(courseData);

      // Fetch full course content (modules with content)
      const modulesWithContent = await getFullCourseContent(courseId);
      
      // Separate modules and content
      const modulesData = modulesWithContent.map(m => ({
        id: m.id,
        course_id: m.course_id,
        title: m.title,
        description: m.description || '',
        order_index: m.order_index,
        created_at: m.created_at,
        updated_at: m.updated_at,
      }));
      
      setModules(modulesData);

      // Organize content by module
      const contentByModule: { [moduleId: string]: Content[] } = {};
      modulesWithContent.forEach((module) => {
        contentByModule[module.id] = module.content.sort((a, b) => a.order_index - b.order_index);
      });
      
      setAllContent(contentByModule);

      // Auto-expand first module and select first content
      if (modulesData.length > 0) {
        const firstModule = modulesData[0];
        setExpandedModules(new Set([firstModule.id]));
        setCurrentModule(firstModule);
        
        if (contentByModule[firstModule.id]?.length > 0) {
          setCurrentContent(contentByModule[firstModule.id][0]);
        }
      }
    } catch (error: any) {
      console.error('Error fetching course data:', error);
      toast.error(error.response?.data?.message || 'Failed to load course');
      
      // If user is not enrolled, redirect back
      if (error.response?.status === 403) {
        router.push('/student/courses');
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const selectContent = (content: Content, module: Module) => {
    setCurrentContent(content);
    setCurrentModule(module);
  };

  const markAsComplete = (contentId: string) => {
    const newCompleted = new Set(completedContent);
    newCompleted.add(contentId);
    setCompletedContent(newCompleted);
    // TODO: Call API to save progress
  };

  const getNextContent = () => {
    if (!currentContent || !currentModule) return null;

    const currentModuleContent = allContent[currentModule.id] || [];
    const currentIndex = currentModuleContent.findIndex(c => c.id === currentContent.id);

    // Check if there's next content in current module
    if (currentIndex < currentModuleContent.length - 1) {
      return {
        content: currentModuleContent[currentIndex + 1],
        module: currentModule
      };
    }

    // Check if there's a next module
    const currentModuleIndex = modules.findIndex(m => m.id === currentModule.id);
    if (currentModuleIndex < modules.length - 1) {
      const nextModule = modules[currentModuleIndex + 1];
      const nextModuleContent = allContent[nextModule.id] || [];
      if (nextModuleContent.length > 0) {
        return {
          content: nextModuleContent[0],
          module: nextModule
        };
      }
    }

    return null;
  };

  const getPreviousContent = () => {
    if (!currentContent || !currentModule) return null;

    const currentModuleContent = allContent[currentModule.id] || [];
    const currentIndex = currentModuleContent.findIndex(c => c.id === currentContent.id);

    // Check if there's previous content in current module
    if (currentIndex > 0) {
      return {
        content: currentModuleContent[currentIndex - 1],
        module: currentModule
      };
    }

    // Check if there's a previous module
    const currentModuleIndex = modules.findIndex(m => m.id === currentModule.id);
    if (currentModuleIndex > 0) {
      const prevModule = modules[currentModuleIndex - 1];
      const prevModuleContent = allContent[prevModule.id] || [];
      if (prevModuleContent.length > 0) {
        return {
          content: prevModuleContent[prevModuleContent.length - 1],
          module: prevModule
        };
      }
    }

    return null;
  };

  const goToNext = () => {
    const next = getNextContent();
    if (next) {
      selectContent(next.content, next.module);
      if (currentContent) {
        markAsComplete(currentContent.id);
      }
    }
  };

  const goToPrevious = () => {
    const prev = getPreviousContent();
    if (prev) {
      selectContent(prev.content, prev.module);
    }
  };

  const renderContentIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <PlayCircle className="h-4 w-4" />;
      case 'document':
      case 'text':
        return <FileText className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const renderVideoPlayer = () => {
    if (!currentContent) return null;

    if (currentContent.content_type === 'video' && currentContent.youtube_video_id) {
      return (
        <div className="relative pb-[56.25%] h-0">
          <iframe
            className="absolute top-0 left-0 w-full h-full"
            src={`https://www.youtube.com/embed/${currentContent.youtube_video_id}?rel=0`}
            title={currentContent.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }

    if (currentContent.content_type === 'text' && currentContent.text_content) {
      return (
        <div className="p-8 bg-white">
          <div className="prose max-w-none text-gray-900" dangerouslySetInnerHTML={{ __html: currentContent.text_content }} />
        </div>
      );
    }

    return (
      <div className="aspect-video bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg">Content type: {currentContent.content_type}</p>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'mr-96' : 'mr-0'}`}>
        {/* Top Navigation */}
        <div className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/student/courses')}
              className="hover:bg-gray-800 p-2 rounded"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-semibold truncate max-w-md">{course?.title}</h1>
          </div>
          
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden hover:bg-gray-800 p-2 rounded"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Video Player */}
        <div className="bg-black">
          {renderVideoPlayer()}
        </div>

        {/* Content Navigation */}
        <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
          <button
            onClick={goToPrevious}
            disabled={!getPreviousContent()}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-900 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Previous</span>
          </button>

          {currentContent && (
            <button
              onClick={() => markAsComplete(currentContent.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${
                completedContent.has(currentContent.id)
                  ? 'bg-green-100 text-green-700'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              <CheckCircle className="h-4 w-4" />
              <span>{completedContent.has(currentContent.id) ? 'Completed' : 'Mark as Complete'}</span>
            </button>
          )}

          <button
            onClick={goToNext}
            disabled={!getNextContent()}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
          >
            <span>Next</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Content Details */}
        <div className="flex-1 overflow-y-auto p-6">
          {currentContent && (
            <div className="max-w-4xl">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{currentContent.title}</h2>
              
              {currentContent.description && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">About this lesson</h3>
                  <p className="text-gray-700 leading-relaxed">{currentContent.description}</p>
                </div>
              )}

              {course?.description && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Course Description</h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{course.description}</p>
                </div>
              )}

              {course?.what_you_will_learn && course.what_you_will_learn.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">What you'll learn</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {course.what_you_will_learn.map((item, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Sidebar - Course Content */}
      <div className={`fixed right-0 top-0 h-screen w-96 bg-white border-l shadow-lg transform transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : 'translate-x-full'
      } overflow-y-auto`}>
        <div className="sticky top-0 bg-white border-b px-6 py-4 z-10">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900">Course Content</h3>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden hover:bg-gray-100 p-2 rounded"
            >
              <X className="h-5 w-5 text-gray-900" />
            </button>
          </div>
          <p className="text-sm text-gray-600">
            {modules.length} sections • {Object.values(allContent).flat().length} lectures
          </p>
        </div>

        <div className="pb-6">
          {modules.map((module) => {
            const moduleContent = allContent[module.id] || [];
            const isExpanded = expandedModules.has(module.id);
            const completedCount = moduleContent.filter(c => completedContent.has(c.id)).length;

            return (
              <div key={module.id} className="border-b">
                <button
                  onClick={() => toggleModule(module.id)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">{module.title}</h4>
                    <p className="text-xs text-gray-600">
                      {completedCount}/{moduleContent.length} completed • {moduleContent.length} lectures
                    </p>
                  </div>
                  <ChevronRight className={`h-5 w-5 text-gray-400 transition-transform ${
                    isExpanded ? 'rotate-90' : ''
                  }`} />
                </button>

                {isExpanded && (
                  <div className="bg-gray-50">
                    {moduleContent.map((content) => {
                      const isActive = currentContent?.id === content.id;
                      const isCompleted = completedContent.has(content.id);

                      return (
                        <button
                          key={content.id}
                          onClick={() => selectContent(content, module)}
                          className={`w-full px-6 py-3 flex items-center gap-3 hover:bg-gray-100 transition-colors text-left ${
                            isActive ? 'bg-purple-50 border-l-4 border-purple-600' : ''
                          }`}
                        >
                          <div className={`flex-shrink-0 ${
                            isActive ? 'text-purple-600' : 'text-gray-400'
                          }`}>
                            {renderContentIcon(content.content_type)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium truncate ${
                              isActive ? 'text-purple-600' : 'text-gray-900'
                            }`}>
                              {content.title}
                            </p>
                            {content.duration_minutes && (
                              <p className="text-xs text-gray-500">
                                {content.duration_minutes} min
                              </p>
                            )}
                          </div>

                          {isCompleted && (
                            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                          )}
                          
                          {content.is_free_preview && !isCompleted && (
                            <span className="text-xs text-purple-600 font-medium flex-shrink-0">
                              Preview
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}