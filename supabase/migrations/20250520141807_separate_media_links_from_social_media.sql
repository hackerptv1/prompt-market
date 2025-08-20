-- Add new media_links column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS media_links JSONB DEFAULT '[]';

-- Migrate any existing media links from social_media to media_links
-- This assumes media links might be stored differently than social media
-- Social media typically has keys like 'twitter', 'youtube', 'linkedin'
-- Media links might be arrays or have different structure

-- For now, initialize media_links as empty array for all users
-- Manual data migration may be needed if there's existing conflicting data

-- Add comment to clarify column purposes
COMMENT ON COLUMN profiles.social_media IS 'Social media platform links (Twitter, YouTube, LinkedIn, etc.)';
COMMENT ON COLUMN profiles.media_links IS 'External media content links (videos, images, portfolios, etc.)'; 