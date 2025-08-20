import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Settings, LogOut, Shield, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useConsultationBookings } from '../hooks/useConsultationBookings';

export function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { getUpcomingBookings } = useConsultationBookings({
    includeSellerInfo: false
  });

  const upcomingBookings = getUpcomingBookings();
  const hasUpcomingConsultations = upcomingBookings.length > 0;

  if (!user) {
    return (
      <Link
        to="/auth"
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Sign In
      </Link>
    );
  }

    return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 focus:outline-none"
      >
        <img
          src={user.profile_picture_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'}
          alt={user.full_name}
          className="w-8 h-8 rounded-full object-cover border border-gray-200"
        />
        <span className="hidden sm:block text-sm text-gray-700">{user.full_name}</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-100 z-20 max-h-96 overflow-y-auto right-0 sm:right-0 sm:left-auto left-0 min-w-max">
            <div className="p-3 border-b border-gray-100">
              <p className="font-medium text-gray-900">{user.full_name}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
            <div className="p-2">
              <Link
                to="/dashboard"
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                onClick={() => setIsOpen(false)}
              >
                <User className="h-4 w-4" />
                Dashboard
              </Link>
              <Link
                to="/consultations"
                className="flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                onClick={() => setIsOpen(false)}
              >
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {user.role === 'seller' ? 'My Bookings' : 'My Consultations'}
                </div>
                {hasUpcomingConsultations && (
                  <span className="bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                    {upcomingBookings.length > 9 ? '9+' : upcomingBookings.length}
                  </span>
                )}
              </Link>
              <Link
                to="/settings"
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                onClick={() => setIsOpen(false)}
              >
                <Settings className="h-4 w-4" />
                Settings
              </Link>
              {user.role === 'seller' && (
                <Link
                  to="/seller"
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                  onClick={() => setIsOpen(false)}
                >
                  <Shield className="h-4 w-4" />
                  Seller Dashboard
                </Link>
              )}
              <button
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
                onClick={() => {
                  setIsOpen(false);
                  signOut();
                }}
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}