// Test utility for Google Calendar API integration

import { getGoogleAccessToken, createRealGoogleCalendarEvent } from './realGoogleCalendarService';
import { supabase } from './supabase';

/**
 * Test Google Calendar connection for a user
 */
export async function testGoogleCalendarConnection(userId: string): Promise<{
  success: boolean;
  message: string;
  details?: any;
}> {
  try {
    console.log('Testing Google Calendar connection for user:', userId);

    // Check if user has Google Calendar connected
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('google_calendar_connected, google_calendar_email')
      .eq('id', userId)
      .single();

    if (error || !profile) {
      return {
        success: false,
        message: 'User profile not found'
      };
    }

    if (!profile.google_calendar_connected) {
      return {
        success: false,
        message: 'Google Calendar is not connected. Please connect your Google Calendar first.'
      };
    }

    // Get access token
    const accessToken = await getGoogleAccessToken(userId);
    
    if (!accessToken) {
      return {
        success: false,
        message: 'Failed to get Google access token. Please reconnect your Google Calendar.'
      };
    }

    // Test creating a calendar event
    const testEvent = {
      summary: 'Test Consultation Session',
      description: 'This is a test event to verify Google Calendar integration.',
      start: {
        dateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      end: {
        dateTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(), // Tomorrow + 1 hour
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      attendees: [
        { email: profile.google_calendar_email || 'test@example.com' }
      ]
    };

    const result = await createRealGoogleCalendarEvent(testEvent, accessToken);

    if (result.success) {
      return {
        success: true,
        message: 'Google Calendar integration is working correctly!',
        details: {
          eventId: result.event_id,
          meetLink: result.meet_link
        }
      };
    } else {
      return {
        success: false,
        message: `Failed to create test calendar event: ${result.error}`
      };
    }

  } catch (error) {
    console.error('Error testing Google Calendar connection:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Get Google Calendar connection status
 */
export async function getGoogleCalendarStatus(userId: string): Promise<{
  connected: boolean;
  email?: string;
  lastChecked?: string;
}> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('google_calendar_connected, google_calendar_email, google_calendar_token_expires_at')
      .eq('id', userId)
      .single();

    if (error || !data) {
      return { connected: false };
    }

    const isExpired = data.google_calendar_token_expires_at && 
      new Date(data.google_calendar_token_expires_at) <= new Date();

    return {
      connected: data.google_calendar_connected && !isExpired,
      email: data.google_calendar_email,
      lastChecked: new Date().toISOString()
    };

  } catch (error) {
    console.error('Error getting Google Calendar status:', error);
    return { connected: false };
  }
} 

/**
 * Diagnose and fix Google Calendar connection issues
 */
export async function diagnoseGoogleCalendarConnection(userId: string): Promise<{
  success: boolean;
  message: string;
  needsAction: boolean;
  action?: string;
  details?: any;
}> {
  try {
    console.log('Diagnosing Google Calendar connection for user:', userId);

    // Check connection status
    const { data, error } = await supabase
      .from('profiles')
      .select('google_calendar_connected, google_calendar_access_token, google_calendar_refresh_token, google_calendar_token_expires_at, google_calendar_email')
      .eq('id', userId)
      .single();

    if (error || !data) {
      return {
        success: false,
        message: 'User profile not found',
        needsAction: true,
        action: 'User needs to be logged in'
      };
    }

    console.log('Google Calendar connection data:', data);

    const hasTokens = !!(data.google_calendar_access_token && data.google_calendar_refresh_token);
    const isConnected = data.google_calendar_connected;

    if (!isConnected) {
      return {
        success: false,
        message: 'Google Calendar is not connected',
        needsAction: true,
        action: 'Connect Google Calendar',
        details: data
      };
    }

    if (!hasTokens) {
      return {
        success: false,
        message: 'Google Calendar is marked as connected but OAuth tokens are missing. This indicates an incomplete OAuth flow.',
        needsAction: true,
        action: 'Reconnect Google Calendar (OAuth flow was incomplete)',
        details: data
      };
    }

    // Test if tokens are valid by trying to get an access token
    const accessToken = await getGoogleAccessToken(userId);
    
    if (!accessToken) {
      return {
        success: false,
        message: 'Google Calendar tokens are present but invalid or expired',
        needsAction: true,
        action: 'Reconnect Google Calendar (tokens are invalid)',
        details: data
      };
    }

    return {
      success: true,
      message: 'Google Calendar connection is working properly',
      needsAction: false,
      details: {
        ...data,
        accessTokenPresent: !!accessToken
      }
    };

  } catch (error) {
    console.error('Error diagnosing Google Calendar connection:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      needsAction: true,
      action: 'Check console for errors'
    };
  }
}

/**
 * Fix Google Calendar connection by resetting and prompting for reconnection
 */
export async function fixGoogleCalendarConnection(userId: string): Promise<{
  success: boolean;
  message: string;
  nextStep?: string;
}> {
  try {
    console.log('Fixing Google Calendar connection for user:', userId);

    // Reset the connection
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

    return {
      success: true,
      message: 'Google Calendar connection has been reset. Please reconnect your Google Calendar.',
      nextStep: 'Go to seller settings and click "Connect Calendar" to complete the OAuth flow.'
    };

  } catch (error) {
    console.error('Error fixing Google Calendar connection:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to reset Google Calendar connection'
    };
  }
} 

// Make functions available globally for testing in browser console
if (typeof window !== 'undefined') {
  (window as any).testGoogleCalendar = {
    diagnose: diagnoseGoogleCalendarConnection,
    fix: fixGoogleCalendarConnection,
    testConnection: testGoogleCalendarConnection,
    createEvent: createRealGoogleCalendarEvent // Assuming createRealGoogleCalendarEvent is the one to expose
  };
  
  console.log('Google Calendar test functions available globally:');
  console.log('- window.testGoogleCalendar.diagnose(userId)');
  console.log('- window.testGoogleCalendar.fix(userId)');
  console.log('- window.testGoogleCalendar.testConnection(userId)');
  console.log('- window.testGoogleCalendar.createEvent(userId)');
} 