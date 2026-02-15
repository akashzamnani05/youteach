// app/teacher/webinars/page.tsx

'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Video, Plus, X, Calendar, Clock, Users, Link as LinkIcon, Lock, Trash2, ExternalLink } from 'lucide-react';
import { webinarsApi } from '@/lib/webinar';
import { Webinar, CreateWebinarData } from '@/types/webinar';

export default function TeacherWebinars() {
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [meetingLink, setMeetingLink] = useState('');
  const [meetingPassword, setMeetingPassword] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('');
  const [isRecorded, setIsRecorded] = useState(false);

    const [selectedWebinar, setSelectedWebinar] = useState<Webinar | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [registeredStudents, setRegisteredStudents] = useState<any[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  useEffect(() => {
    fetchWebinars();
  }, []);


  const handleViewDetails = async (webinar: Webinar) => {
    setSelectedWebinar(webinar);
    setShowDetailsModal(true);
    
    // Fetch registered students
    setLoadingStudents(true);
    try {
      const response = await webinarsApi.getRegisteredStudents(webinar.id);
      if (response.success && response.data) {
        setRegisteredStudents(response.data.students);
      }
    } catch (err: any) {
      console.error('Failed to fetch students:', err);
    } finally {
      setLoadingStudents(false);
    }
  };

  const fetchWebinars = async () => {
    try {
      setLoading(true);
      const response = await webinarsApi.getWebinars();
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

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setScheduledDate('');
    setScheduledTime('');
    setDurationMinutes(60);
    setMeetingLink('');
    setMeetingPassword('');
    setMaxParticipants('');
    setIsRecorded(false);
  };

  const handleCreateWebinar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setCreating(true);

    try {
      // Combine date and time
      const scheduledAt = `${scheduledDate}T${scheduledTime}:00`;

      const webinarData: CreateWebinarData = {
        title,
        description: description || undefined,
        scheduled_at: scheduledAt,
        duration_minutes: durationMinutes,
        meeting_link: meetingLink,
        meeting_password: meetingPassword || undefined,
        max_participants: maxParticipants ? parseInt(maxParticipants) : undefined,
        is_recorded: isRecorded,
      };

      const response = await webinarsApi.createWebinar(webinarData);

      if (response.success) {
        setSuccess('Webinar created successfully!');
        resetForm();
        setShowModal(false);
        fetchWebinars();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create webinar');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteWebinar = async (webinarId: string) => {
    try {
      const response = await webinarsApi.deleteWebinar(webinarId);
      if (response.success) {
        setSuccess('Webinar deleted successfully');
        setDeleteConfirm(null);
        fetchWebinars();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete webinar');
    }
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

  const getStatusBadge = (webinar: Webinar) => {
    const now = new Date();
    const scheduled = new Date(webinar.scheduled_at);
    const endTime = new Date(scheduled.getTime() + webinar.duration_minutes * 60000);

    if (now >= scheduled && now <= endTime) {
      return <span className="px-3 py-1 bg-red-100 text-red-800 text-sm font-semibold rounded-full">🔴 Live</span>;
    } else if (now < scheduled) {
      return <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">📅 Upcoming</span>;
    } else {
      return <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm font-semibold rounded-full">✓ Completed</span>;
    }
  };

  const getWebinarStatus = (webinar: Webinar): 'upcoming' | 'live' | 'completed' => {
    const now = new Date();
    const scheduled = new Date(webinar.scheduled_at);
    const endTime = new Date(scheduled.getTime() + webinar.duration_minutes * 60000);

    if (now >= scheduled && now <= endTime) return 'live';
    if (now < scheduled) return 'upcoming';
    return 'completed';
  };

  const upcomingWebinars = webinars.filter(w => getWebinarStatus(w) === 'upcoming');
  const pastWebinars = webinars.filter(w => getWebinarStatus(w) === 'completed');

  if (loading) {
    return (
      <DashboardLayout role="teacher">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="teacher">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Webinars</h1>
          <p className="text-gray-600 mt-1">{webinars.length} total webinar{webinars.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Schedule Webinar</span>
        </button>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex justify-between items-start">
          <p className="text-green-800 font-medium">✓ {success}</p>
          <button onClick={() => setSuccess('')} className="text-green-600 hover:text-green-800">✕</button>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex justify-between items-start">
          <p className="text-red-800">✗ {error}</p>
          <button onClick={() => setError('')} className="text-red-600 hover:text-red-800">✕</button>
        </div>
      )}

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm">Upcoming Webinars</p>
          <p className="text-3xl font-bold text-purple-600 mt-2">{upcomingWebinars.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm">Past Webinars</p>
          <p className="text-3xl font-bold text-gray-600 mt-2">{pastWebinars.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm">Total Duration</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            {Math.floor(webinars.reduce((sum, w) => sum + w.duration_minutes, 0) / 60)}h
          </p>
        </div>
      </div>

      {/* Webinars List */}
      {webinars.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center py-12">
            <Video className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-xl text-gray-500 mb-2">No webinars scheduled</p>
            <p className="text-gray-400 mb-6">
              Schedule live webinars to connect with your students in real-time
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Schedule Your First Webinar
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {webinars.map((webinar) => {
            const status = getWebinarStatus(webinar);
            return (
              <div key={webinar.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-lg ${
                        status === 'live' ? 'bg-red-100' :
                        status === 'upcoming' ? 'bg-blue-100' : 'bg-gray-100'
                      }`}>
                        <Video className={`h-6 w-6 ${
                          status === 'live' ? 'text-red-600' :
                          status === 'upcoming' ? 'text-blue-600' : 'text-gray-600'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-900">{webinar.title}</h3>
                          {getStatusBadge(webinar)}
                        </div>
                        {webinar.description && (
                          <p className="text-gray-600 mb-3">{webinar.description}</p>
                        )}
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center space-x-2 text-gray-600">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(webinar.scheduled_at).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}</span>
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
                        {webinar.meeting_link && (
                          <div className="mt-4 flex items-center space-x-2">
                            <LinkIcon className="h-4 w-4 text-gray-400" />
                            <a
                              href={webinar.meeting_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-purple-600 hover:text-purple-700 text-sm flex items-center space-x-1"
                            >
                              <span>{webinar.meeting_link.substring(0, 50)}...</span>
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        )}
                        {webinar.meeting_password && (
                          <div className="mt-2 flex items-center space-x-2 text-sm text-gray-600">
                            <Lock className="h-4 w-4" />
                            <span>Password: {webinar.meeting_password}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                   <div className="ml-4 flex flex-col space-y-2">
                    <button
                      onClick={() => handleViewDetails(webinar)}
                      className="px-4 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors text-sm font-medium"
                    >
                      View Details
                    </button>
                    {deleteConfirm === webinar.id ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleDeleteWebinar(webinar.id)}
                          className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(webinar.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Webinar"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Webinar Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Schedule New Webinar</h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                    setError('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleCreateWebinar} className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                    placeholder="Introduction to Web Development"
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
                    rows={3}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                    placeholder="What will this webinar cover?"
                  />
                </div>

                {/* Date and Time */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      required
                      min={new Date().toISOString().split('T')[0]}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      required
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                    />
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (minutes) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(parseInt(e.target.value))}
                    required
                    min="1"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                  />
                </div>

                {/* Meeting Link */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meeting Link <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    value={meetingLink}
                    onChange={(e) => setMeetingLink(e.target.value)}
                    required
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                    placeholder="https://zoom.us/j/123456789"
                  />
                </div>

                {/* Meeting Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meeting Password (Optional)
                  </label>
                  <input
                    type="text"
                    value={meetingPassword}
                    onChange={(e) => setMeetingPassword(e.target.value)}
                    maxLength={50}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                    placeholder="Optional password for meeting"
                  />
                </div>

                {/* Max Participants */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Participants (Optional)
                  </label>
                  <input
                    type="number"
                    value={maxParticipants}
                    onChange={(e) => setMaxParticipants(e.target.value)}
                    min="1"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                    placeholder="Leave empty for unlimited"
                  />
                </div>

                {/* Is Recorded */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isRecorded"
                    checked={isRecorded}
                    onChange={(e) => setIsRecorded(e.target.checked)}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <label htmlFor="isRecorded" className="text-sm text-gray-700">
                    This webinar will be recorded
                  </label>
                </div>

                {/* Buttons */}
                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                      setError('');
                    }}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                  >
                    {creating ? 'Creating...' : 'Schedule Webinar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        
      )}
    {/* Webinar Details Modal */}
      {showDetailsModal && selectedWebinar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedWebinar.title}</h2>
                  {getStatusBadge(selectedWebinar)}
                </div>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedWebinar(null);
                    setRegisteredStudents([]);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Webinar Details */}
              <div className="space-y-4 mb-6">
                {selectedWebinar.description && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-1">Description</h3>
                    <p className="text-gray-600">{selectedWebinar.description}</p>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-1">Date & Time</h3>
                    <div className="flex items-center space-x-2 text-gray-900">
                      <Calendar className="h-4 w-4 text-gray-400" />
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
                    <h3 className="text-sm font-medium text-gray-700 mb-1">Duration</h3>
                    <div className="flex items-center space-x-2 text-gray-900">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span>{selectedWebinar.duration_minutes} minutes</span>
                    </div>
                  </div>

                  {selectedWebinar.max_participants && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-1">Max Participants</h3>
                      <div className="flex items-center space-x-2 text-gray-900">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span>{selectedWebinar.max_participants}</span>
                      </div>
                    </div>
                  )}

                  {getWebinarStatus(selectedWebinar) === 'upcoming' && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-1">Starts In</h3>
                      <div className="flex items-center space-x-2 text-purple-600 font-medium">
                        <Clock className="h-4 w-4" />
                        <span>{getTimeLeft(selectedWebinar.scheduled_at)}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Meeting Info
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Meeting Information</h3>
                  <div className="space-y-2">
                    {selectedWebinar.meeting_link && (
                      <div className="flex items-center space-x-2">
                        <LinkIcon className="h-4 w-4 text-blue-600" />
                        
                          href={selectedWebinar.meeting_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 text-sm flex items-center space-x-1"
                        <a>
                          <span>{selectedWebinar.meeting_link}</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    )}
                    {selectedWebinar.meeting_password && (
                      <div className="flex items-center space-x-2 text-sm text-gray-700">
                        <Lock className="h-4 w-4" />
                        <span>Password: {selectedWebinar.meeting_password}</span>
                      </div>
                    )}
                  </div>
                </div> */}
              </div>

              {/* Registered Students */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">
                    Registered Students ({registeredStudents.length})
                  </h3>
                </div>

                {loadingStudents ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  </div>
                ) : registeredStudents.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No students registered yet</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {registeredStudents.map((student) => (
                      <div
                        key={student.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-medium text-sm">
                              {student.full_name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{student.full_name}</p>
                            <p className="text-sm text-gray-500">{student.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">
                            Registered {new Date(student.registered_at).toLocaleDateString()}
                          </p>
                          {student.education_level && (
                            <p className="text-xs text-gray-400">{student.education_level}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Close Button */}
              <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedWebinar(null);
                    setRegisteredStudents([]);
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
    </DashboardLayout>
  );
}