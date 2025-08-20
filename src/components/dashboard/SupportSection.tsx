import React from 'react';
import { MessageSquare } from 'lucide-react';

export function SupportSection() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-6">Contact Support</h2>
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subject
          </label>
          <input
            type="text"
            className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            placeholder="How can we help?"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Message
          </label>
          <textarea
            rows={4}
            className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            placeholder="Describe your issue..."
          />
        </div>

        <button className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          <MessageSquare className="h-5 w-5" />
          Send Message
        </button>
      </form>
    </div>
  );
}