import React, { useState } from 'react';
import { Search, Filter, AlertTriangle, CheckCircle, XCircle, MoreVertical } from 'lucide-react';

export function ModerationQueue() {
  const [selectedStatus, setSelectedStatus] = useState('pending');

  const items = [
    {
      id: '1',
      type: 'prompt',
      title: 'SEO Blog Generator',
      author: 'Sarah Johnson',
      submittedAt: '2024-03-15 10:30 AM',
      status: 'pending',
      flags: ['inappropriate', 'spam'],
      thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=100&h=100&fit=crop'
    },
    {
      id: '2',
      type: 'review',
      title: 'Product review',
      author: 'John Doe',
      submittedAt: '2024-03-15 09:45 AM',
      status: 'pending',
      flags: ['offensive'],
      content: 'This prompt is completely useless and the seller is...'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search content..."
              className="pl-10 w-full rounded-lg border-gray-200"
            />
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-lg border-gray-200"
          >
            <option value="pending">Pending Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
            <Filter className="h-5 w-5" />
            More Filters
          </button>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {items.map((item) => (
          <div key={item.id} className="p-6">
            <div className="flex items-start gap-4">
              {item.thumbnail ? (
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              ) : (
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="h-8 w-8 text-gray-400" />
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{item.title}</span>
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                        {item.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Submitted by {item.author} • {item.submittedAt}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg">
                      <CheckCircle className="h-5 w-5" />
                    </button>
                    <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                      <XCircle className="h-5 w-5" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-500">
                      <MoreVertical className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                {item.content && (
                  <p className="mt-2 text-gray-600">{item.content}</p>
                )}
                <div className="flex items-center gap-2 mt-3">
                  {item.flags.map((flag) => (
                    <span
                      key={flag}
                      className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800"
                    >
                      {flag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}