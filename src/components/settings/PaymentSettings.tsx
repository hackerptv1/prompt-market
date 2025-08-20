import React from 'react';
import { CreditCard, Plus } from 'lucide-react';

export function PaymentSettings() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold mb-6">Payment Settings</h2>
      
      <div className="space-y-6">
        {/* Payment Methods */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900">Payment Methods</h3>
            <button className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700">
              <Plus className="h-4 w-4" />
              Add New
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-50 rounded-lg">
                  <CreditCard className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">•••• •••• •••• 4242</div>
                  <div className="text-sm text-gray-600">Expires 12/24</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">Default</span>
                <button className="text-sm text-red-600 hover:text-red-700">
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Billing Address */}
        <div className="pt-6 border-t border-gray-200">
          <h3 className="font-medium text-gray-900 mb-4">Billing Address</h3>
          <form className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country
                </label>
                <select className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                  <option>United States</option>
                  <option>Canada</option>
                  <option>United Kingdom</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ZIP / Postal Code
                </label>
                <input
                  type="text"
                  className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Street Address
              </label>
              <input
                type="text"
                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State / Province
                </label>
                <input
                  type="text"
                  className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Address
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}