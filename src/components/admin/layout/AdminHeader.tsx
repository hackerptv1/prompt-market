import React from 'react';
import { Bell, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Logo } from '../../Logo';

export function AdminHeader() {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-6">
        <div className="flex items-center gap-6">
          {/* Logo with Home Link */}
          <Link 
            to="/" 
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <Logo asLink={false} />
          </Link>

          {/* Search */}
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          <button className="relative p-2 text-gray-600 hover:text-gray-900">
            <Bell className="h-6 w-6" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
          </button>
          <div className="flex items-center gap-3">
            <img
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop"
              alt="Admin"
              className="w-8 h-8 rounded-full"
            />
            <span className="font-medium">Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
}