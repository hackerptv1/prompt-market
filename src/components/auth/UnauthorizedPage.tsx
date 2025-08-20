import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface UnauthorizedPageProps {
  requiredRole?: 'buyer' | 'seller' | 'admin';
  currentRole?: 'buyer' | 'seller' | 'admin';
}

export function UnauthorizedPage({ requiredRole, currentRole }: UnauthorizedPageProps) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const getRedirectPath = () => {
    if (!user) return '/auth';
    switch (user.role) {
      case 'seller':
        return '/seller';
      case 'buyer':
        return '/dashboard';
      case 'admin':
        return '/admin';
      default:
        return '/auth';
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'buyer':
        return 'Buyer';
      case 'seller':
        return 'Seller';
      case 'admin':
        return 'Administrator';
      default:
        return role;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Access Denied
          </h2>
          
          <p className="text-gray-600 mb-6">
            {requiredRole && currentRole ? (
              <>
                This page requires <strong>{getRoleDisplayName(requiredRole)}</strong> access, 
                but you are logged in as a <strong>{getRoleDisplayName(currentRole)}</strong>.
              </>
            ) : (
              "You don't have permission to access this page."
            )}
          </p>

          <div className="space-y-3">
            <button
              onClick={() => navigate(getRedirectPath())}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Your Dashboard
            </button>
            
            <button
              onClick={() => navigate('/')}
              className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Go to Homepage
            </button>
            
            {user && (
              <button
                onClick={() => navigate('/auth')}
                className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Sign Out
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 