import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';

interface RoleHelperProps {
  email: string;
  onRoleFound: (role: 'buyer' | 'seller' | 'admin') => void;
}

export function RoleHelper({ email, onRoleFound }: RoleHelperProps) {
  const [isChecking, setIsChecking] = useState(false);
  const [userRole, setUserRole] = useState<'buyer' | 'seller' | 'admin' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkUserRole = async () => {
    if (!email || !email.includes('@')) return;
    
    setIsChecking(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('email', email.toLowerCase())
        .maybeSingle();

      if (error) {
        console.error('Error checking user role:', error);
        setError('Failed to check user role');
        return;
      }

      if (data) {
        setUserRole(data.role as 'buyer' | 'seller');
        onRoleFound(data.role as 'buyer' | 'seller');
      } else {
        setUserRole(null);
      }
    } catch (err) {
      console.error('Error checking user role:', err);
      setError('Failed to check user role');
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    // Debounce the email check
    const timeoutId = setTimeout(() => {
      if (email && email.includes('@')) {
        checkUserRole();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [email]);

  if (!email || !email.includes('@')) return null;

  return (
    <div className="mt-2">
      {isChecking && (
        <div className="text-sm text-gray-500">
          Checking if you have an existing account...
        </div>
      )}
      
      {userRole && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-blue-800">
                Account Found
              </p>
              <p className="text-sm text-blue-700">
                You have an existing account as a <strong>{userRole}</strong>. 
              </p>
            </div>
          </div>
        </div>
      )}
      
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}
    </div>
  );
} 