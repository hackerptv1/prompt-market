-- Create seller_profiles table
CREATE TABLE IF NOT EXISTS seller_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'rejected')),
    display_name VARCHAR(255) NOT NULL,
    description TEXT,
    website_url VARCHAR(255),
    social_media JSONB DEFAULT '{}',
    average_rating DECIMAL(3,2) DEFAULT 0,
    total_sales INTEGER DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id)
);

-- Create RLS policies
ALTER TABLE seller_profiles ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own seller profile
CREATE POLICY "Users can view their own seller profile"
    ON seller_profiles
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy for users to update their own seller profile
CREATE POLICY "Users can update their own seller profile"
    ON seller_profiles
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Policy for users to insert their own seller profile
CREATE POLICY "Users can insert their own seller profile"
    ON seller_profiles
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy for admins to view all seller profiles
CREATE POLICY "Admins can view all seller profiles"
    ON seller_profiles
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.user_id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Policy for admins to update all seller profiles
CREATE POLICY "Admins can update all seller profiles"
    ON seller_profiles
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.user_id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_seller_profiles_updated_at
    BEFORE UPDATE ON seller_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for faster queries
CREATE INDEX idx_seller_profiles_user_id ON seller_profiles(user_id);
CREATE INDEX idx_seller_profiles_status ON seller_profiles(status);
CREATE INDEX idx_seller_profiles_average_rating ON seller_profiles(average_rating); 