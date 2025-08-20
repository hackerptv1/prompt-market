import React, { useState } from 'react';
import { X, Video, Save } from 'lucide-react';

interface AddMeetingLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  onSave: (meetingLink: string) => Promise<boolean>;
  currentLink?: string;
}

export function AddMeetingLinkModal({ 
  isOpen, 
  onClose, 
  bookingId, 
  onSave, 
  currentLink 
}: AddMeetingLinkModalProps) {
  const [meetingLink, setMeetingLink] = useState(currentLink || '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!meetingLink.trim()) {
      setError('Please enter a meeting link');
      return;
    }

    // Basic URL validation
    try {
      new URL(meetingLink);
    } catch {
      setError('Please enter a valid URL');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const success = await onSave(meetingLink.trim());
      if (success) {
        onClose();
      } else {
        setError('Failed to save meeting link');
      }
    } catch (err) {
      setError('Failed to save meeting link');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setMeetingLink(currentLink || '');
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {currentLink ? 'Update Meeting Link' : 'Add Meeting Link'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <label htmlFor="meetingLink" className="block text-sm font-medium text-gray-700 mb-2">
              Meeting Link
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Video className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="url"
                id="meetingLink"
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                placeholder="https://meet.google.com/abc-defg-hij"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            {error && (
              <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
            <p className="mt-2 text-xs text-gray-500">
              Enter the meeting link (Zoom, Google Meet, etc.) that you'll share with the buyer
            </p>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={handleClose}
              disabled={isSaving}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || !meetingLink.trim()}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 