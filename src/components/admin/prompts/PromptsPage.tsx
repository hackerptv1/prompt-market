import React, { useState } from 'react';
import { Search, Filter, MoreVertical, Eye, Edit, Trash2, Star } from 'lucide-react';

export function PromptsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const prompts = [
    {
      id: '1',
      title: 'SEO Blog Generator',
      thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=100&h=100&fit=crop',
      category: 'Marketing',
      author: {
        name: 'Sarah Johnson',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop'
      },
      status: 'active',
      price: 29.99,
      sales: 450,
      rating: 4.8,
      createdAt: '2024-03-15'
    },
    {
      id: '2',
      title: 'Instagram Story Pack',
      thumbnail: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=100&h=100&fit=crop',
      category: 'Social Media',
      author: {
        name: 'Mike Wilson',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'
      },
      status: 'pending',
      price: 24.99,
      sales: 0,
      rating: 0,
      createdAt: '2024-03-14'
    },
    {
      id: '3',
      title: 'Email Marketing Suite',
      thumbnail: 'https://images.unsplash.com/photo-1633265486064-086b219458ec?w=100&h=100&fit=crop',
      category: 'Marketing',
      author: {
        name: 'Emma Davis',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop'
      },
      status: 'inactive',
      price: 39.99,
      sales: 280,
      rating: 4.6,
      createdAt: '2024-03-13'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Prompts Management</h1>
        <div className="flex items-center gap-4">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Add New Prompt
          </button>
          <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
            Export Data
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search prompts..."
                className="pl-10 w-full rounded-lg border-gray-200"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-lg border-gray-200"
            >
              <option value="all">All Categories</option>
              <option value="marketing">Marketing</option>
              <option value="social">Social Media</option>
              <option value="writing">Writing</option>
            </select>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
              <Filter className="h-5 w-5" />
              More Filters
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Prompt</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Category</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Price</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Sales</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Rating</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Created</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {prompts.map((prompt) => (
                <tr key={prompt.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={prompt.thumbnail}
                        alt={prompt.title}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div>
                        <div className="font-medium text-gray-900">{prompt.title}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <img
                            src={prompt.author.avatar}
                            alt={prompt.author.name}
                            className="w-5 h-5 rounded-full"
                          />
                          <span className="text-sm text-gray-500">{prompt.author.name}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {prompt.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      prompt.status === 'active' ? 'bg-green-100 text-green-800' :
                      prompt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {prompt.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-900">${prompt.price}</td>
                  <td className="px-6 py-4 text-gray-500">{prompt.sales}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-amber-400 fill-current" />
                      <span>{prompt.rating || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{prompt.createdAt}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-1 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50">
                        <Eye className="h-5 w-5" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-green-600 rounded-lg hover:bg-green-50">
                        <Edit className="h-5 w-5" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50">
                        <Trash2 className="h-5 w-5" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-gray-500">
                        <MoreVertical className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing 1 to 3 of 3 prompts
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50" disabled>
                Previous
              </button>
              <button className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50" disabled>
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}