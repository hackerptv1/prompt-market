import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, Settings, LogOut, Calendar, User, Store, Home, Search } from 'lucide-react';
import { Logo } from './Logo';
import { useAuth } from '../contexts/AuthContext';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  isActive: (path: string) => string;
}

export function MobileMenu({ isOpen, onClose, isActive }: MobileMenuProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  if (!isOpen) return null;

  // Function to handle navigation for non-logged-in users
  const handleNavigation = (path: string, requiresAuth: boolean = false) => {
    if (!user && requiresAuth) {
      // Redirect to sign-in page for protected routes
      navigate('/auth');
      onClose();
    } else {
      // Normal navigation for logged-in users or public routes
      onClose();
    }
  };

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
            {/* Public routes - always visible */}
            <Link
              to="/"
              className={`block px-4 py-3 rounded-lg hover:bg-gray-50 ${isActive('/')}`}
              onClick={onClose}
            >
              <div className="flex items-center gap-3">
                <Home className="h-5 w-5" />
                Home
              </div>
            </Link>
            
            <Link
              to="/browse"
              className={`block px-4 py-3 rounded-lg hover:bg-gray-50 ${isActive('/browse')}`}
              onClick={onClose}
            >
              <div className="flex items-center gap-3">
                <Search className="h-5 w-5" />
                Browse
              </div>
            </Link>

            {/* Protected routes - visible to all but redirect non-logged-in users */}
            {user ? (
              // For logged-in users, show actual links
              <>
                <Link
                  to="/dashboard"
                  className={`block px-4 py-3 rounded-lg hover:bg-gray-50 ${isActive('/dashboard')}`}
                  onClick={onClose}
                >
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5" />
                    Dashboard
                  </div>
                </Link>
                <Link
                  to="/consultations"
                  className={`block px-4 py-3 rounded-lg hover:bg-gray-50 ${isActive('/consultations')}`}
                  onClick={onClose}
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5" />
                    {user.role === 'seller' ? 'My Bookings' : 'My Consultations'}
                  </div>
                </Link>
                {user.role === 'seller' && (
                  <>
                    <Link
                      to="/seller"
                      className={`block px-4 py-3 rounded-lg hover:bg-gray-50 ${isActive('/seller')}`}
                      onClick={onClose}
                    >
                      <div className="flex items-center gap-3">
                        <Store className="h-5 w-5" />
                        Seller Dashboard
                      </div>
                    </Link>
                    <Link
                      to="/seller/profile"
                      className={`block px-4 py-3 rounded-lg hover:bg-gray-50 ${isActive('/seller/profile')}`}
                      onClick={onClose}
                    >
                      <div className="flex items-center gap-3">
                        <User className="h-5 w-5" />
                        Seller Profile
                      </div>
                    </Link>
                  </>
                )}
                <Link
                  to="/settings"
                  className={`block px-4 py-3 rounded-lg hover:bg-gray-50 ${isActive('/settings')}`}
                  onClick={onClose}
                >
                  <div className="flex items-center gap-3">
                    <Settings className="h-5 w-5" />
                    Settings
                  </div>
                </Link>
              </>
            ) : (
              // For non-logged-in users, show buttons that redirect to sign-in
              <>
                <button
                  onClick={() => handleNavigation('/dashboard', true)}
                  className={`w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 ${isActive('/dashboard')}`}
                >
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5" />
                    Dashboard
                  </div>
                </button>

                <button
                  onClick={() => handleNavigation('/consultations', true)}
                  className={`w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 ${isActive('/consultations')}`}
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5" />
                    Consultations
                  </div>
                </button>

                <button
                  onClick={() => handleNavigation('/seller', true)}
                  className={`w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 ${isActive('/seller')}`}
                >
                  <div className="flex items-center gap-3">
                    <Store className="h-5 w-5" />
                    Seller Dashboard
                  </div>
                </button>

                <button
                  onClick={() => handleNavigation('/seller/profile', true)}
                  className={`w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 ${isActive('/seller/profile')}`}
                >
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5" />
                    Seller Profile
                  </div>
                </button>

                <button
                  onClick={() => handleNavigation('/settings', true)}
                  className={`w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 ${isActive('/settings')}`}
                >
                  <div className="flex items-center gap-3">
                    <Settings className="h-5 w-5" />
                    Settings
                  </div>
                </button>
              </>
            )}
          </nav>

          {/* Bottom section */}
          {user ? (
            // Sign out for logged-in users
            <div className="mt-4 pt-4 border-t border-gray-100 space-y-1">
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
          ) : (
            // Sign in/Sign up for non-logged-in users
            <div className="mt-4 pt-4 border-t border-gray-100 space-y-1">
              <Link
                to="/browse"
                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-gray-900 rounded-lg hover:bg-gray-50"
                onClick={onClose}
              >
                <Search className="h-5 w-5" />
                Browse Prompts
              </Link>
              <Link
                to="/auth"
                className="flex items-center gap-3 px-4 py-3 text-blue-600 hover:text-blue-700 rounded-lg hover:bg-blue-50"
                onClick={onClose}
              >
                <User className="h-5 w-5" />
                Sign In / Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}