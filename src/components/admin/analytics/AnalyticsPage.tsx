import React from 'react';
import { AnalyticsOverview } from './AnalyticsOverview';
import { AnalyticsCharts } from './AnalyticsCharts';
import { TopPerformers } from './TopPerformers';
import { TrendingPrompts } from './TrendingPrompts';

export function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <div className="flex items-center gap-4">
          <select className="rounded-lg border-gray-200">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 90 days</option>
            <option>Last year</option>
          </select>
          <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
            Export Report
          </button>
        </div>
      </div>

      <AnalyticsOverview />
      <AnalyticsCharts />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopPerformers />
        <TrendingPrompts />
      </div>
    </div>
  );
}