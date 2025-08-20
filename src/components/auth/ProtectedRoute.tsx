import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'buyer' | 'seller' | 'admin';
  fallbackPath?: string;
}

export function ProtectedRoute({ 
  children, 
  requiredRole, 
  fallbackPath = '/auth'
}: ProtectedRouteProps) {
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

  // Redirect to auth if not authenticated
  if (!user) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // Check role-based access
  if (requiredRole && user.role !== requiredRole) {
    // Automatically redirect to appropriate dashboard based on user's actual role
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
    
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
}

// Specific route components for different roles
export function BuyerRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRole="buyer" fallbackPath="/auth">
      {children}
    </ProtectedRoute>
  );
}

export function SellerRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRole="seller" fallbackPath="/auth">
      {children}
    </ProtectedRoute>
  );
}

export function AdminRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRole="admin" fallbackPath="/auth">
      {children}
    </ProtectedRoute>
  );
}

// Route for any authenticated user (no specific role required)
export function AuthenticatedRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute fallbackPath="/auth">
      {children}
    </ProtectedRoute>
  );
} 