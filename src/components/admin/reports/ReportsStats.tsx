import React from 'react';
import { AlertTriangle, CheckCircle, Clock, Flag } from 'lucide-react';

export function ReportsStats() {
  const stats = [
    {
      label: 'Open Reports',
      value: '24',
      change: '+3',
      icon: <Flag className="h-6 w-6" />,
      color: 'red'
    },
    {
      label: 'Under Review',
      value: '12',
      change: '+2',
      icon: <Clock className="h-6 w-6" />,
      color: 'yellow'
    },
    {
      label: 'Resolved Today',
      value: '45',
      change: '+8',
      icon: <CheckCircle className="h-6 w-6" />,
      color: 'green'
    },
    {
      label: 'Critical Issues',
      value: '5',
      change: '-2',
      icon: <AlertTriangle className="h-6 w-6" />,
      color: 'orange'
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
            <span className="text-sm font-medium text-gray-600">{stat.change} today</span>
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