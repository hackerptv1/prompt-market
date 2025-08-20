// Meeting link generation service for consultation bookings - Google Meet only with Real Google Calendar API

import { createRealConsultationMeeting, hasValidGoogleCalendarAccess } from './realGoogleCalendarService';
import { supabase } from './supabase';

export interface MeetingLinkData {
  platform_meeting_id?: string;
  platform_meeting_password?: string;
  platform_join_url: string;
  google_calendar_event_id?: string;
  google_calendar_meet_link?: string;
}

/**
 * Generate and store meeting link for a consultation booking
 * Now uses REAL Google Calendar API for actual meeting scheduling
 */
export async function generateAndStoreMeetingLink(
  bookingId: string,
  sellerId: string,
  startTime: string,
  endTime: string,
  platform: string = 'Google Meet'
): Promise<MeetingLinkData | null> {
  try {
    // Check if seller has Google Calendar connected
    const hasCalendarAccess = await hasValidGoogleCalendarAccess(sellerId);
    
    if (!hasCalendarAccess) {
      console.log('Seller does not have Google Calendar connected');
      return null;
    }

    // Get buyer email for calendar integration
    const buyerEmail = await getBuyerEmail(bookingId);
    
    if (!buyerEmail) {
      console.error('Could not get buyer email for calendar integration');
      return null;
    }

    // Get seller email
    const sellerEmail = await getSellerEmail(sellerId);
    
    if (!sellerEmail) {
      console.error('Could not get seller email for calendar integration');
      return null;
    }

    // Calculate duration in minutes
    const start = new Date(startTime);
    const end = new Date(endTime);
    const duration = Math.round((end.getTime() - start.getTime()) / (1000 * 60));

    // Create REAL Google Calendar event and Google Meet link
    const calendarResult = await createRealConsultationMeeting(
      bookingId,
      sellerId,
      sellerEmail,
      buyerEmail,
      start,
      end,
      'Consultation Session'
    );

    if (!calendarResult.success) {
      console.error('Failed to create real Google Calendar meeting:', calendarResult.error);
      return null;
    }

    return {
      platform_meeting_id: calendarResult.event_id,
      platform_join_url: calendarResult.meet_link!,
      google_calendar_event_id: calendarResult.event_id,
      google_calendar_meet_link: calendarResult.meet_link!
    };

  } catch (error) {
    console.error('Error generating meeting link:', error);
    return null;
  }
}

/**
 * Get buyer email for a booking
 */
async function getBuyerEmail(bookingId: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('consultation_bookings')
      .select(`
        buyer_id,
        buyer:profiles!consultation_bookings_buyer_id_fkey (
          email
        )
      `)
      .eq('id', bookingId)
      .single();

    if (error || !data) {
      console.error('Error fetching buyer email:', error);
      return null;
    }

    return (data.buyer as any)?.email || null;

  } catch (error) {
    console.error('Error getting buyer email:', error);
    return null;
  }
}

/**
 * Get seller email
 */
async function getSellerEmail(sellerId: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', sellerId)
      .single();

    if (error || !data) {
      console.error('Error fetching seller email:', error);
      return null;
    }

    return data.email || null;

  } catch (error) {
    console.error('Error getting seller email:', error);
    return null;
  }
}

/**
 * Get meeting link for a booking
 */
export async function getMeetingLink(bookingId: string): Promise<MeetingLinkData | null> {
  try {
    const { data, error } = await supabase
      .from('consultation_bookings')
      .select('platform_meeting_id, platform_meeting_password, platform_join_url, meeting_link, google_calendar_event_id, google_calendar_meet_link')
      .eq('id', bookingId)
      .single();

    if (error || !data) {
      console.error('Error fetching meeting link:', error);
      return null;
    }

    return {
      platform_meeting_id: data.platform_meeting_id,
      platform_meeting_password: data.platform_meeting_password,
      platform_join_url: data.platform_join_url || data.meeting_link || data.google_calendar_meet_link,
      google_calendar_event_id: data.google_calendar_event_id,
      google_calendar_meet_link: data.google_calendar_meet_link
    };

  } catch (error) {
    console.error('Error getting meeting link:', error);
    return null;
  }
}

/**
 * Update meeting link for a booking
 */
export async function updateMeetingLink(
  bookingId: string,
  meetingLinkData: MeetingLinkData
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('consultation_bookings')
      .update({
        platform_meeting_id: meetingLinkData.platform_meeting_id,
        platform_meeting_password: meetingLinkData.platform_meeting_password,
        platform_join_url: meetingLinkData.platform_join_url,
        meeting_link: meetingLinkData.platform_join_url, // Keep the old field for backward compatibility
        google_calendar_event_id: meetingLinkData.google_calendar_event_id,
        google_calendar_meet_link: meetingLinkData.google_calendar_meet_link
      })
      .eq('id', bookingId);

    if (error) {
      console.error('Error updating meeting link:', error);
      return false;
    }

    return true;

  } catch (error) {
    console.error('Error updating meeting link:', error);
    return false;
  }
}

/**
 * Check if a booking has a meeting link
 */
export async function hasMeetingLink(bookingId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('consultation_bookings')
      .select('platform_join_url, meeting_link, google_calendar_meet_link')
      .eq('id', bookingId)
      .single();

    if (error || !data) {
      return false;
    }

    return !!(data.platform_join_url || data.meeting_link || data.google_calendar_meet_link);

  } catch (error) {
    console.error('Error checking meeting link:', error);
    return false;
  }
}

/**
 * Check if a booking has Google Calendar integration
 */
export async function hasGoogleCalendarMeeting(bookingId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('consultation_bookings')
      .select('google_calendar_event_id, google_calendar_meet_link')
      .eq('id', bookingId)
      .single();

    if (error || !data) {
      return false;
    }

    return !!(data.google_calendar_event_id && data.google_calendar_meet_link);

  } catch (error) {
    console.error('Error checking Google Calendar meeting:', error);
    return false;
  }
}

/**
 * Get Google Calendar meeting details
 */
export async function getGoogleCalendarMeeting(bookingId: string): Promise<{
  event_id?: string;
  meet_link?: string;
  seller_invite_sent?: boolean;
  buyer_invite_sent?: boolean;
} | null> {
  try {
    const { data, error } = await supabase
      .from('consultation_bookings')
      .select('google_calendar_event_id, google_calendar_meet_link, google_calendar_invite_sent, buyer_calendar_invite_sent')
      .eq('id', bookingId)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      event_id: data.google_calendar_event_id,
      meet_link: data.google_calendar_meet_link,
      seller_invite_sent: data.google_calendar_invite_sent,
      buyer_invite_sent: data.buyer_calendar_invite_sent
    };

  } catch (error) {
    console.error('Error getting Google Calendar meeting:', error);
    return null;
  }
}

/**
 * Get all bookings with meeting links for a seller
 */
export async function getBookingsWithMeetingLinks(sellerId: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('consultation_bookings')
      .select(`
        id,
        booking_date,
        start_time,
        end_time,
        status,
        platform_meeting_id,
        platform_meeting_password,
        platform_join_url,
        meeting_link,
        buyer:profiles!consultation_bookings_buyer_id_fkey(full_name, email)
      `)
      .eq('seller_id', sellerId)
      .not('platform_join_url', 'is', null)
      .order('booking_date', { ascending: true })
      .order('start_time', { ascending: true });

    if (error) {
      console.error('Error fetching bookings with meeting links:', error);
      return [];
    }

    return data || [];

  } catch (error) {
    console.error('Error getting bookings with meeting links:', error);
    return [];
  }
} 