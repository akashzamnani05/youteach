// app/student/webinars/page.tsx

'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Video, Calendar, Clock, Users, Link as LinkIcon, Lock, X, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { studentWebinarsApi } from '@/lib/student-webinars';
import { StudentWebinar } from '@/types/webinar';

type TabType = 'all' | 'registered';

export default function StudentWebinars() {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [webinars, setWebinars] = useState<StudentWebinar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedWebinar, setSelectedWebinar] = useState<StudentWebinar | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchWebinars();
  }, [activeTab]);

  const fetchWebinars = async () => {
    try {
      setLoading(true);
      const response =
        activeTab === 'all'
          ? await studentWebinarsApi.getWebinars()
          : await studentWebinarsApi.getRegisteredWebinars();

      if (response.success && response.data) {
        setWebinars(response.data.webinars);
      }
    } catch (err: any) {
      console.error('Failed to fetch webinars:', err);
      setError('Failed to load webinars');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (webinarId: string) => {
    setActionLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await studentWebinarsApi.registerForWebinar(webinarId);
      if (response.success) {
        setSuccess('Successfully registered for webinar!');
        fetchWebinars();
        if (selectedWebinar?.id === webinarId) {
          const updated = await studentWebinarsApi.getWebinarById(webinarId);
          if (updated.success && updated.data) {
            setSelectedWebinar(updated.data.webinar);
          }
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to register for webinar');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnregister = async (webinarId: string) => {
    setActionLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await studentWebinarsApi.unregisterFromWebinar(webinarId);
      if (response.success) {
        setSuccess('Successfully unregistered from webinar');
        fetchWebinars();
        if (selectedWebinar?.id === webinarId) {
          const updated = await studentWebinarsApi.getWebinarById(webinarId);
          if (updated.success && updated.data) {
            setSelectedWebinar(updated.data.webinar);
          }
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to unregister from webinar');
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewDetails = async (webinarId: string) => {
    try {
      const response = await studentWebinarsApi.getWebinarById(webinarId);
      if (response.success && response.data) {
        setSelectedWebinar(response.data.webinar);
        setShowModal(true);
      }
    } catch (err: any) {
      setError('Failed to load webinar details');
    }
  };

  const getWebinarStatus = (webinar: StudentWebinar): 'upcoming' | 'live' | 'completed' => {
    const now = new Date();
    const scheduled = new Date(webinar.scheduled_at);
    const endTime = new Date(scheduled.getTime() + webinar.duration_minutes * 60000);

    if (now >= scheduled && now <= endTime) return 'live';
    if (now < scheduled) return 'upcoming';
    return 'completed';
  };

  const getTimeLeft = (scheduledAt: string): string => {
    const now = new Date();
    const scheduled = new Date(scheduledAt);
    const diff = scheduled.getTime() - now.getTime();

    if (diff < 0) return 'Started';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getStatusBadge = (webinar: StudentWebinar) => {
    const status = getWebinarStatus(webinar);

    if (status === 'live') {
      return <span className="px-3 py-1 bg-red-100 text-red-800 text-sm font-semibold rounded-full">🔴 Live Now</span>;
    } else if (status === 'upcoming') {
      return <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">📅 Upcoming</span>;
    } else {
      return <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm font-semibold rounded-full">✓ Completed</span>;
    }
  };

  const registeredWebinars = webinars.filter((w) => w.is_registered);
  const upcomingWebinars = webinars.filter((w) => getWebinarStatus(w) === 'upcoming');

  if (loading) {
    return (
      <DashboardLayout role="student">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="student">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Webinars</h1>
        <p className="text-gray-600 mt-1">View and register for webinars from your teacher</p>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex justify-between items-start">
          <p className="text-green-800 font-medium">✓ {success}</p>
          <button onClick={() => setSuccess('')} className="text-green-600 hover:text-green-800">
            ✕
          </button>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex justify-between items-start">
          <p className="text-red-800">✗ {error}</p>
          <button onClick={() => setError('')} className="text-red-600 hover:text-red-800">
            ✕
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm">Registered Webinars</p>
          <p className="text-3xl font-bold text-purple-600 mt-2">{registeredWebinars.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm">Upcoming Webinars</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{upcomingWebinars.length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'all'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              All Webinars ({webinars.length})
            </button>
            <button
              onClick={() => setActiveTab('registered')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'registered'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Registered ({registeredWebinars.length})
            </button>
          </nav>
        </div>
      </div>

      {/* Webinars List */}
      {webinars.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center py-12">
            <Video className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-xl text-gray-500 mb-2">
              {activeTab === 'all' ? 'No webinars available' : 'No registered webinars'}
            </p>
            <p className="text-gray-400">
              {activeTab === 'all'
                ? 'Your teacher has not scheduled any webinars yet'
                : 'Register for webinars to see them here'}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {webinars.map((webinar) => {
            const status = getWebinarStatus(webinar);
            const isPast = status === 'completed';

            return (
              <div
                key={webinar.id}
                className={`bg-white rounded-lg shadow p-6 ${isPast ? 'opacity-75' : ''}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-start space-x-4">
                      <div
                        className={`p-3 rounded-lg ${
                          status === 'live'
                            ? 'bg-red-100'
                            : status === 'upcoming'
                            ? 'bg-blue-100'
                            : 'bg-gray-100'
                        }`}
                      >
                        <Video
                          className={`h-6 w-6 ${
                            status === 'live'
                              ? 'text-red-600'
                              : status === 'upcoming'
                              ? 'text-blue-600'
                              : 'text-gray-600'
                          }`}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-900">{webinar.title}</h3>
                          {getStatusBadge(webinar)}
                          {webinar.is_registered && (
                            <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full flex items-center space-x-1">
                              <CheckCircle className="h-3 w-3" />
                              <span>Registered</span>
                            </span>
                          )}
                        </div>

                        {webinar.teacher_name && (
                          <p className="text-sm text-gray-600 mb-2">By {webinar.teacher_name}</p>
                        )}

                        {webinar.description && (
                          <p className="text-gray-600 mb-3">{webinar.description}</p>
                        )}

                        <div className="grid md:grid-cols-2 gap-4 text-sm mb-3">
                          <div className="flex items-center space-x-2 text-gray-600">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {new Date(webinar.scheduled_at).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 text-gray-600">
                            <Clock className="h-4 w-4" />
                            <span>{webinar.duration_minutes} minutes</span>
                          </div>
                          {webinar.max_participants && (
                            <div className="flex items-center space-x-2 text-gray-600">
                              <Users className="h-4 w-4" />
                              <span>Max {webinar.max_participants} participants</span>
                            </div>
                          )}
                          {status === 'upcoming' && (
                            <div className="flex items-center space-x-2 text-purple-600 font-medium">
                              <Clock className="h-4 w-4" />
                              <span>Starts in {getTimeLeft(webinar.scheduled_at)}</span>
                            </div>
                          )}
                        </div>

                        {/* Show meeting link only if registered */}
                        {webinar.is_registered && webinar.meeting_link && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                            <div className="flex items-center space-x-2 mb-2">
                              <LinkIcon className="h-4 w-4 text-blue-600" />
                              <a
                                href={webinar.meeting_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-700 text-sm flex items-center space-x-1 font-medium"
                              >
                                <span>Join Meeting</span>
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </div>
                            {webinar.meeting_password && (
                              <div className="flex items-center space-x-2 text-sm text-gray-700">
                                <Lock className="h-3 w-3" />
                                <span>Password: {webinar.meeting_password}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="ml-4 flex flex-col space-y-2">
                    <button
                      onClick={() => handleViewDetails(webinar.id)}
                      className="px-4 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors text-sm font-medium"
                    >
                      View Details
                    </button>
                    {!isPast && (
                      <>
                        {webinar.is_registered ? (
                          <button
                            onClick={() => handleUnregister(webinar.id)}
                            disabled={actionLoading}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50"
                          >
                            Unregister
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRegister(webinar.id)}
                            disabled={actionLoading}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium disabled:opacity-50"
                          >
                            Register
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Webinar Details Modal */}
      {showModal && selectedWebinar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h2 className="text-2xl font-bold text-gray-900">{selectedWebinar.title}</h2>
                    {getStatusBadge(selectedWebinar)}
                  </div>
                  {selectedWebinar.teacher_name && (
                    <p className="text-gray-600">By {selectedWebinar.teacher_name}</p>
                  )}
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                {selectedWebinar.description && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
                    <p className="text-gray-600">{selectedWebinar.description}</p>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Date & Time</h3>
                    <div className="flex items-center space-x-2 text-gray-900">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <span>
                        {new Date(selectedWebinar.scheduled_at).toLocaleString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Duration</h3>
                    <div className="flex items-center space-x-2 text-gray-900">
                      <Clock className="h-5 w-5 text-gray-400" />
                      <span>{selectedWebinar.duration_minutes} minutes</span>
                    </div>
                  </div>

                  {selectedWebinar.max_participants && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Max Participants</h3>
                      <div className="flex items-center space-x-2 text-gray-900">
                        <Users className="h-5 w-5 text-gray-400" />
                        <span>{selectedWebinar.max_participants}</span>
                      </div>
                    </div>
                  )}

                  {getWebinarStatus(selectedWebinar) === 'upcoming' && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Starts In</h3>
                      <div className="flex items-center space-x-2 text-purple-600 font-medium">
                        <Clock className="h-5 w-5" />
                        <span>{getTimeLeft(selectedWebinar.scheduled_at)}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Show meeting details only if registered */}
                {selectedWebinar.is_registered && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Meeting Details</h3>
                    {selectedWebinar.meeting_link && (
                      <div className="mb-2">
                        <a
                          href={selectedWebinar.meeting_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 flex items-center space-x-2 font-medium"
                        >
                          <LinkIcon className="h-4 w-4" />
                          <span>Join Meeting</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    )}
                    {selectedWebinar.meeting_password && (
                      <div className="flex items-center space-x-2 text-sm text-gray-700">
                        <Lock className="h-4 w-4" />
                        <span>Password: <strong>{selectedWebinar.meeting_password}</strong></span>
                      </div>
                    )}
                  </div>
                )}

                {selectedWebinar.is_recorded && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Video className="h-4 w-4" />
                    <span>This webinar will be recorded</span>
                  </div>
                )}

                {/* Registration Status */}
                <div className="pt-4 border-t border-gray-200">
                  {selectedWebinar.is_registered ? (
                    <div className="flex items-center space-x-2 text-green-700 mb-4">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-medium">You are registered for this webinar</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 text-gray-600 mb-4">
                      <XCircle className="h-5 w-5" />
                      <span>You are not registered for this webinar</span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {getWebinarStatus(selectedWebinar) !== 'completed' && (
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => setShowModal(false)}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Close
                      </button>
                      {selectedWebinar.is_registered ? (
                        <button
                          onClick={() => handleUnregister(selectedWebinar.id)}
                          disabled={actionLoading}
                          className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                        >
                          {actionLoading ? 'Processing...' : 'Unregister'}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleRegister(selectedWebinar.id)}
                          disabled={actionLoading}
                          className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                        >
                          {actionLoading ? 'Processing...' : 'Register Now'}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}