// components/course-videos/VideoUploadForm.tsx

'use client';

import { useState, useEffect } from 'react';
import { courseVideoApi } from '../lib/courseVideo';
import { CreateVideoData, VideoUploadProgress } from '@/types/courseVideo.types';
import { Upload, X, Youtube, AlertCircle, Loader2 } from 'lucide-react';
import { googleOAuthApi } from '@/lib/google-oauth';
import Link from 'next/link';

interface VideoUploadFormProps {
  moduleId: string;
  onUploadSuccess: () => void;
  onCancel: () => void;
}

export const VideoUploadForm: React.FC<VideoUploadFormProps> = ({
  moduleId,
  onUploadSuccess,
  onCancel,
}) => {
  const [ytConnected, setYtConnected] = useState<boolean | null>(null); // null = loading
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [orderIndex, setOrderIndex] = useState(1);
  const [isFreePreview, setIsFreePreview] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<VideoUploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    googleOAuthApi.getStatus()
      .then(s => setYtConnected(s.connected))
      .catch(() => setYtConnected(false));
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (500MB limit)
      const maxSize = 500 * 1024 * 1024;
      if (file.size > maxSize) {
        setError('File size must be less than 500MB');
        return;
      }

      // Validate file type
      const validTypes = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/webm'];
      if (!validTypes.includes(file.type)) {
        setError('Please upload a valid video file (MP4, MPEG, MOV, or WebM)');
        return;
      }

      setVideoFile(file);
      setError(null);

      // Auto-fill title from filename if empty
      if (!title) {
        const filename = file.name.replace(/\.[^/.]+$/, ''); // Remove extension
        setTitle(filename);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!videoFile) {
      setError('Please select a video file');
      return;
    }

    if (!title.trim()) {
      setError('Please enter a video title');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const metadata: CreateVideoData = {
        module_id: moduleId,
        title: title.trim(),
        description: description.trim() || undefined,
        order_index: orderIndex,
        is_free_preview: isFreePreview,
      };

      await courseVideoApi.uploadVideo(videoFile, metadata, (progress) => {
        setUploadProgress(progress);
      });

      onUploadSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload video');
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Loading YouTube connection status
  if (ytConnected === null) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 flex items-center gap-3 text-gray-500">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>Checking YouTube connection...</span>
      </div>
    );
  }

  // YouTube not connected — show warning instead of form
  if (!ytConnected) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Upload Course Video</h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-yellow-800">YouTube account not connected</p>
            <p className="text-sm text-yellow-700 mt-1">
              You need to connect your YouTube channel before uploading videos.
            </p>
            <Link
              href="/teacher/settings"
              className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
            >
              <Youtube className="h-4 w-4" />
              Connect YouTube in Settings
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Upload Course Video</h2>
        <button
          onClick={onCancel}
          disabled={isUploading}
          className="text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Video File *
          </label>
          <input
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            disabled={isUploading}
            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
          />
          {videoFile && (
            <p className="mt-2 text-sm text-gray-600">
              Selected: {videoFile.name} ({formatFileSize(videoFile.size)})
            </p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Supported formats: MP4, MPEG, MOV, WebM (Max: 500MB)
          </p>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Video Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isUploading}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            placeholder="Enter video title"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isUploading}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            placeholder="Enter video description"
            rows={4}
          />
        </div>

        {/* Order Index */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Order Index
          </label>
          <input
            type="number"
            value={orderIndex}
            onChange={(e) => setOrderIndex(parseInt(e.target.value) || 1)}
            disabled={isUploading}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            min="1"
          />
          <p className="mt-1 text-xs text-gray-500">
            Order in which this video appears in the module
          </p>
        </div>

        {/* Free Preview */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="freePreview"
            checked={isFreePreview}
            onChange={(e) => setIsFreePreview(e.target.checked)}
            disabled={isUploading}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="freePreview" className="ml-2 text-sm text-gray-700">
            Allow free preview (visible to non-enrolled students)
          </label>
        </div>

        {/* Upload Progress */}
        {isUploading && uploadProgress && (
          <div>
            <div className="flex justify-between text-sm text-gray-700 mb-2">
              <span>Uploading...</span>
              <span>{uploadProgress.percentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress.percentage}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-gray-600">
              {formatFileSize(uploadProgress.loaded)} / {formatFileSize(uploadProgress.total)}
            </p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isUploading || !videoFile}
            className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            <Upload className="h-5 w-5" />
            <span>{isUploading ? 'Uploading...' : 'Upload Video'}</span>
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={isUploading}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};