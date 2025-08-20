-- Add consultation settings fields to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS consultation_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS consultation_price DECIMAL(10,2) DEFAULT 99.00,
ADD COLUMN IF NOT EXISTS consultation_duration INTEGER DEFAULT 60,
ADD COLUMN IF NOT EXISTS consultation_description TEXT DEFAULT 'Get personalized help with your prompt engineering needs. I''ll help you create, refine, and optimize your AI prompts for better results.',
ADD COLUMN IF NOT EXISTS consultation_platform VARCHAR(50) DEFAULT 'Zoom Meeting';

-- Add check constraint for consultation duration
ALTER TABLE profiles
ADD CONSTRAINT profiles_consultation_duration_check 
CHECK (consultation_duration IN (15, 30, 45, 60, 90, 120));

-- Add check constraint for consultation price
ALTER TABLE profiles
ADD CONSTRAINT profiles_consultation_price_check 
CHECK (consultation_price >= 0);

-- Create index for consultation settings
CREATE INDEX IF NOT EXISTS idx_profiles_consultation_enabled ON profiles(consultation_enabled) WHERE role = 'seller'; 