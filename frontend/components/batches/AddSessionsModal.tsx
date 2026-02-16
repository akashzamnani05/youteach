'use client';

import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { batchesApi } from '@/lib/batches';
import { CreateSessionsData } from '@/types/batches.types';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface Props {
  batchId: string;
  batchName: string;
  onClose: () => void;
  onAdded: () => void;
}

export default function AddSessionsModal({ batchId, batchName, onClose, onAdded }: Props) {
  const [sessionType, setSessionType] = useState<'single' | 'range'>('single');
  const [sessionDate, setSessionDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([1, 3, 5]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function toggleDay(day: number) {
    setDaysOfWeek((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (sessionType === 'single' && !sessionDate) { setError('Session date is required'); return; }
    if (sessionType === 'range' && (!startDate || !endDate)) { setError('Start and end dates are required'); return; }
    if (sessionType === 'range' && daysOfWeek.length === 0) { setError('Select at least one day'); return; }

    setSaving(true);
    try {
      const data: CreateSessionsData = {
        session_type: sessionType,
        ...(sessionType === 'single'
          ? { session_date: sessionDate }
          : { start_date: startDate, end_date: endDate, days_of_week: daysOfWeek }),
      };
      await batchesApi.createSessions(batchId, data);
      onAdded();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to add sessions');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Add Sessions</h2>
            <p className="text-xs text-gray-400">{batchName}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-gray-100">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          <div className="flex gap-4">
            {(['single', 'range'] as const).map((type) => (
              <label key={type} className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="radio"
                  name="sessionType"
                  value={type}
                  checked={sessionType === type}
                  onChange={() => setSessionType(type)}
                  className="accent-blue-600"
                />
                {type === 'single' ? 'Single day' : 'Date range'}
              </label>
            ))}
          </div>

          {sessionType === 'single' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
              <input
                type="date"
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Days of week *</label>
                <div className="flex gap-1.5 flex-wrap">
                  {DAY_LABELS.map((label, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => toggleDay(idx)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                        daysOfWeek.includes(idx)
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'border-gray-300 text-gray-600 hover:border-blue-400'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}
        </form>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit as any}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Add Sessions
          </button>
        </div>
      </div>
    </div>
  );
}
