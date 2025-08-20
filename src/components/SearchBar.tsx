import React from 'react';
import { Search } from 'lucide-react';

export function SearchBar() {
  return (
    <div className="relative max-w-xl w-full mx-auto px-4 sm:px-0">
      <input
        type="text"
        placeholder="Search for prompts..."
        className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none shadow-sm"
      />
      <Search className="absolute left-6 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
    </div>
  );
}