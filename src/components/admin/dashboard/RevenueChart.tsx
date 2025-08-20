import React from 'react';
import { BarChart3 } from 'lucide-react';

export function RevenueChart() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Revenue Overview</h2>
        <select className="rounded-lg border-gray-200">
          <option>Last 7 days</option>
          <option>Last 30 days</option>
          <option>Last 90 days</option>
        </select>
      </div>
      <div className="h-64 flex items-center justify-center text-gray-400">
        <BarChart3 className="h-8 w-8" />
        <span className="ml-2">Chart placeholder</span>
      </div>
    </div>
  );
}