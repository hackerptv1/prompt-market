import React, { useState } from 'react';
import { Mail, Lock, Github } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { UserRole } from '../../pages/AuthPage';
import { SocialButton } from './SocialButton';
import { RoleHelper } from './RoleHelper';
import { supabase } from '../../utils/supabase';

interface LoginFormProps {
  role: UserRole;
  onModeChange: () => void;
}

export function LoginForm({ role, onModeChange }: LoginFormProps) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentRole, setCurrentRole] = useState<UserRole>(role);

  const handleRoleFound = (detectedRole: 'buyer' | 'seller' | 'admin') => {
    setCurrentRole(detectedRole);
    // Clear any existing errors when role is detected
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // 1. Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      if (authData.user) {
        // 2. Get the user's profile to verify their role
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role, seller_status')
          .eq('id', authData.user.id)
          .single();

        if (profileError) throw profileError;

        // 3. Verify that the user's role matches the selected role
        if (profileData.role !== currentRole) {
          // Sign out the user since they tried to access with wrong role
          await supabase.auth.signOut();
          throw new Error(`You are registered as a ${profileData.role}. Please go back to the auth page and select "${profileData.role}" role to sign in.`);
        }

        // 4. If the user is a seller, verify their seller status
        if (currentRole === 'seller') {
          if (profileData.seller_status === 'suspended') {
            await supabase.auth.signOut();
            throw new Error('Your seller account has been suspended. Please contact support for more information.');
          }

          if (profileData.seller_status === 'pending') {
            await supabase.auth.signOut();
            throw new Error('Your seller account is pending approval. Please wait for admin approval.');
          }
        }

        // Navigate to the appropriate dashboard
        if (currentRole === 'seller') {
          navigate('/seller');
        } else if (currentRole === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (error) {
      console.error('Error signing in:', error);
      setError(error instanceof Error ? error.message : 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setError(null);
      setIsLoading(true);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/google/callback?role=${currentRole || 'buyer'}&mode=signin`
        }
      });

      if (error) {
        console.error('Error signing in with Google:', error);
        setError(error.message);
      }
    } catch (error) {
      console.error('Error signing in with Google:', error);
      setError('Failed to sign in with Google. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGithubSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/google/callback?role=${currentRole || 'buyer'}&mode=signin`
      }
    });

    if (error) {
      console.error('Error signing in with GitHub:', error);
      setError(error.message);
    }
  };

  return (
    <>
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900">Welcome back</h2>
        <p className="mt-2 text-gray-600">Sign in as a {currentRole} to continue</p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <div className="mt-1 relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter your email"
              />
            </div>
            <RoleHelper email={email} onRoleFound={handleRoleFound} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="mt-1 relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter your password"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-red-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div className="flex-1">
                <p className="text-sm text-red-800">{error}</p>
                {error.includes('registered as a') && (
                  <button
                    type="button"
                    onClick={() => window.location.href = '/auth'}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-700 underline"
                  >
                    Go back to role selection
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isLoading ? 'Signing in...' : 'Sign in'}
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <SocialButton
            icon={<Github className="h-5 w-5" />}
            onClick={handleGithubSignIn}
            text="GitHub"
          />
          <SocialButton
            icon={<svg className="h-5 w-5" viewBox="0 0 24 24"><path fill="currentColor" d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/></svg>}
            onClick={handleGoogleSignIn}
            text="Google"
          />
        </div>

        <div className="text-center">
          <button
            type="button"
            onClick={onModeChange}
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            Don't have an account? Sign up
          </button>
        </div>
      </form>
    </>
  );
}