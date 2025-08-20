import React from 'react';
import { Link } from 'react-router-dom';
import { X, Settings, Shield, LogOut, Calendar } from 'lucide-react';
import { Logo } from './Logo';
import { useAuth } from '../contexts/AuthContext';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  isActive: (path: string) => string;
}

export function MobileMenu({ isOpen, onClose, isActive }: MobileMenuProps) {
  const { user, signOut } = useAuth();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />

      {/* Menu panel */}
      <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <Logo />
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-50"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* User Info */}
        {user && (
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <img
                src={user.profile_picture_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'}
                alt={user.full_name}
                className="w-12 h-12 rounded-full"
              />
              <div>
                <div className="font-medium text-gray-900">{user.full_name}</div>
                <div className="text-sm text-gray-500">{user.email}</div>
              </div>
            </div>
          </div>
        )}

        <div className="p-4">
          <nav className="space-y-1">
            <Link
              to="/browse"
              className={`block px-4 py-3 rounded-lg hover:bg-gray-50 ${isActive('/browse')}`}
              onClick={onClose}
            >
              Browse
            </Link>
            {user && (
              <>
                <Link
                  to="/dashboard"
                  className={`block px-4 py-3 rounded-lg hover:bg-gray-50 ${isActive('/dashboard')}`}
                  onClick={onClose}
                >
                  Dashboard
                </Link>
                <Link
                  to="/consultations"
                  className={`${isActive('/consultations')} flex items-center gap-2 px-3 py-2 text-base font-medium rounded-md transition-colors`}
                  onClick={onClose}
                >
                  <Calendar className="h-5 w-5" />
                  {user.role === 'seller' ? 'My Bookings' : 'My Consultations'}
                </Link>
                {user.role === 'seller' && (
                  <>
                    <Link
                      to="/seller"
                      className={`block px-4 py-3 rounded-lg hover:bg-gray-50 ${isActive('/seller')}`}
                      onClick={onClose}
                    >
                      Seller Dashboard
                    </Link>
                    <Link
                      to="/seller/profile"
                      className={`block px-4 py-3 rounded-lg hover:bg-gray-50 ${isActive('/seller/profile')}`}
                      onClick={onClose}
                    >
                      Seller Profile
                    </Link>
                  </>
                )}
              </>
            )}
          </nav>

          {user && (
            <div className="mt-4 pt-4 border-t border-gray-100 space-y-1">
              <Link
                to="/settings"
                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-gray-900 rounded-lg hover:bg-gray-50"
                onClick={onClose}
              >
                <Settings className="h-5 w-5" />
                Settings
              </Link>
              <button
                className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:text-red-700 rounded-lg hover:bg-red-50"
                onClick={() => {
                  onClose();
                  signOut();
                }}
              >
                <LogOut className="h-5 w-5" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}