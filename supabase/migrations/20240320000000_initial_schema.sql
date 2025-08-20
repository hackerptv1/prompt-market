-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create storage bucket for profile pictures
INSERT INTO storage.buckets (id, name, public) VALUES ('profile-pictures', 'profile-pictures', true);

-- Create storage policy for profile pictures
CREATE POLICY "Profile pictures are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-pictures');

CREATE POLICY "Users can upload their own profile picture"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'profile-pictures' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own profile picture"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'profile-pictures' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own profile picture"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'profile-pictures' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('buyer', 'seller')),
    profile_picture_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create seller_profiles table
CREATE TABLE IF NOT EXISTS seller_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id),
    status TEXT NOT NULL CHECK (status IN ('pending', 'active', 'suspended')) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create prompts table
CREATE TABLE IF NOT EXISTS prompts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT NOT NULL,
    product_type TEXT NOT NULL CHECK (product_type IN ('prompt', 'api', 'ai-agent')),
    category TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    ai_platform TEXT NOT NULL,
    estimated_run_time TEXT NOT NULL,
    ai_running_cost DECIMAL(10,2) NOT NULL,
    media_urls TEXT[] DEFAULT '{}',
    prompt_file_urls TEXT[] DEFAULT '{}',
    media_links JSONB DEFAULT '[]',
    seller_id UUID NOT NULL REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    api_endpoint TEXT,
    auth_type TEXT,
    api_documentation JSONB,
    agent_type TEXT,
    required_resources TEXT,
    agent_configuration JSONB
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own data" ON profiles;
DROP POLICY IF EXISTS "Users can update their own data" ON profiles;
DROP POLICY IF EXISTS "Users can view their own seller profile" ON seller_profiles;
DROP POLICY IF EXISTS "Users can update their own seller profile" ON seller_profiles;
DROP POLICY IF EXISTS "Anyone can view prompts" ON prompts;
DROP POLICY IF EXISTS "Sellers can create prompts" ON prompts;
DROP POLICY IF EXISTS "Sellers can update their own prompts" ON prompts;
DROP POLICY IF EXISTS "Sellers can delete their own prompts" ON prompts;

-- Create new policies
CREATE POLICY "Users can view their own data" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view their own seller profile" ON seller_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own seller profile" ON seller_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view prompts" ON prompts
    FOR SELECT USING (true);

CREATE POLICY "Sellers can create prompts" ON prompts
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'seller'
        )
    );

CREATE POLICY "Sellers can update their own prompts" ON prompts
    FOR UPDATE USING (
        seller_id = auth.uid()
    );

CREATE POLICY "Sellers can delete their own prompts" ON prompts
    FOR DELETE USING (
        seller_id = auth.uid()
    );

-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'role', 'buyer')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- Create trigger for new user creation
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user(); 