import React from 'react';
import { Search, Filter, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { ModerationQueue } from './ModerationQueue';
import { ModerationStats } from './ModerationStats';

export function ModerationPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Content Moderation</h1>
        <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
          Export Report
        </button>
      </div>

      <ModerationStats />
      <ModerationQueue />
    </div>
  );
}