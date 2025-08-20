import React from 'react';
import { Search, Filter } from 'lucide-react';

export function ReportFilters() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border-b border-gray-200">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search reports..."
            className="pl-10 w-full rounded-lg border-gray-200"
          />
        </div>
        <select className="rounded-lg border-gray-200">
          <option value="all">All Types</option>
          <option value="content">Content</option>
          <option value="user">User</option>
          <option value="payment">Payment</option>
        </select>
        <select className="rounded-lg border-gray-200">
          <option value="all">All Status</option>
          <option value="open">Open</option>
          <option value="in-progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
          <Filter className="h-5 w-5" />
          More Filters
        </button>
      </div>
    </div>
  );
}