import React from 'react';
import { OrdersList } from './OrdersList';
import { OrderStats } from './OrderStats';
import { OrderFilters } from './OrderFilters';

export function OrdersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
        <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
          Export Data
        </button>
      </div>

      <OrderStats />
      <OrderFilters />
      <OrdersList />
    </div>
  );
}