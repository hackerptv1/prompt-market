-- Add sample social media data to existing seller profiles for testing

-- Update some seller profiles with sample social media data
UPDATE profiles 
SET social_media = jsonb_build_object(
  'twitter', 'https://twitter.com/prompts_expert',
  'youtube', 'https://youtube.com/@promptsexpert',
  'linkedin', 'https://linkedin.com/in/promptsexpert'
)
WHERE role = 'seller' 
AND social_media IS NULL 
OR social_media = '{}'::jsonb
LIMIT 3;

-- Add different social media combinations for variety
UPDATE profiles 
SET social_media = jsonb_build_object(
  'twitter', 'https://twitter.com/ai_specialist',
  'linkedin', 'https://linkedin.com/in/aispecialist'
)
WHERE role = 'seller' 
AND id NOT IN (
  SELECT id FROM profiles 
  WHERE social_media ? 'twitter' 
  OR social_media ? 'youtube' 
  OR social_media ? 'linkedin'
)
LIMIT 2;

-- Add just YouTube for some sellers
UPDATE profiles 
SET social_media = jsonb_build_object(
  'youtube', 'https://youtube.com/@contentcreator'
)
WHERE role = 'seller' 
AND id NOT IN (
  SELECT id FROM profiles 
  WHERE social_media ? 'twitter' 
  OR social_media ? 'youtube' 
  OR social_media ? 'linkedin'
)
LIMIT 1; 