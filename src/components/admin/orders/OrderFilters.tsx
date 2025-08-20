import React from 'react';
import { Search, Filter } from 'lucide-react';

export function OrderFilters() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search orders..."
            className="pl-10 w-full rounded-lg border-gray-200"
          />
        </div>
        <select className="rounded-lg border-gray-200">
          <option value="all">All Status</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
        <select className="rounded-lg border-gray-200">
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
          <Filter className="h-5 w-5" />
          More Filters
        </button>
      </div>
    </div>
  );
}