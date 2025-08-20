-- Create storage bucket for profile pictures
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-pictures', 'profile-pictures', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for existing profile-pictures bucket
CREATE POLICY IF NOT EXISTS "Profile pictures are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-pictures');

CREATE POLICY IF NOT EXISTS "Users can upload their own profile picture"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'profile-pictures' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY IF NOT EXISTS "Users can update their own profile picture"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'profile-pictures' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY IF NOT EXISTS "Users can delete their own profile picture"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'profile-pictures' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Create storage bucket for prompt media (images and videos)
INSERT INTO storage.buckets (id, name, public)
VALUES ('prompt-media', 'prompt-media', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for prompt-media bucket
CREATE POLICY IF NOT EXISTS "Prompt media is publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'prompt-media');

CREATE POLICY IF NOT EXISTS "Users can upload their own prompt media"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'prompt-media' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY IF NOT EXISTS "Users can update their own prompt media"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'prompt-media' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY IF NOT EXISTS "Users can delete their own prompt media"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'prompt-media' AND
  auth.uid() IS NOT NULL
);

-- Create storage bucket for prompt files
INSERT INTO storage.buckets (id, name, public)
VALUES ('prompt-files', 'prompt-files', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for prompt-files bucket
CREATE POLICY IF NOT EXISTS "Prompt files are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'prompt-files');

CREATE POLICY IF NOT EXISTS "Users can upload their own prompt files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'prompt-files' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY IF NOT EXISTS "Users can update their own prompt files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'prompt-files' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY IF NOT EXISTS "Users can delete their own prompt files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'prompt-files' AND
  auth.uid() IS NOT NULL
); 