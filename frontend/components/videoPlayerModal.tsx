// components/course-videos/VideoPlayerModal.tsx

'use client';

import { X } from 'lucide-react';
import { CourseVideo } from '@/types/courseVideo.types';

interface VideoPlayerModalProps {
  video: CourseVideo;
  onClose: () => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  video,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75">
      <div className="relative w-full max-w-5xl bg-white rounded-lg shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex-1 mr-4">
            <h3 className="text-lg font-semibold text-gray-900">{video.title}</h3>
            {video.description && (
              <p className="text-sm text-gray-600 mt-1">{video.description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Video Player */}
        <div className="relative bg-black" style={{ paddingBottom: '56.25%' }}>
          {video.youtube_video_id ? (
           <iframe
  className="absolute top-0 left-0 w-full h-full"
  src={`https://www.youtube-nocookie.com/embed/${video.youtube_video_id}?autoplay=1&rel=0&modestbranding=1&showinfo=0&controls=1`}
  title={video.title}
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
  allowFullScreen
/>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-white">
              <p>Video not available</p>
            </div>
          )}
        </div>

        {/* Video Info */}
        <div className="p-4 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              {video.duration_minutes && (
                <span>
                  Duration:{' '}
                  {Math.floor(video.duration_minutes / 60) > 0
                    ? `${Math.floor(video.duration_minutes / 60)}h ${
                        video.duration_minutes % 60
                      }m`
                    : `${video.duration_minutes}m`}
                </span>
              )}
              {video.is_free_preview && (
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">
                  Free Preview
                </span>
              )}
            </div>
            {/* {video.youtube_video_id && (
              <a
                href={`https://www.youtube.com/watch?v=${video.youtube_video_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700"
              >
                Watch on YouTube →
              </a>
            )} */}
          </div>
        </div>
      </div>
    </div>
  );
};