import React from 'react';
import { Search, Filter, Upload } from 'lucide-react';

export function MediaFilters() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search media files..."
            className="pl-10 w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        
        <div className="flex gap-3">
          <select className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500">
            <option value="all">All Types</option>
            <option value="image">Images</option>
            <option value="video">Videos</option>
            <option value="document">Documents</option>
          </select>

          <select className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500">
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name">Name A-Z</option>
            <option value="size">Size</option>
          </select>

          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Upload className="h-5 w-5" />
            Upload
          </button>
        </div>
      </div>
    </div>
  );
}