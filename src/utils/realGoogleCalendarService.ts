// Real Google Calendar API Service for actual meeting scheduling

import { supabase } from './supabase';

export interface GoogleCalendarEvent {
  id?: string;
  summary: string;
  description: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  attendees: Array<{
    email: string;
    responseStatus?: string;
  }>;
  conferenceData?: {
    createRequest: {
      requestId: string;
      conferenceSolutionKey: {
        type: string;
      };
    };
  };
  reminders?: {
    useDefault: boolean;
  };
}

export interface GoogleMeetConference {
  conferenceId: string;
  entryPoints: Array<{
    entryPointType: string;
    uri: string;
    label?: string;
  }>;
  conferenceSolution: {
    name: string;
    iconUri: string;
  };
  status: {
    statusCode: string;
  };
}

export interface GoogleCalendarResponse {
  id: string;
  summary: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  conferenceData?: {
    entryPoints: Array<{
      entryPointType: string;
      uri: string;
      label?: string;
    }>;
  };
  htmlLink: string;
}

/**
 * Get Google OAuth2 access token for a user
 */
export async function getGoogleAccessToken(userId: string): Promise<string | null> {
  try {
    console.log('Getting Google access token for user:', userId);
    
    const { data, error } = await supabase
      .from('profiles')
      .select('google_calendar_access_token, google_calendar_refresh_token, google_calendar_token_expires_at, google_calendar_connected')
      .eq('id', userId)
      .single();

    if (error || !data) {
      console.error('Error fetching Google tokens:', error);
      return null;
    }

    console.log('Google Calendar data for user:', {
      connected: data.google_calendar_connected,
      hasAccessToken: !!data.google_calendar_access_token,
      hasRefreshToken: !!data.google_calendar_refresh_token,
      expiresAt: data.google_calendar_token_expires_at
    });

    // Check if token is expired and needs refresh
    if (data.google_calendar_token_expires_at && new Date(data.google_calendar_token_expires_at) <= new Date()) {
      console.log('Token is expired, attempting to refresh...');
      // Token is expired, need to refresh
      const newToken = await refreshGoogleToken(data.google_calendar_refresh_token);
      if (newToken) {
        console.log('Token refreshed successfully');
        return newToken;
      }
    }

    const token = data.google_calendar_access_token || null;
    console.log('Returning access token:', token ? 'Present' : 'Null');
    return token;
  } catch (error) {
    console.error('Error getting Google access token:', error);
    return null;
  }
}

/**
 * Refresh Google OAuth2 token
 */
async function refreshGoogleToken(refreshToken: string): Promise<string | null> {
  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID!,
        client_secret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET!,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Token refresh failed: ${data.error}`);
    }

    // Update the stored token
    await supabase
      .from('profiles')
      .update({
        google_calendar_access_token: data.access_token,
        google_calendar_token_expires_at: new Date(Date.now() + data.expires_in * 1000).toISOString(),
      })
      .eq('google_calendar_refresh_token', refreshToken);

    return data.access_token;
  } catch (error) {
    console.error('Error refreshing Google token:', error);
    return null;
  }
}

/**
 * Create a real Google Calendar event with Google Meet
 */
export async function createRealGoogleCalendarEvent(
  event: GoogleCalendarEvent,
  accessToken: string
): Promise<{ success: boolean; event_id?: string; meet_link?: string; error?: string }> {
  try {
    // Add Google Meet conference data
    const eventWithMeet: GoogleCalendarEvent = {
      ...event,
      conferenceData: {
        createRequest: {
          requestId: `meet_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
          conferenceSolutionKey: {
            type: 'hangoutsMeet'
          }
        }
      },
      reminders: {
        useDefault: true
      }
    };

    console.log('Creating real Google Calendar event:', eventWithMeet);

    const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventWithMeet),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Google Calendar API error:', data);
      throw new Error(`Calendar API error: ${data.error?.message || 'Unknown error'}`);
    }

    const meetLink = data.conferenceData?.entryPoints?.find(
      (ep: any) => ep.entryPointType === 'video'
    )?.uri;

    console.log('Successfully created Google Calendar event:', {
      eventId: data.id,
      meetLink: meetLink,
      htmlLink: data.htmlLink
    });

    return {
      success: true,
      event_id: data.id,
      meet_link: meetLink
    };

  } catch (error) {
    console.error('Error creating Google Calendar event:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create calendar event'
    };
  }
}

