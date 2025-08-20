import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { usePermissions } from '../../hooks/usePermissions';

export function RouteProtectionTest() {
  const { user } = useAuth();
  const { isAuthenticated, isBuyer, isSeller, isAdmin } = usePermissions();

  const testRedirects = () => {
    const testPaths = [
      '/random-path-123',
      '/seller/wrong-path',
      '/admin/nonexistent',
      '/dashboard/invalid',
      '/some/random/url'
    ];

    console.log('=== Route Protection Test ===');
    console.log('Current user:', user);
    console.log('User role:', user?.role);
    console.log('Permissions:', { isAuthenticated, isBuyer, isSeller, isAdmin });

    testPaths.forEach(path => {
      console.log(`Testing path: ${path}`);
      // Simulate what would happen when accessing these paths
      let expectedRedirect = '/';
      
      if (!isAuthenticated) {
        expectedRedirect = '/auth';
      } else {
        switch (user?.role) {
          case 'buyer':
            expectedRedirect = '/dashboard';
            break;
          case 'seller':
            expectedRedirect = '/seller';
            break;
          case 'admin':
            expectedRedirect = '/admin';
            break;
          default:
            expectedRedirect = '/auth';
        }
      }
      
      console.log(`  → Would redirect to: ${expectedRedirect}`);
    });
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold mb-4">Route Protection Test</h3>
      
      <div className="space-y-4">
        <div>
          <h4 className="font-medium mb-2">Current User State</h4>
          <div className="bg-gray-100 p-3 rounded">
            <p><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
            <p><strong>Role:</strong> {user?.role || 'None'}</p>
            <p><strong>Email:</strong> {user?.email || 'None'}</p>
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2">Role Permissions</h4>
          <div className="bg-gray-100 p-3 rounded">
            <p><strong>Is Buyer:</strong> {isBuyer ? 'Yes' : 'No'}</p>
            <p><strong>Is Seller:</strong> {isSeller ? 'Yes' : 'No'}</p>
            <p><strong>Is Admin:</strong> {isAdmin ? 'Yes' : 'No'}</p>
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2">Expected Redirects</h4>
          <div className="bg-gray-100 p-3 rounded">
            <p><strong>Unauthenticated:</strong> → /auth</p>
            <p><strong>Buyer:</strong> → /dashboard</p>
            <p><strong>Seller:</strong> → /seller</p>
            <p><strong>Admin:</strong> → /admin</p>
          </div>
        </div>

        <button
          onClick={testRedirects}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Test Redirects (Check Console)
        </button>

        <div className="text-sm text-gray-600">
          <p><strong>Test Instructions:</strong></p>
          <ol className="list-decimal list-inside space-y-1 mt-2">
            <li>Click "Test Redirects" to see expected behavior in console</li>
            <li>Try accessing random URLs like /random-path-123</li>
            <li>Verify you get redirected to your appropriate dashboard</li>
            <li>Check browser console for redirect logs</li>
          </ol>
        </div>
      </div>
    </div>
  );
} 