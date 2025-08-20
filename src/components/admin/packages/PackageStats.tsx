import React from 'react';
import { Users, Crown, TrendingUp, DollarSign } from 'lucide-react';

export function PackageStats() {
  const stats = [
    {
      label: 'Total Subscribers',
      value: '4,080',
      change: '+12%',
      icon: <Users className="h-6 w-6" />,
      color: 'blue'
    },
    {
      label: 'Premium Users',
      value: '1,630',
      change: '+8%',
      icon: <Crown className="h-6 w-6" />,
      color: 'purple'
    },
    {
      label: 'Conversion Rate',
      value: '38.2%',
      change: '+5%',
      icon: <TrendingUp className="h-6 w-6" />,
      color: 'green'
    },
    {
      label: 'MRR',
      value: '$45.8K',
      change: '+15%',
      icon: <DollarSign className="h-6 w-6" />,
      color: 'amber'
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