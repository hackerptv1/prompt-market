-- Add calendar integration fields to consultation_bookings table
ALTER TABLE consultation_bookings
ADD COLUMN IF NOT EXISTS calendar_event_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS calendar_meet_link VARCHAR(500),
ADD COLUMN IF NOT EXISTS calendar_invite_sent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS calendar_invite_sent_at TIMESTAMP WITH TIME ZONE;

-- Add indexes for calendar integration
CREATE INDEX IF NOT EXISTS idx_consultation_bookings_calendar ON consultation_bookings(calendar_event_id) WHERE calendar_event_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_consultation_bookings_invite_sent ON consultation_bookings(calendar_invite_sent) WHERE calendar_invite_sent = true;

-- Add comments for documentation
COMMENT ON COLUMN consultation_bookings.calendar_event_id IS 'Google Calendar event ID for calendar integration';
COMMENT ON COLUMN consultation_bookings.calendar_meet_link IS 'Google Meet link generated from calendar event';
COMMENT ON COLUMN consultation_bookings.calendar_invite_sent IS 'Whether calendar invites have been sent to participants';
COMMENT ON COLUMN consultation_bookings.calendar_invite_sent_at IS 'Timestamp when calendar invites were sent';

-- Create a view for calendar events
CREATE OR REPLACE VIEW calendar_events AS
SELECT 
  cb.id as booking_id,
  cb.calendar_event_id,
  cb.calendar_meet_link,
  cb.calendar_invite_sent,
  cb.calendar_invite_sent_at,
  cb.booking_date,
  cb.start_time,
  cb.end_time,
  cb.status,
  cb.seller_id,
  cb.buyer_id,
  seller.email as seller_email,
  buyer.email as buyer_email,
  seller.full_name as seller_name,
  buyer.full_name as buyer_name
FROM consultation_bookings cb
JOIN profiles seller ON cb.seller_id = seller.id
JOIN profiles buyer ON cb.buyer_id = buyer.id
WHERE cb.calendar_event_id IS NOT NULL;

-- Note: Views don't support RLS directly, but the underlying consultation_bookings table
-- already has RLS policies that will protect the data in this view 