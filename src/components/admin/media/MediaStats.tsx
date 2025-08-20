import React from 'react';
import { Image, Film, FileText, HardDrive } from 'lucide-react';

export function MediaStats() {
  const stats = [
    { label: 'Total Images', value: '1,234', icon: <Image />, color: 'blue' },
    { label: 'Total Videos', value: '456', icon: <Film />, color: 'purple' },
    { label: 'Total Documents', value: '789', icon: <FileText />, color: 'green' },
    { label: 'Storage Used', value: '45.8 GB', icon: <HardDrive />, color: 'amber' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div className={`p-2 bg-${stat.color}-50 rounded-lg`}>
              {React.cloneElement(stat.icon, { className: `h-6 w-6 text-${stat.color}-600` })}
            </div>
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