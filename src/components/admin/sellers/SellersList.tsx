import React, { useState } from 'react';
import { Search, Filter, MoreVertical, CheckCircle, XCircle } from 'lucide-react';

export function SellersList() {
  const [selectedStatus, setSelectedStatus] = useState('all');

  const sellers = [
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
      status: 'active',
      prompts: 25,
      totalSales: 1250,
      revenue: 12499.99,
      joinDate: '2024-01-15',
      rating: 4.8
    },
    {
      id: '2',
      name: 'Michael Chen',
      email: 'michael@example.com',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
      status: 'pending',
      prompts: 12,
      totalSales: 450,
      revenue: 4499.99,
      joinDate: '2024-02-20',
      rating: 4.6
    },
    {
      id: '3',
      name: 'Emma Davis',
      email: 'emma@example.com',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
      status: 'suspended',
      prompts: 8,
      totalSales: 320,
      revenue: 3199.99,
      joinDate: '2024-01-30',
      rating: 4.2
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Filters */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search sellers..."
              className="pl-10 w-full rounded-lg border-gray-200"
            />
          </div>
          <div className="flex items-center gap-4">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="rounded-lg border-gray-200"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
            </select>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
              <Filter className="h-5 w-5" />
              More Filters
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Seller</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Status</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Prompts</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Sales</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Revenue</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Rating</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Join Date</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sellers.map((seller) => (
              <tr key={seller.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={seller.avatar}
                      alt={seller.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <div className="font-medium text-gray-900">{seller.name}</div>
                      <div className="text-sm text-gray-500">{seller.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    seller.status === 'active' ? 'bg-green-100 text-green-800' :
                    seller.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {seller.status === 'active' ? <CheckCircle className="mr-1 h-3 w-3" /> :
                     seller.status === 'suspended' ? <XCircle className="mr-1 h-3 w-3" /> : null}
                    {seller.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500">{seller.prompts}</td>
                <td className="px-6 py-4 text-gray-500">{seller.totalSales}</td>
                <td className="px-6 py-4 text-gray-900">${seller.revenue.toLocaleString()}</td>
                <td className="px-6 py-4 text-gray-500">{seller.rating}</td>
                <td className="px-6 py-4 text-gray-500">{seller.joinDate}</td>
                <td className="px-6 py-4 text-right">
                  <button className="text-gray-400 hover:text-gray-500">
                    <MoreVertical className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-6 py-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing 1 to 3 of 3 sellers
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
  );
}