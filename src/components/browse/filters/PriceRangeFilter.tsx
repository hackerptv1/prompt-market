import React from 'react';
import { useFilters } from '../../../contexts/FilterContext';

export function PriceRangeFilter() {
  const { localPriceRange, setLocalPriceRange } = useFilters();

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      setLocalPriceRange([value, localPriceRange[1]]);
    }
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      setLocalPriceRange([localPriceRange[0], value]);
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Price Range
      </label>
      <div className="flex items-center gap-2">
        <input
          type="number"
          min="0"
          step="0.01"
          value={localPriceRange[0]}
          onChange={handleMinChange}
          className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          placeholder="Min"
        />
        <span className="text-gray-500">to</span>
        <input
          type="number"
          min="0"
          step="0.01"
          value={localPriceRange[1]}
          onChange={handleMaxChange}
          className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          placeholder="Max"
        />
      </div>
    </div>
  );
}