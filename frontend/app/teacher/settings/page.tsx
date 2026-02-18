// app/teacher/settings/page.tsx

'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { User, Bell, Lock, Youtube, CheckCircle, AlertCircle, Loader2, ExternalLink, LogOut } from 'lucide-react';
import { googleOAuthApi, GoogleConnectionStatus } from '@/lib/google-oauth';

function TeacherSettingsContent() {
  const searchParams = useSearchParams();
  const [ytStatus, setYtStatus] = useState<GoogleConnectionStatus | null>(null);
  const [ytLoading, setYtLoading] = useState(true);
  const [ytDisconnecting, setYtDisconnecting] = useState(false);
  const [ytMessage, setYtMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    // Check for redirect result from Google OAuth callback
    const google = searchParams.get('google');
    if (google === 'connected') {
      setYtMessage({ type: 'success', text: 'YouTube account connected successfully!' });
    } else if (google === 'error') {
      const reason = searchParams.get('reason') || 'unknown';
      setYtMessage({ type: 'error', text: `Failed to connect YouTube account (${reason}). Please try again.` });
    }

    fetchYtStatus();
  }, []);

  const fetchYtStatus = async () => {
    try {
      setYtLoading(true);
      const status = await googleOAuthApi.getStatus();
      setYtStatus(status);
    } catch {
      setYtStatus({ connected: false });
    } finally {
      setYtLoading(false);
    }
  };

  const handleConnect = () => {
    // Must be a full browser redirect — Google OAuth doesn't work with axios
    window.location.href = googleOAuthApi.getConnectUrl();
  };

  const handleDisconnect = async () => {
    if (!confirm('Disconnect your YouTube account? You will need to reconnect before uploading videos.')) return;
    try {
      setYtDisconnecting(true);
      await googleOAuthApi.disconnect();
      setYtStatus({ connected: false });
      setYtMessage({ type: 'success', text: 'YouTube account disconnected.' });
    } catch {
      setYtMessage({ type: 'error', text: 'Failed to disconnect. Please try again.' });
    } finally {
      setYtDisconnecting(false);
    }
  };

  return (
    <DashboardLayout role="teacher">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Settings</h1>

      <div className="grid gap-6">
        {/* YouTube Connection */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Youtube className="h-6 w-6 text-red-600" />
            <h2 className="text-xl font-bold text-gray-900">YouTube Connection</h2>
          </div>
          <p className="text-gray-600 mb-5">
            Connect your YouTube channel so course videos are uploaded directly to your account.
          </p>

          {/* Status message from redirect */}
          {ytMessage && (
            <div className={`flex items-center gap-2 p-3 rounded-lg mb-4 text-sm ${
              ytMessage.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {ytMessage.type === 'success'
                ? <CheckCircle className="h-4 w-4 flex-shrink-0" />
                : <AlertCircle className="h-4 w-4 flex-shrink-0" />}
              {ytMessage.text}
            </div>
          )}

          {ytLoading ? (
            <div className="flex items-center gap-2 text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Checking connection...</span>
            </div>
          ) : ytStatus?.connected ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">Connected</p>
                  <p className="text-xs text-gray-500">{ytStatus.email}</p>
                </div>
              </div>
              <button
                onClick={handleDisconnect}
                disabled={ytDisconnecting}
                className="flex items-center gap-1.5 px-4 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                {ytDisconnecting
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : <LogOut className="h-4 w-4" />}
                Disconnect
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center">
                  <Youtube className="h-5 w-5 text-gray-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">Not connected</p>
                  <p className="text-xs text-gray-500">Connect to start uploading videos</p>
                </div>
              </div>
              <button
                onClick={handleConnect}
                className="flex items-center gap-1.5 px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                Connect YouTube
              </button>
            </div>
          )}
        </div>

        {/* Profile Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-3 mb-4">
            <User className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Profile Settings</h2>
          </div>
          <p className="text-gray-600">Manage your profile information and preferences</p>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Bell className="h-6 w-6 text-purple-600" />
            <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
          </div>
          <p className="text-gray-600">Configure your notification preferences</p>
        </div>

        {/* Security */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Lock className="h-6 w-6 text-green-600" />
            <h2 className="text-xl font-bold text-gray-900">Security</h2>
          </div>
          <p className="text-gray-600">Update your password and security settings</p>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function TeacherSettings() {
  return (
    <Suspense>
      <TeacherSettingsContent />
    </Suspense>
  );
}