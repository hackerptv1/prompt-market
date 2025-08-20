import React from 'react';
import { TrendingUp, Users, Star, DollarSign } from 'lucide-react';

interface PromptStatsProps {
  promptId: string | undefined;
}

export function PromptStats({ promptId }: PromptStatsProps) {
  // Mock data - replace with actual API call
  const stats = {
    totalViews: 1250,
    totalSales: 85,
    averageRating: 4.8,
    totalEarnings: 2499.15,
    recentTrend: [65, 72, 85, 78, 90, 85, 92]
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
      <h2 className="text-xl font-semibold">Prompt Statistics</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2 text-blue-600">
            <Users className="h-5 w-5" />
            <span className="text-sm">Total Views</span>
          </div>
          <div className="mt-2 text-2xl font-bold text-blue-700">
            {stats.totalViews.toLocaleString()}
          </div>
        </div>

        <div className="p-4 bg-green-50 rounded-lg">
          <div className="flex items-center gap-2 text-green-600">
            <DollarSign className="h-5 w-5" />
            <span className="text-sm">Total Sales</span>
          </div>
          <div className="mt-2 text-2xl font-bold text-green-700">
            {stats.totalSales}
          </div>
        </div>

        <div className="p-4 bg-amber-50 rounded-lg">
          <div className="flex items-center gap-2 text-amber-600">
            <Star className="h-5 w-5" />
            <span className="text-sm">Average Rating</span>
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-700">
            {stats.averageRating}
          </div>
        </div>

        <div className="p-4 bg-purple-50 rounded-lg">
          <div className="flex items-center gap-2 text-purple-600">
            <TrendingUp className="h-5 w-5" />
            <span className="text-sm">Total Earnings</span>
          </div>
          <div className="mt-2 text-2xl font-bold text-purple-700">
            ${stats.totalEarnings.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="pt-4">
        <h3 className="text-sm font-medium text-gray-700 mb-4">Sales Trend</h3>
        <div className="h-32 flex items-end gap-1">
          {stats.recentTrend.map((value, index) => (
            <div
              key={index}
              className="flex-1 bg-blue-100 rounded-t"
              style={{ height: `${(value / 100) * 100}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}