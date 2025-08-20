-- Restrict consultation platform to Google Meet only and enhance Google Calendar integration

-- First, update all existing records to use Google Meet before adding the constraint
UPDATE profiles 
SET consultation_platform = 'Google Meet' 
WHERE consultation_platform IS NULL OR consultation_platform != 'Google Meet';

-- Now drop the existing constraint if it exists
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS profiles_consultation_platform_check;

-- Add the new constraint that only allows Google Meet
ALTER TABLE profiles 
ADD CONSTRAINT profiles_consultation_platform_check 
CHECK (consultation_platform = 'Google Meet');

-- Add Google Calendar integration fields to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS google_calendar_connected BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS google_calendar_access_token TEXT,
ADD COLUMN IF NOT EXISTS google_calendar_refresh_token TEXT,
ADD COLUMN IF NOT EXISTS google_calendar_token_expires_at TIMESTAMP WITH TIME ZONE;

-- Add Google Calendar integration fields to consultation_bookings table
ALTER TABLE consultation_bookings
ADD COLUMN IF NOT EXISTS google_calendar_event_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS google_calendar_meet_link VARCHAR(500),
ADD COLUMN IF NOT EXISTS google_calendar_invite_sent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS google_calendar_invite_sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS buyer_calendar_invite_sent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS buyer_calendar_invite_sent_at TIMESTAMP WITH TIME ZONE;

-- Add indexes for Google Calendar integration
CREATE INDEX IF NOT EXISTS idx_consultation_bookings_google_calendar ON consultation_bookings(google_calendar_event_id) WHERE google_calendar_event_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_consultation_bookings_google_invite_sent ON consultation_bookings(google_calendar_invite_sent) WHERE google_calendar_invite_sent = true;
CREATE INDEX IF NOT EXISTS idx_consultation_bookings_buyer_invite_sent ON consultation_bookings(buyer_calendar_invite_sent) WHERE buyer_calendar_invite_sent = true;

-- Add comments for documentation
COMMENT ON COLUMN profiles.google_calendar_connected IS 'Whether the seller has connected their Google Calendar account';
COMMENT ON COLUMN profiles.google_calendar_access_token IS 'Google Calendar API access token for OAuth2 integration';
COMMENT ON COLUMN profiles.google_calendar_refresh_token IS 'Google Calendar API refresh token for OAuth2 integration';
COMMENT ON COLUMN profiles.google_calendar_token_expires_at IS 'When the access token expires';
COMMENT ON COLUMN consultation_bookings.google_calendar_event_id IS 'Google Calendar event ID for the consultation meeting';
COMMENT ON COLUMN consultation_bookings.google_calendar_meet_link IS 'Google Meet link generated from the calendar event';
COMMENT ON COLUMN consultation_bookings.google_calendar_invite_sent IS 'Whether calendar invite has been sent to seller';
COMMENT ON COLUMN consultation_bookings.google_calendar_invite_sent_at IS 'Timestamp when calendar invite was sent to seller';
COMMENT ON COLUMN consultation_bookings.buyer_calendar_invite_sent IS 'Whether calendar invite has been sent to buyer';
COMMENT ON COLUMN consultation_bookings.buyer_calendar_invite_sent_at IS 'Timestamp when calendar invite was sent to buyer';

-- Create a view for Google Calendar events
CREATE OR REPLACE VIEW google_calendar_events AS
SELECT 
  cb.id as booking_id,
  cb.google_calendar_event_id,
  cb.google_calendar_meet_link,
  cb.google_calendar_invite_sent,
  cb.google_calendar_invite_sent_at,
  cb.buyer_calendar_invite_sent,
  cb.buyer_calendar_invite_sent_at,
  cb.booking_date,
  cb.start_time,
  cb.end_time,
  cb.status,
  cb.seller_id,
  cb.buyer_id,
  seller.email as seller_email,
  buyer.email as buyer_email,
  seller.full_name as seller_name,
  buyer.full_name as buyer_name,
  seller.google_calendar_connected as seller_calendar_connected
FROM consultation_bookings cb
JOIN profiles seller ON cb.seller_id = seller.id
JOIN profiles buyer ON cb.buyer_id = buyer.id
WHERE cb.google_calendar_event_id IS NOT NULL;

-- Create a function to automatically schedule Google Calendar events
CREATE OR REPLACE FUNCTION schedule_google_calendar_meeting()
RETURNS TRIGGER AS $$
BEGIN
  -- This function will be called when a consultation booking is confirmed
  -- In a real implementation, this would trigger the Google Calendar API call
  -- For now, we'll just update the status
  IF NEW.status = 'confirmed' AND OLD.status != 'confirmed' THEN
    -- Mark that calendar event needs to be created
    NEW.google_calendar_invite_sent = false;
    NEW.buyer_calendar_invite_sent = false;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically handle Google Calendar scheduling
DROP TRIGGER IF EXISTS trigger_schedule_google_calendar_meeting ON consultation_bookings;
CREATE TRIGGER trigger_schedule_google_calendar_meeting
  BEFORE UPDATE ON consultation_bookings
  FOR EACH ROW
  EXECUTE FUNCTION schedule_google_calendar_meeting();

-- Remove old platform fields that are no longer needed
-- Keep them for backward compatibility but mark as deprecated
COMMENT ON COLUMN profiles.zoom_email IS 'DEPRECATED: Only Google Meet is supported';
COMMENT ON COLUMN profiles.teams_email IS 'DEPRECATED: Only Google Meet is supported';
COMMENT ON COLUMN profiles.skype_username IS 'DEPRECATED: Only Google Meet is supported';
COMMENT ON COLUMN profiles.phone_number IS 'DEPRECATED: Only Google Meet is supported'; 