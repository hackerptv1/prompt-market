import React from 'react';
import { SlidersHorizontal } from 'lucide-react';

interface MobileFilterButtonProps {
  onClick: () => void;
}

export function MobileFilterButton({ onClick }: MobileFilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 lg:hidden"
    >
      <SlidersHorizontal className="h-5 w-5" />
      <span>Filters</span>
    </button>
  );
}