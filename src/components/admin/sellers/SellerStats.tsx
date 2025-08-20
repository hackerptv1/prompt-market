import React from 'react';
import { Users, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

export function SellerStats() {
  const stats = [
    {
      label: 'Total Sellers',
      value: '1,234',
      change: '+12%',
      icon: <Users className="h-6 w-6" />,
      color: 'blue'
    },
    {
      label: 'Active Sellers',
      value: '1,089',
      change: '+8%',
      icon: <CheckCircle className="h-6 w-6" />,
      color: 'green'
    },
    {
      label: 'Pending Approval',
      value: '145',
      change: '+15%',
      icon: <AlertCircle className="h-6 w-6" />,
      color: 'yellow'
    },
    {
      label: 'Avg. Seller Rating',
      value: '4.8',
      change: '+5%',
      icon: <TrendingUp className="h-6 w-6" />,
      color: 'purple'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div className={`p-2 bg-${stat.color}-50 rounded-lg`}>
              {React.cloneElement(stat.icon, { className: `h-6 w-6 text-${stat.color}-600` })}
            </div>
            <span className={`text-sm font-medium text-${stat.color}-600`}>{stat.change}</span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
            <p className="text-sm text-gray-600">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}