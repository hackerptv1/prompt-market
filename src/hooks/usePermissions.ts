import { useAuth } from '../contexts/AuthContext';

export function usePermissions() {
  const { user } = useAuth();

  const isAuthenticated = !!user;
  const isBuyer = user?.role === 'buyer';
  const isSeller = user?.role === 'seller';
  const isAdmin = user?.role === 'admin';

  const canAccessSellerFeatures = isSeller || isAdmin;
  const canAccessAdminFeatures = isAdmin;
  const canAccessBuyerFeatures = isBuyer || isAdmin;

  const hasRole = (role: 'buyer' | 'seller' | 'admin') => {
    return user?.role === role;
  };

  const hasAnyRole = (roles: ('buyer' | 'seller' | 'admin')[]) => {
    return user ? roles.includes(user.role) : false;
  };

  const canManagePrompts = isSeller || isAdmin;
  const canViewAnalytics = isAdmin;
  const canManageUsers = isAdmin;
  const canModerateContent = isAdmin;
  const canManageCategories = isAdmin;
  const canManagePlatforms = isAdmin;

  return {
    // User state
    isAuthenticated,
    isBuyer,
    isSeller,
    isAdmin,
    
    // Permission checks
    hasRole,
    hasAnyRole,
    
    // Feature permissions
    canAccessSellerFeatures,
    canAccessAdminFeatures,
    canAccessBuyerFeatures,
    canManagePrompts,
    canViewAnalytics,
    canManageUsers,
    canModerateContent,
    canManageCategories,
    canManagePlatforms,
    
    // User data
    user
  };
} 