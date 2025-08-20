import React from 'react';
import { useFilters } from '../../../contexts/FilterContext';

function capitalizeFirst(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function AIPlatformFilter() {
  const {
    aiPlatforms,
    localSelectedPlatform,
    setLocalSelectedPlatform,
    isLoading,
    error
  } = useFilters();

  if (isLoading) {
    return (
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          AI Platform
        </label>
        <div className="animate-pulse h-10 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          AI Platform
        </label>
        <div className="text-red-500 text-sm">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        AI Platform
      </label>
      <select
        className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
        value={localSelectedPlatform || ''}
        onChange={(e) => setLocalSelectedPlatform(e.target.value || null)}
      >
        <option value="">All Platforms</option>
        {aiPlatforms.map(platform => (
          <option key={platform.id} value={platform.id}>
            {capitalizeFirst(platform.platform_name)}
          </option>
        ))}
      </select>
    </div>
  );
}