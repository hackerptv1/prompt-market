import React from 'react';
import { Store, UserCircle } from 'lucide-react';
import type { UserRole } from '../../pages/AuthPage';

interface RoleSelectionProps {
  onSelect: (role: UserRole) => void;
}

export function RoleSelection({ onSelect }: RoleSelectionProps) {
  return (
    <>
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900">Welcome to PromptMarket</h2>
        <p className="mt-2 text-gray-600">Choose how you want to use the platform</p>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4">
        <button
          onClick={() => onSelect('buyer')}
          className="relative bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-200 group"
        >
          <div className="flex flex-col items-center">
            <UserCircle className="h-12 w-12 text-blue-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900">Buyer</h3>
            <p className="mt-2 text-sm text-gray-600 text-center">
              Browse and purchase AI prompts
            </p>
          </div>
          <div className="absolute inset-0 rounded-xl ring-2 ring-transparent group-hover:ring-blue-500 transition-all" />
        </button>

        <button
          onClick={() => onSelect('seller')}
          className="relative bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-200 group"
        >
          <div className="flex flex-col items-center">
            <Store className="h-12 w-12 text-blue-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900">Seller</h3>
            <p className="mt-2 text-sm text-gray-600 text-center">
              Create and sell AI prompts
            </p>
          </div>
          <div className="absolute inset-0 rounded-xl ring-2 ring-transparent group-hover:ring-blue-500 transition-all" />
        </button>
      </div>
    </>
  );
}