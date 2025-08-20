import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export function CatchAllRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to auth page
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Redirect to appropriate dashboard based on user's role
  let redirectPath = '/';
  
  switch (user.role) {
    case 'buyer':
      redirectPath = '/dashboard';
      break;
    case 'seller':
      redirectPath = '/seller';
      break;
    case 'admin':
      redirectPath = '/admin';
      break;
    default:
      redirectPath = '/auth';
  }

  // Log the redirect for debugging purposes
  useEffect(() => {
    console.log(`CatchAllRoute: Redirecting from ${location.pathname} to ${redirectPath} for user role: ${user.role}`);
  }, [location.pathname, redirectPath, user.role]);

  return <Navigate to={redirectPath} replace />;
} 