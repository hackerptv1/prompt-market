-- Create seller_media_links table
CREATE TABLE IF NOT EXISTS seller_media_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID NOT NULL REFERENCES profiles(id),
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    platform TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE seller_media_links ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Sellers can view their own media links"
ON seller_media_links FOR SELECT
USING (seller_id = auth.uid());

CREATE POLICY "Sellers can create their own media links"
ON seller_media_links FOR INSERT
WITH CHECK (seller_id = auth.uid());

CREATE POLICY "Sellers can update their own media links"
ON seller_media_links FOR UPDATE
USING (seller_id = auth.uid());

CREATE POLICY "Sellers can delete their own media links"
ON seller_media_links FOR DELETE
USING (seller_id = auth.uid());

-- Grant necessary permissions
GRANT ALL ON TABLE seller_media_links TO authenticated; 