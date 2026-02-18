// lib/google-oauth.ts

import apiClient from './api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
// The connect URL is a direct browser redirect (not an axios call)
const BACKEND_BASE = API_URL.replace('/api', '');

export interface GoogleConnectionStatus {
  connected: boolean;
  email?: string;
}

export const googleOAuthApi = {
  /** Check if the teacher's YouTube account is connected */
  getStatus: async (): Promise<GoogleConnectionStatus> => {
    const res = await apiClient.get('/auth/google/status');
    return res.data.data as GoogleConnectionStatus;
  },

  /** Disconnect the teacher's YouTube account */
  disconnect: async (): Promise<void> => {
    await apiClient.post('/auth/google/disconnect');
  },

  /**
   * Returns the URL to redirect the browser to for Google OAuth.
   * Must be a full browser redirect (window.location.href), not an axios call.
   */
  getConnectUrl: (): string => {
    return `${BACKEND_BASE}/api/auth/google/connect`;
  },
};
