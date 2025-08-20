import React from 'react';
import { CheckCircle, AlertTriangle } from 'lucide-react';

export function SystemStatus() {
  const services = [
    { name: 'API Server', status: 'operational', uptime: '99.99%' },
    { name: 'Database', status: 'operational', uptime: '99.95%' },
    { name: 'Storage', status: 'operational', uptime: '99.99%' },
    { name: 'Payment Gateway', status: 'degraded', uptime: '98.50%' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold">System Status</h2>
      </div>
      <div className="divide-y divide-gray-200">
        {services.map((service) => (
          <div key={service.name} className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {service.status === 'operational' ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                )}
                <span className="font-medium">{service.name}</span>
              </div>
              <div className="text-right">
                <span className={`text-sm font-medium ${
                  service.status === 'operational' ? 'text-green-600' : 'text-amber-600'
                }`}>
                  {service.status}
                </span>
                <p className="text-sm text-gray-600">{service.uptime} uptime</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}