/**
 * Send real calendar invites via Google Calendar API
 */
export async function sendRealCalendarInvites(
  eventId: string,
  accessToken: string,
  attendees: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('Sending real calendar invites for event:', eventId, 'to:', attendees);

    const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        attendees: attendees.map(email => ({ email }))
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to send calendar invites: ${errorData.error.message}`);
    }

    return { success: true };

  } catch (error) {
    console.error('Error sending calendar invites:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send calendar invites'
    };
  }
}

/**
 * Create real consultation meeting with Google Calendar integration
 */
export async function createRealConsultationMeeting(
  bookingId: string,
  sellerId: string,
  sellerEmail: string,
  buyerEmail: string,
  startTime: Date,
  endTime: Date,
  summary: string = 'Consultation Session'
): Promise<{ success: boolean; meet_link?: string; event_id?: string; error?: string }> {
  try {
    // Get seller's Google access token
    const accessToken = await getGoogleAccessToken(sellerId);
    
    if (!accessToken) {
      return {
        success: false,
        error: 'Seller does not have Google Calendar connected. Please connect your Google Calendar first.'
      };
    }

    // Create the calendar event
    const event: GoogleCalendarEvent = {
      summary: summary,
      description: `Consultation session scheduled via Prompt Market.\n\nDuration: ${Math.round((endTime.getTime() - startTime.getTime()) / 60000)} minutes\n\nJoin meeting: [Meeting link will be provided]`,
      start: {
        dateTime: startTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      attendees: [
        { email: sellerEmail },
        { email: buyerEmail }
      ]
    };

    // Create the actual Google Calendar event
    const calendarResult = await createRealGoogleCalendarEvent(event, accessToken);
    
    if (!calendarResult.success) {
      return { success: false, error: calendarResult.error };
    }

    // Send calendar invites to both participants
    const inviteResult = await sendRealCalendarInvites(
      calendarResult.event_id!,
      accessToken,
      [sellerEmail, buyerEmail]
    );

    if (!inviteResult.success) {
      console.warn('Failed to send calendar invites:', inviteResult.error);
      // Don't fail the whole process if invites fail
    }

    // Store the real event details in the database
    const stored = await storeRealCalendarEvent(
      bookingId,
      calendarResult.event_id!,
      calendarResult.meet_link!,
      sellerEmail,
      buyerEmail
    );

    if (!stored) {
      return { success: false, error: 'Failed to store calendar event details' };
    }

    return {
      success: true,
      meet_link: calendarResult.meet_link,
      event_id: calendarResult.event_id
    };

  } catch (error) {
    console.error('Error creating real consultation meeting:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create meeting'
    };
  }
}

/**
 * Store real calendar event details in database
 */
async function storeRealCalendarEvent(
  bookingId: string,
  eventId: string,
  meetLink: string,
  sellerEmail: string,
  buyerEmail: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('consultation_bookings')
      .update({
        platform_meeting_id: eventId,
        platform_join_url: meetLink,
        meeting_link: meetLink,
        google_calendar_event_id: eventId,
        google_calendar_meet_link: meetLink,
        google_calendar_invite_sent: true,
        google_calendar_invite_sent_at: new Date().toISOString(),
        buyer_calendar_invite_sent: true,
        buyer_calendar_invite_sent_at: new Date().toISOString()
      })
      .eq('id', bookingId);

    if (error) {
      console.error('Error storing real calendar event:', error);
      return false;
    }

    return true;

  } catch (error) {
    console.error('Error storing real calendar event:', error);
    return false;
  }
}

/**
 * Check if a user has valid Google Calendar access
 */
export async function hasValidGoogleCalendarAccess(userId: string): Promise<boolean> {
  try {
    const accessToken = await getGoogleAccessToken(userId);
    return !!accessToken;
  } catch (error) {
    console.error('Error checking Google Calendar access:', error);
    return false;
  }
} 