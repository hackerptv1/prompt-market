import React from 'react';
import { Wallet, Plus } from 'lucide-react';

export function WalletSection() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-6">Wallet Balance</h2>
      <div className="text-3xl font-bold text-gray-900 mb-4">$249.99</div>
      <button className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
        <Plus className="h-5 w-5" />
        Add Funds
      </button>
    </div>
  );
}