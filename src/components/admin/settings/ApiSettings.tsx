import React from 'react';
import { Key, Copy, RefreshCw } from 'lucide-react';

export function ApiSettings() {
  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold">API Settings</h2>
      </div>
      <div className="p-6 space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API Key
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value="sk_live_xxxxxxxxxxxxxxxxxxxxx"
                  readOnly
                  className="w-full pr-10 rounded-lg border-gray-300 bg-gray-50"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <Copy className="h-5 w-5" />
                </button>
              </div>
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50">
                <RefreshCw className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Webhook URL
            </label>
            <input
              type="url"
              defaultValue="https://api.promptmarket.com/webhooks"
              className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rate Limiting (requests per minute)
            </label>
            <input
              type="number"
              defaultValue="60"
              min="1"
              className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Save API Settings
          </button>
        </div>
      </div>
    </div>
  );
}