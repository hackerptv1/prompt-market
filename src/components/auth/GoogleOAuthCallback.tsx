import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../utils/supabase';

const GoogleOAuthCallback: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Get role and mode from URL parameters
        const requestedRole = searchParams.get('role') || 'buyer';
        const mode = searchParams.get('mode') || 'signin';
        
        console.log('OAuth Callback - Requested Role:', requestedRole);
        console.log('OAuth Callback - Mode:', mode);
        
        // Get the current session after OAuth redirect
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }
        
        if (!session?.user) {
          setStatus('error');
          setMessage('No user session found. Please try signing in again.');
          setTimeout(() => {
            navigate('/auth');
          }, 3000);
          return;
        }

        console.log('OAuth Callback - User ID:', session.user.id);
        console.log('OAuth Callback - User Email:', session.user.email);

        // Check if user already exists and get their current role
        const { data: existingProfile, error: profileError } = await supabase
          .from('profiles')
          .select('role, seller_status')
          .eq('id', session.user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          // PGRST116 is "not found" error, which is expected for new users
          throw profileError;
        }

        console.log('OAuth Callback - Existing Profile:', existingProfile);

        if (existingProfile) {
          // User already exists - validate role
          console.log('OAuth Callback - Role Validation:', {
            existingRole: existingProfile.role,
            requestedRole: requestedRole,
            match: existingProfile.role === requestedRole
          });
          
          if (existingProfile.role !== requestedRole) {
            setStatus('error');
            setMessage(`You are registered as a ${existingProfile.role}. Please go back to the auth page and select "${existingProfile.role}" role to sign in.`);
            
            // Sign out the user since they tried to access with wrong role
            await supabase.auth.signOut();
            
            setTimeout(() => {
              navigate('/auth');
            }, 3000);
            return;
          }

          // For existing sellers, check their status
          if (existingProfile.role === 'seller') {
            if (existingProfile.seller_status === 'suspended') {
              setStatus('error');
              setMessage('Your seller account has been suspended. Please contact support.');
              await supabase.auth.signOut();
              setTimeout(() => {
                navigate('/auth');
              }, 3000);
              return;
            }

            if (existingProfile.seller_status === 'pending') {
              setStatus('error');
              setMessage('Your seller account is pending approval. Please wait for admin approval.');
              await supabase.auth.signOut();
              setTimeout(() => {
                navigate('/auth');
              }, 3000);
              return;
            }
          }

          // Role matches - proceed with sign in
          setStatus('success');
          setMessage('Successfully signed in with Google!');
          
          setTimeout(() => {
            if (existingProfile.role === 'seller') {
              navigate('/seller');
            } else if (existingProfile.role === 'admin') {
              navigate('/admin');
            } else {
              navigate('/dashboard');
            }
          }, 2000);
        } else {
          // New user - create profile with requested role
          if (mode === 'signup') {
            const { error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: session.user.id,
                email: session.user.email || '',
                full_name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || '',
                role: requestedRole,
                ...(requestedRole === 'seller' && {
                  seller_status: 'pending',
                  display_name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || '',
                  description: '',
                  website_url: '',
                  social_media: {},
                  average_rating: 0,
                  total_sales: 0,
                  total_reviews: 0
                })
              });

            if (insertError) {
              console.error('Error creating user profile:', insertError);
              throw new Error('Failed to create user profile');
            }

            setStatus('success');
            setMessage('Account created successfully!');
            
            setTimeout(() => {
              if (requestedRole === 'seller') {
                navigate('/seller');
              } else if (requestedRole === 'admin') {
                navigate('/admin');
              } else {
                navigate('/dashboard');
              }
            }, 2000);
          } else {
            // User doesn't exist but trying to sign in
            setStatus('error');
            setMessage('Account not found. Please sign up first.');
            await supabase.auth.signOut();
            
            setTimeout(() => {
              navigate('/auth');
            }, 3000);
          }
        }
      } catch (error) {
        console.error('OAuth callback error:', error);
        setStatus('error');
        setMessage('An unexpected error occurred');
        
        // Sign out user if there's an error
        await supabase.auth.signOut();
        
        setTimeout(() => {
          navigate('/auth');
        }, 3000);
      }
    };

    processCallback();
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          {status === 'loading' && (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Completing Google Sign-in...
              </h2>
              <p className="text-gray-600">
                Please wait while we complete the authentication process.
              </p>
            </>
          )}
          
          {status === 'success' && (
            <>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Success!
              </h2>
              <p className="text-gray-600">
                {message}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Redirecting to dashboard...
              </p>
            </>
          )}
          
          {status === 'error' && (
            <>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Authentication Failed
              </h2>
              <p className="text-gray-600 mb-4">
                {message}
              </p>
              <button
                onClick={() => navigate('/auth')}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go Back to Auth Page
              </button>
              <p className="text-sm text-gray-500 mt-2">
                Redirecting automatically in 3 seconds...
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoogleOAuthCallback; 