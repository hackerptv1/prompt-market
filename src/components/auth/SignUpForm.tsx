import React, { useState } from 'react';
import { User, Mail, Lock, Github } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { UserRole } from '../../pages/AuthPage';
import { SocialButton } from './SocialButton';
import { supabase } from '../../utils/supabase';

interface SignUpFormProps {
  role: UserRole;
  onModeChange: () => void;
}

export function SignUpForm({ role, onModeChange }: SignUpFormProps) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // First check if the user already exists
      const { data: existingUser, error: checkError } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('email', formData.email)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking existing user:', checkError);
      }

      if (existingUser) {
        setError(`An account with this email already exists as a ${existingUser.role}. Please sign in instead.`);
        setIsLoading(false);
        return;
      }

      // 1. Sign up the user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            role: role,
          },
        },
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          setError('An account with this email already exists. Please sign in instead.');
        } else {
          console.error('Auth error:', authError);
          setError(authError.message);
        }
        return;
      }

      if (!authData.user) {
        throw new Error('No user data returned from signup');
      }

      // 2. Create the user profile with seller fields if applicable
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert([
          {
            id: authData.user.id,
            email: formData.email,
            full_name: formData.fullName,
            role: role,
            ...(role === 'seller' && {
              seller_status: 'pending',
              display_name: formData.fullName,
              description: '',
              website_url: '',
              social_media: {},
              average_rating: 0,
              total_sales: 0,
              total_reviews: 0
            })
          }
        ], {
          onConflict: 'id',
          ignoreDuplicates: false
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        // If profile creation fails, we should clean up the auth user
        await supabase.auth.admin.deleteUser(authData.user.id);
        throw profileError;
      }

      // 3. Sign in the user after successful signup
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (signInError) {
        console.error('Sign in error:', signInError);
        throw signInError;
      }

      // 4. Navigate to the appropriate dashboard
      if (role === 'seller') {
        navigate('/seller');
      } else if (role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error in signup process:', error);
      if (error instanceof Error) {
        if (error.message.includes('already registered')) {
          setError('An account with this email already exists. Please sign in instead.');
        } else {
          setError(error.message);
        }
      } else {
        setError('Failed to sign up. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      setError(null);
      setIsLoading(true);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/google/callback?role=${role || 'buyer'}&mode=signup`
        }
      });

      if (error) {
        console.error('Error signing up with Google:', error);
        setError(error.message);
      }
    } catch (error) {
      console.error('Error signing up with Google:', error);
      setError('Failed to sign up with Google. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGithubSignUp = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/google/callback?role=${role || 'buyer'}&mode=signup`
      }
    });

    if (error) {
      console.error('Error signing up with GitHub:', error);
      setError(error.message);
    }
  };

  return (
    <>
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900">Create an account</h2>
        <p className="mt-2 text-gray-600">Join as a {role} to get started</p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <div className="mt-1 relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="pl-10 w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter your name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <div className="mt-1 relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="pl-10 w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter your email"
              />
            </div>
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
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="pl-10 w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                placeholder="Create a password"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="text-red-600 text-sm">
            {error}
            {error.includes('already exists') && (
              <button
                type="button"
                onClick={onModeChange}
                className="ml-2 text-blue-600 hover:text-blue-700 underline"
              >
                Sign in now
              </button>
            )}
          </div>
        )}

        <div className="flex items-center">
          <input
            type="checkbox"
            required
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label className="ml-2 block text-sm text-gray-700">
            I agree to the{' '}
            <a href="#" className="text-blue-600 hover:text-blue-700">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-blue-600 hover:text-blue-700">
              Privacy Policy
            </a>
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Creating account...' : 'Create Account'}
        </button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-50 text-gray-500">Or continue with</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <SocialButton
            icon={<svg className="h-5 w-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/><path d="M1 1h22v22H1z" fill="none"/></svg>}
            text="Google"
            onClick={handleGoogleSignUp}
          />
          <SocialButton
            icon={<Github className="h-5 w-5" />}
            text="GitHub"
            onClick={handleGithubSignUp}
          />
        </div>

        <p className="text-center text-sm text-gray-600">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onModeChange}
            className="text-blue-600 hover:text-blue-700"
          >
            Sign in
          </button>
        </p>
      </form>
    </>
  );
}