import React, { useState } from 'react';
import { supabase } from '../../utils/supabase';

export function OAuthTest() {
  const [status, setStatus] = useState<string>('');
  const [error, setError] = useState<string>('');

  const testGoogleOAuth = async () => {
    try {
      setStatus('Testing Google OAuth...');
      setError('');

      // Test if Google OAuth is configured
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/google/callback?test=true`,
          queryParams: {
            role: 'buyer',
            mode: 'test'
          }
        }
      });

      if (error) {
        setError(`OAuth Error: ${error.message}`);
        setStatus('Failed');
      } else {
        setStatus('OAuth initiated successfully!');
      }
    } catch (err) {
      setError(`Unexpected error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setStatus('Failed');
    }
  };

  const checkEnvironment = () => {
    const envVars = {
      'VITE_SUPABASE_URL': import.meta.env.VITE_SUPABASE_URL,
      'VITE_SUPABASE_ANON_KEY': import.meta.env.VITE_SUPABASE_ANON_KEY,
      'VITE_GOOGLE_CLIENT_ID': import.meta.env.VITE_GOOGLE_CLIENT_ID,
      'VITE_GOOGLE_CLIENT_SECRET': import.meta.env.VITE_GOOGLE_CLIENT_SECRET,
    };

    const missing = Object.entries(envVars)
      .filter(([key, value]) => !value)
      .map(([key]) => key);

    if (missing.length > 0) {
      setError(`Missing environment variables: ${missing.join(', ')}`);
      setStatus('Environment check failed');
    } else {
      setStatus('Environment variables are configured');
      setError('');
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold mb-4">Google OAuth Test</h3>
      
      <div className="space-y-4">
        <button
          onClick={checkEnvironment}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          Check Environment Variables
        </button>

        <button
          onClick={testGoogleOAuth}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Test Google OAuth
        </button>

        {status && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded">
            <p className="text-blue-800">{status}</p>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded">
            <p className="text-red-800">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
} 