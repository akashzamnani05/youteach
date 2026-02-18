// src/config/youtube.config.ts

import dotenv from 'dotenv';

dotenv.config();

export const youtubeConfig = {
  clientId: process.env.YOUTUBE_CLIENT_ID || '',
  clientSecret: process.env.YOUTUBE_CLIENT_SECRET || '',
  scopes: [
    'https://www.googleapis.com/auth/youtube.upload',
    'https://www.googleapis.com/auth/youtube',
    'https://www.googleapis.com/auth/userinfo.email',
  ],
};

export const validateYoutubeConfig = (): void => {
  const required = ['clientId', 'clientSecret'] as const;
  const missing = required.filter(key => !youtubeConfig[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required YouTube configuration: ${missing.join(', ')}. ` +
      `Please set YOUTUBE_CLIENT_ID and YOUTUBE_CLIENT_SECRET in .env`
    );
  }
};