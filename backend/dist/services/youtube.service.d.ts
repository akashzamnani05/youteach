import { VideoUploadMetadata, YouTubeUploadResponse } from '../types/course-video.types';
export declare class YouTubeService {
    static uploadVideo(filePath: string, metadata: VideoUploadMetadata, teacherProfileId: string): Promise<YouTubeUploadResponse>;
    static getVideoDetails(videoId: string, teacherProfileId: string): Promise<any>;
    static updateVideoMetadata(videoId: string, metadata: Partial<VideoUploadMetadata>, teacherProfileId: string): Promise<void>;
    static deleteVideo(videoId: string, teacherProfileId: string): Promise<void>;
    static parseDuration(isoDuration: string): number;
}
//# sourceMappingURL=youtube.service.d.ts.map