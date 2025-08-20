// Google OAuth utility for Vite/React projects

import { supabase } from './supabase';

/**
 * Initiate Google OAuth flow
 */
export function initiateGoogleOAuth(userId: string): void {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const redirectUri = import.meta.env.VITE_GOOGLE_REDIRECT_URI || `${window.location.origin}/auth/google/callback`;
  
  if (!clientId) {
    console.error('Google Client ID not configured');
    alert('Google Calendar integration is not configured. Please contact support.');
    return;
  }

  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${clientId}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `response_type=code&` +
    `scope=${encodeURIComponent('https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events')}&` +
    `access_type=offline&` +
    `prompt=consent&` +
    `state=${userId}`;

  // Store the expected state for verification
  localStorage.setItem('google_oauth_state', userId);
  
  // Redirect to Google OAuth
  window.location.href = googleAuthUrl;
}

/**
 * Handle Google OAuth callback
 */
export async function handleGoogleOAuthCallback(): Promise<{ success: boolean; error?: string }> {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  const state = urlParams.get('state');
  const error = urlParams.get('error');

  // Check for OAuth errors
  if (error) {
    return { success: false, error: `OAuth error: ${error}` };
  }

  // Verify state parameter
  const expectedState = localStorage.getItem('google_oauth_state');
  if (!state || state !== expectedState) {
    return { success: false, error: 'Invalid OAuth state parameter' };
  }

  if (!code) {
    return { success: false, error: 'No authorization code received' };
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await exchangeCodeForTokens(code);
    
    if (!tokenResponse.success) {
      return tokenResponse;
    }

    // Store tokens in database
    const { error: dbError } = await supabase
      .from('profiles')
      .update({
        google_calendar_connected: true,
        google_calendar_access_token: tokenResponse.access_token,
        google_calendar_refresh_token: tokenResponse.refresh_token,
        google_calendar_token_expires_at: tokenResponse.expires_at,
      })
      .eq('id', state);

    if (dbError) {
      throw dbError;
    }

    // Clean up
    localStorage.removeItem('google_oauth_state');
    
    return { success: true };

  } catch (error) {
    console.error('Google OAuth callback error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to complete OAuth flow' 
    };
  }
}

/**
 * Exchange authorization code for access tokens
 */
async function exchangeCodeForTokens(code: string): Promise<{
  success: boolean;
  access_token?: string;
  refresh_token?: string;
  expires_at?: string;
  error?: string;
}> {
  try {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const clientSecret = import.meta.env.VITE_GOOGLE_CLIENT_SECRET;
    const redirectUri = import.meta.env.VITE_GOOGLE_REDIRECT_URI || `${window.location.origin}/auth/google/callback`;

    if (!clientId || !clientSecret) {
      throw new Error('Google OAuth credentials not configured');
    }

   // REAL API call to Google OAuth
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Token exchange failed: ${data.error}`);
    }

    return {
      success: true,
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: new Date(Date.now() + data.expires_in * 1000).toISOString()
    };

  } catch (error) {
    console.error('Token exchange error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to exchange tokens'
    };
  }
}

/**
 * Check if user has Google Calendar connected
 */
export async function checkGoogleCalendarConnection(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('google_calendar_connected, google_calendar_access_token')
      .eq('id', userId)
      .single();

    if (error || !data) {
      return false;
    }

    return !!(data.google_calendar_connected && data.google_calendar_access_token);

  } catch (error) {
    console.error('Error checking Google Calendar connection:', error);
    return false;
  }
}

/**
 * Disconnect Google Calendar
 */
export async function disconnectGoogleCalendar(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        google_calendar_connected: false,
        google_calendar_access_token: null,
        google_calendar_refresh_token: null,
        google_calendar_token_expires_at: null
      })
      .eq('id', userId);

    if (error) {
      throw error;
    }

    return { success: true };

  } catch (error) {
    console.error('Error disconnecting Google Calendar:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to disconnect Google Calendar'
    };
  }
} 

/**
 * Reset Google Calendar connection (useful when tokens are missing)
 */
export async function resetGoogleCalendarConnection(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        google_calendar_connected: false,
        google_calendar_access_token: null,
        google_calendar_refresh_token: null,
        google_calendar_token_expires_at: null
      })
      .eq('id', userId);

    if (error) {
      throw error;
    }

    return { success: true };

  } catch (error) {
    console.error('Error resetting Google Calendar connection:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to reset Google Calendar connection'
    };
  }
}

/**
 * Check if Google Calendar connection is properly configured
 */
export async function checkGoogleCalendarConnectionStatus(userId: string): Promise<{
  connected: boolean;
  hasTokens: boolean;
  needsReconnection: boolean;
  details: any;
}> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('google_calendar_connected, google_calendar_access_token, google_calendar_refresh_token, google_calendar_token_expires_at')
      .eq('id', userId)
      .single();

    if (error || !data) {
      return {
        connected: false,
        hasTokens: false,
        needsReconnection: true,
        details: { error: error?.message || 'User not found' }
      };
    }

    const hasTokens = !!(data.google_calendar_access_token && data.google_calendar_refresh_token);
    const needsReconnection = data.google_calendar_connected && !hasTokens;

    return {
      connected: data.google_calendar_connected,
      hasTokens,
      needsReconnection,
      details: {
        connected: data.google_calendar_connected,
        hasAccessToken: !!data.google_calendar_access_token,
        hasRefreshToken: !!data.google_calendar_refresh_token,
        expiresAt: data.google_calendar_token_expires_at
      }
    };

  } catch (error) {
    console.error('Error checking Google Calendar connection status:', error);
    return {
      connected: false,
      hasTokens: false,
      needsReconnection: true,
      details: { error: error instanceof Error ? error.message : 'Unknown error' }
    };
  }
} 