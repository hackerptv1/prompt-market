-- Remove Calendly fields from profiles table
ALTER TABLE profiles 
DROP COLUMN IF EXISTS calendly_enabled,
DROP COLUMN IF EXISTS calendly_link,
DROP COLUMN IF EXISTS calendly_event_type_id,
DROP COLUMN IF EXISTS calendly_username;

-- Remove Calendly fields from consultation_bookings table
ALTER TABLE consultation_bookings
DROP COLUMN IF EXISTS calendly_booking_uri,
DROP COLUMN IF EXISTS calendly_event_uri,
DROP COLUMN IF EXISTS calendly_invitee_uri;

-- Add platform integration fields to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS zoom_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS google_calendar_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS teams_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS skype_username VARCHAR(100),
ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20),
ADD COLUMN IF NOT EXISTS auto_generate_meeting_links BOOLEAN DEFAULT true;

-- Add platform integration fields to consultation_bookings table
ALTER TABLE consultation_bookings
ADD COLUMN IF NOT EXISTS platform_meeting_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS platform_meeting_password VARCHAR(100),
ADD COLUMN IF NOT EXISTS platform_join_url VARCHAR(500);

-- Create indexes for platform integration
CREATE INDEX IF NOT EXISTS idx_profiles_platform_emails ON profiles(zoom_email, google_calendar_email, teams_email) WHERE role = 'seller';
CREATE INDEX IF NOT EXISTS idx_consultation_bookings_platform ON consultation_bookings(platform_meeting_id) WHERE platform_meeting_id IS NOT NULL;

-- Add check constraints for email formats
ALTER TABLE profiles
ADD CONSTRAINT profiles_zoom_email_check 
CHECK (zoom_email IS NULL OR zoom_email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

ALTER TABLE profiles
ADD CONSTRAINT profiles_google_calendar_email_check 
CHECK (google_calendar_email IS NULL OR google_calendar_email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

ALTER TABLE profiles
ADD CONSTRAINT profiles_teams_email_check 
CHECK (teams_email IS NULL OR teams_email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Add comments for documentation
COMMENT ON COLUMN profiles.zoom_email IS 'Zoom account email for automatic meeting creation';
COMMENT ON COLUMN profiles.google_calendar_email IS 'Google Calendar email for automatic meeting creation';
COMMENT ON COLUMN profiles.teams_email IS 'Microsoft Teams email for automatic meeting creation';
COMMENT ON COLUMN profiles.skype_username IS 'Skype username for meeting links';
COMMENT ON COLUMN profiles.phone_number IS 'Phone number for phone consultations';
COMMENT ON COLUMN profiles.auto_generate_meeting_links IS 'Whether to automatically generate meeting links when bookings are confirmed';
COMMENT ON COLUMN consultation_bookings.platform_meeting_id IS 'Platform-specific meeting ID (Zoom meeting ID, Google Meet code, etc.)';
COMMENT ON COLUMN consultation_bookings.platform_meeting_password IS 'Platform-specific meeting password if required';
COMMENT ON COLUMN consultation_bookings.platform_join_url IS 'Direct join URL for the meeting platform'; 