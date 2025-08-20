import React from 'react';
import { AIProvidersList } from './AIProvidersList';
import { AIProvidersStats } from './AIProvidersStats';
import { Plus } from 'lucide-react';

export function AIProvidersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">AI Service Providers</h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus className="h-5 w-5" />
          Add Provider
        </button>
      </div>
      <AIProvidersStats />
      <AIProvidersList />
    </div>
  );
}