-- Create storage bucket for AI platform logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('ai-platform-logos', 'ai-platform-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for automation platform logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('automation-platform-logos', 'automation-platform-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for ai-platform-logos bucket
CREATE POLICY IF NOT EXISTS "AI platform logos are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'ai-platform-logos');

CREATE POLICY IF NOT EXISTS "Admin users can upload AI platform logos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'ai-platform-logos' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY IF NOT EXISTS "Admin users can update AI platform logos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'ai-platform-logos' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY IF NOT EXISTS "Admin users can delete AI platform logos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'ai-platform-logos' AND
  auth.uid() IS NOT NULL
);

-- Create storage policies for automation-platform-logos bucket
CREATE POLICY IF NOT EXISTS "Automation platform logos are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'automation-platform-logos');

CREATE POLICY IF NOT EXISTS "Admin users can upload automation platform logos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'automation-platform-logos' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY IF NOT EXISTS "Admin users can update automation platform logos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'automation-platform-logos' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY IF NOT EXISTS "Admin users can delete automation platform logos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'automation-platform-logos' AND
  auth.uid() IS NOT NULL
); 