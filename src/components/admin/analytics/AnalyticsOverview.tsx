import React from 'react';
import { DollarSign, ShoppingBag, Users, TrendingUp } from 'lucide-react';

export function AnalyticsOverview() {
  const stats = [
    {
      label: 'Total Revenue',
      value: '$124,592',
      change: '+12.5%',
      trend: 'up',
      icon: <DollarSign className="h-6 w-6" />,
      color: 'blue'
    },
    {
      label: 'Total Orders',
      value: '8,642',
      change: '+8.2%',
      trend: 'up',
      icon: <ShoppingBag className="h-6 w-6" />,
      color: 'green'
    },
    {
      label: 'New Users',
      value: '1,245',
      change: '+15.8%',
      trend: 'up',
      icon: <Users className="h-6 w-6" />,
      color: 'purple'
    },
    {
      label: 'Conversion Rate',
      value: '3.2%',
      change: '-2.4%',
      trend: 'down',
      icon: <TrendingUp className="h-6 w-6" />,
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
            <span className={`text-sm font-medium ${
              stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              {stat.change}
            </span>
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