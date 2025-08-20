import React, { useState } from 'react';
import type { MediaLink } from '../../../types/mediaLinks';

interface MediaLinkFormProps {
  onSubmit: (link: Omit<MediaLink, 'id'>) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function MediaLinkForm({ onSubmit, onCancel, isSubmitting = false }: MediaLinkFormProps) {
  const [newLink, setNewLink] = useState({ title: '', url: '', platform: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(newLink);
    setNewLink({ title: '', url: '', platform: '' });
  };

  return (
    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            type="text"
            required
            value={newLink.title}
            onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
            className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            placeholder="e.g., Portfolio Website"
            disabled={isSubmitting}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Platform
          </label>
          <input
            type="text"
            required
            value={newLink.platform}
            onChange={(e) => setNewLink({ ...newLink, platform: e.target.value })}
            className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            placeholder="e.g., YouTube"
            disabled={isSubmitting}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            URL
          </label>
          <input
            type="url"
            required
            value={newLink.url}
            onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
            className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            placeholder="https://"
            disabled={isSubmitting}
          />
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 hover:text-gray-900"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Adding...' : 'Add Link'}
        </button>
      </div>
    </div>
  );
}