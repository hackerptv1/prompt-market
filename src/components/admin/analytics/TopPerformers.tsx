import React from 'react';
import { Crown, TrendingUp } from 'lucide-react';

export function TopPerformers() {
  const sellers = [
    {
      name: 'Sarah Johnson',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
      revenue: 12499.99,
      sales: 450,
      growth: '+15%'
    },
    {
      name: 'Michael Chen',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
      revenue: 9899.99,
      sales: 380,
      growth: '+12%'
    },
    {
      name: 'Emma Davis',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
      revenue: 8799.99,
      sales: 320,
      growth: '+10%'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-amber-400" />
          <h2 className="text-lg font-semibold">Top Performing Sellers</h2>
        </div>
      </div>
      <div className="divide-y divide-gray-200">
        {sellers.map((seller, index) => (
          <div key={seller.name} className="p-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={seller.avatar}
                  alt={seller.name}
                  className="w-12 h-12 rounded-full"
                />
                {index === 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    1
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{seller.name}</h3>
                <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                  <span>{seller.sales} sales</span>
                  <div className="flex items-center gap-1 text-green-600">
                    <TrendingUp className="h-4 w-4" />
                    {seller.growth}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium text-gray-900">
                  ${seller.revenue.toLocaleString()}
                </div>
                <p className="text-sm text-gray-600">Revenue</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}