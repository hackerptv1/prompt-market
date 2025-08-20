-- Check current consultation platform data

-- See what platforms are currently being used
SELECT consultation_platform, COUNT(*) as count
FROM profiles 
WHERE consultation_platform IS NOT NULL
GROUP BY consultation_platform
ORDER BY count DESC;

-- See profiles with non-Google Meet platforms
SELECT id, consultation_platform, consultation_enabled
FROM profiles 
WHERE consultation_platform IS NOT NULL 
  AND consultation_platform != 'Google Meet'
LIMIT 10; 