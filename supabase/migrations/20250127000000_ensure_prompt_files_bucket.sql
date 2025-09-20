-- Ensure prompt-files bucket exists with proper policies
-- This migration ensures the prompt-files bucket is created and has the correct policies

-- Create storage bucket for prompt files (keep as public for now, but with proper access control)
INSERT INTO storage.buckets (id, name, public)
VALUES ('prompt-files', 'prompt-files', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Prompt files are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own prompt files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own prompt files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own prompt files" ON storage.objects;
DROP POLICY IF EXISTS "Buyers can download purchased prompt files" ON storage.objects;

-- Create storage policies for prompt-files bucket
-- Allow public access for now (since bucket is public)
CREATE POLICY "Prompt files are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'prompt-files');

-- Only allow uploads by authenticated users
CREATE POLICY "Users can upload their own prompt files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'prompt-files' AND
  auth.uid() IS NOT NULL
);

-- Only allow updates by the file owner
CREATE POLICY "Users can update their own prompt files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'prompt-files' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Only allow deletions by the file owner
CREATE POLICY "Users can delete their own prompt files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'prompt-files' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
