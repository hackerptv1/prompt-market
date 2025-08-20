-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'buyer' CHECK (role IN ('buyer', 'seller', 'admin')),
    profile_picture_url TEXT,
    
    -- Seller specific fields
    seller_status VARCHAR(20) CHECK (role = 'seller' AND seller_status IN ('pending', 'active', 'suspended', 'rejected')),
    display_name VARCHAR(255),
    description TEXT,
    website_url VARCHAR(255),
    social_media JSONB DEFAULT '{}',
    average_rating DECIMAL(3,2) DEFAULT 0,
    total_sales INTEGER DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(email)
);

-- Create RLS policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own profile
CREATE POLICY "Users can view their own profile"
    ON profiles
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy for users to update their own profile
CREATE POLICY "Users can update their own profile"
    ON profiles
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Policy for users to insert their own profile
CREATE POLICY "Users can insert their own profile"
    ON profiles
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy for admins to view all profiles
CREATE POLICY "Admins can view all profiles"
    ON profiles
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.user_id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Policy for admins to update all profiles
CREATE POLICY "Admins can update all profiles"
    ON profiles
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.user_id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_seller_status ON profiles(seller_status) WHERE role = 'seller';
CREATE INDEX idx_profiles_average_rating ON profiles(average_rating) WHERE role = 'seller'; 