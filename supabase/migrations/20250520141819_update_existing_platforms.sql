-- Update existing consultation platforms to Google Meet before applying constraint

-- Update all existing records to use Google Meet
UPDATE profiles 
SET consultation_platform = 'Google Meet' 
WHERE consultation_platform IS NULL OR consultation_platform != 'Google Meet';

-- Verify the update
SELECT consultation_platform, COUNT(*) 
FROM profiles 
GROUP BY consultation_platform; 