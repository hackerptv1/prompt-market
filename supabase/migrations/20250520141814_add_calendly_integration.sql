-- Add Calendly integration fields to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS calendly_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS calendly_link VARCHAR(500),
ADD COLUMN IF NOT EXISTS calendly_event_type_id VARCHAR(100),
ADD COLUMN IF NOT EXISTS calendly_username VARCHAR(100);

-- Add Calendly booking reference to consultation_bookings table
ALTER TABLE consultation_bookings
ADD COLUMN IF NOT EXISTS calendly_booking_uri VARCHAR(500),
ADD COLUMN IF NOT EXISTS calendly_event_uri VARCHAR(500),
ADD COLUMN IF NOT EXISTS calendly_invitee_uri VARCHAR(500);

-- Create indexes for Calendly fields
CREATE INDEX IF NOT EXISTS idx_profiles_calendly_enabled ON profiles(calendly_enabled) WHERE role = 'seller';
CREATE INDEX IF NOT EXISTS idx_consultation_bookings_calendly ON consultation_bookings(calendly_booking_uri) WHERE calendly_booking_uri IS NOT NULL;

-- Add check constraint for Calendly link format
ALTER TABLE profiles
ADD CONSTRAINT profiles_calendly_link_check 
CHECK (calendly_link IS NULL OR calendly_link ~ '^https://calendly\.com/[a-zA-Z0-9_-]+(/[a-zA-Z0-9_-]+)?$');

-- Add comment for documentation
COMMENT ON COLUMN profiles.calendly_enabled IS 'Whether the seller has enabled Calendly integration';
COMMENT ON COLUMN profiles.calendly_link IS 'The Calendly scheduling link for the seller';
COMMENT ON COLUMN profiles.calendly_event_type_id IS 'The Calendly event type ID for consultations';
COMMENT ON COLUMN profiles.calendly_username IS 'The Calendly username of the seller';
COMMENT ON COLUMN consultation_bookings.calendly_booking_uri IS 'The Calendly booking URI for this consultation';
COMMENT ON COLUMN consultation_bookings.calendly_event_uri IS 'The Calendly event URI for this consultation';
COMMENT ON COLUMN consultation_bookings.calendly_invitee_uri IS 'The Calendly invitee URI for this consultation'; 