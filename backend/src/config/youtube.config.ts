// src/config/youtube.config.ts

import dotenv from 'dotenv';

dotenv.config();

export const youtubeConfig = {
  clientId: process.env.YOUTUBE_CLIENT_ID || '',
  clientSecret: process.env.YOUTUBE_CLIENT_SECRET || '',
  redirectUri: process.env.YOUTUBE_REDIRECT_URI || 'http://localhost:5000/auth/google/callback',
  refreshToken: process.env.YOUTUBE_REFRESH_TOKEN || '',
  scopes: [
    'https://www.googleapis.com/auth/youtube.upload',
    'https://www.googleapis.com/auth/youtube',
  ],
  apiEndpoint: 'https://www.googleapis.com/youtube/v3',
  uploadEndpoint: 'https://www.googleapis.com/upload/youtube/v3/videos',
};

export const validateYoutubeConfig = (): void => {
  const required = ['clientId', 'clientSecret', 'refreshToken'];
  const missing = required.filter(key => !youtubeConfig[key as keyof typeof youtubeConfig]);
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required YouTube configuration: ${missing.join(', ')}. ` +
      `Please set ${missing.map(m => `YOUTUBE_${m.toUpperCase()}`).join(', ')} in .env file`
    );
  }
};