import React from 'react';
import { Edit2, Trash2, CheckCircle } from 'lucide-react';

const packages = [
  {
    id: 1,
    name: 'Basic',
    type: 'Free',
    price: 0,
    features: ['5 prompts/month', 'Basic support', 'Community access'],
    activeUsers: 2450
  },
  {
    id: 2,
    name: 'Pro',
    type: 'Premium',
    price: 29.99,
    features: ['Unlimited prompts', 'Priority support', 'API access', 'Custom branding'],
    activeUsers: 1280
  },
  {
    id: 3,
    name: 'Enterprise',
    type: 'Premium',
    price: 99.99,
    features: ['Unlimited everything', '24/7 support', 'Custom development', 'Dedicated manager'],
    activeUsers: 350
  }
];

export function PackageList() {
  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
        {packages.map((pkg) => (
          <div key={pkg.id} className="border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{pkg.name}</h3>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  pkg.type === 'Premium' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                }`}>
                  {pkg.type}
                </span>
              </div>
              <div className="flex gap-2">
                <button className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50">
                  <Edit2 className="h-5 w-5" />
                </button>
                <button className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50">
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="mt-4">
              <div className="text-3xl font-bold text-gray-900">
                ${pkg.price}
                <span className="text-sm text-gray-500 font-normal">/month</span>
              </div>
            </div>

            <ul className="mt-6 space-y-4">
              {pkg.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-600">{feature}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                <span className="font-medium text-gray-900">{pkg.activeUsers.toLocaleString()}</span> active users
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}