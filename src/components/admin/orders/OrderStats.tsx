import React from 'react';
import { DollarSign, ShoppingBag, TrendingUp, AlertTriangle } from 'lucide-react';

export function OrderStats() {
  const stats = [
    {
      label: 'Total Orders',
      value: '1,234',
      change: '+12%',
      icon: <ShoppingBag className="h-6 w-6" />,
      color: 'blue'
    },
    {
      label: 'Revenue',
      value: '$12,345',
      change: '+8%',
      icon: <DollarSign className="h-6 w-6" />,
      color: 'green'
    },
    {
      label: 'Avg. Order Value',
      value: '$45.99',
      change: '+15%',
      icon: <TrendingUp className="h-6 w-6" />,
      color: 'purple'
    },
    {
      label: 'Failed Orders',
      value: '23',
      change: '-5%',
      icon: <AlertTriangle className="h-6 w-6" />,
      color: 'red'
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