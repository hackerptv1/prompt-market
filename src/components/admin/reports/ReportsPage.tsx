import React from 'react';
import { ReportsList } from './ReportsList';
import { ReportsStats } from './ReportsStats';
import { ReportFilters } from './ReportFilters';

export function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Reports & Issues</h1>
        <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
          Export Report
        </button>
      </div>

      <ReportsStats />
      <ReportFilters />
      <ReportsList />
    </div>
  );
}