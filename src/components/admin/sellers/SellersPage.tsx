import React from 'react';
import { SellersList } from './SellersList';
import { SellerStats } from './SellerStats';

export function SellersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Sellers Management</h1>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Export Data
        </button>
      </div>
      <SellerStats />
      <SellersList />
    </div>
  );
}