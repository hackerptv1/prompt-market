-- Remove email validation constraints entirely
-- Email validation will be handled in application code for better flexibility
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_zoom_email_check;
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_google_calendar_email_check;
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_teams_email_check;

-- Add comments to indicate validation is handled in application
COMMENT ON COLUMN profiles.zoom_email IS 'Zoom account email for automatic meeting creation (validation handled in application)';
COMMENT ON COLUMN profiles.google_calendar_email IS 'Google Calendar email for automatic meeting creation (validation handled in application)';
COMMENT ON COLUMN profiles.teams_email IS 'Microsoft Teams email for automatic meeting creation (validation handled in application)'; 