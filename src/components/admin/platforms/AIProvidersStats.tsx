import React from 'react';
import { Cpu, Zap, Server, DollarSign } from 'lucide-react';

export function AIProvidersStats() {
  const stats = [
    {
      label: 'Total Providers',
      value: '8',
      change: '+2',
      icon: <Server className="h-6 w-6" />,
      color: 'blue'
    },
    {
      label: 'Active Models',
      value: '24',
      change: '+5',
      icon: <Cpu className="h-6 w-6" />,
      color: 'purple'
    },
    {
      label: 'API Calls',
      value: '458K',
      change: '+12%',
      icon: <Zap className="h-6 w-6" />,
      color: 'green'
    },
    {
      label: 'Avg. Cost/Call',
      value: '$0.15',
      change: '-3%',
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