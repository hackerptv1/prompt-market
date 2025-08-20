import React from 'react';
import { SlidersHorizontal, X, Search } from 'lucide-react';
import { PriceRangeFilter } from './filters/PriceRangeFilter';
import { CategoryFilter } from './filters/CategoryFilter';
import { SortOptions } from './filters/SortOptions';
import { AIPlatformFilter } from './filters/AIPlatformFilter';
import { useFilters } from '../../contexts/FilterContext';

interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FilterSidebar({ isOpen, onClose }: FilterSidebarProps) {
  const { applyFilters, resetFilters } = useFilters();
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      <aside className={`
        fixed lg:sticky top-0 lg:top-24 h-screen lg:h-[calc(100vh-6rem)] w-[300px] 
        bg-white shadow-lg lg:shadow-sm rounded-lg transform transition-transform duration-300 
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        z-50 lg:z-0 overflow-auto
      `}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-5 w-5 text-blue-600" />
              <h2 className="font-semibold text-lg">Filters</h2>
            </div>
            <button 
              onClick={onClose}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="space-y-6">
            <CategoryFilter />
            <AIPlatformFilter />
            <PriceRangeFilter />
            <SortOptions />
            
            <button
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              onClick={applyFilters}
            >
              Apply Filters
            </button>
            <button
              className="w-full mt-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors border border-gray-300"
              onClick={resetFilters}
            >
              Reset Filters
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}