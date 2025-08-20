import React from 'react';
import { useFilters } from '../../../contexts/FilterContext';

export function SortOptions() {
  const { localSortBy, setLocalSortBy } = useFilters();

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Sort By
      </label>
      <select
        className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
        value={localSortBy}
        onChange={(e) => setLocalSortBy(e.target.value)}
      >
        <option value="newest">Newest First</option>
        <option value="oldest">Oldest First</option>
        <option value="price_asc">Price: Low to High</option>
        <option value="price_desc">Price: High to Low</option>
      </select>
    </div>
  );
}