import React from 'react';
import { BarChart3, LineChart } from 'lucide-react';

export function AnalyticsCharts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Revenue Trend</h2>
          <select className="rounded-lg border-gray-200 text-sm">
            <option>By Day</option>
            <option>By Week</option>
            <option>By Month</option>
          </select>
        </div>
        <div className="h-64 flex items-center justify-center text-gray-400">
          <LineChart className="h-8 w-8" />
          <span className="ml-2">Revenue chart placeholder</span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Orders Overview</h2>
          <select className="rounded-lg border-gray-200 text-sm">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
          </select>
        </div>
        <div className="h-64 flex items-center justify-center text-gray-400">
          <BarChart3 className="h-8 w-8" />
          <span className="ml-2">Orders chart placeholder</span>
        </div>
      </div>
    </div>
  );
}