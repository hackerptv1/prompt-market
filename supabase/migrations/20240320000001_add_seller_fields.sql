-- First add nullable columns without constraints
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS seller_status VARCHAR(20),
ADD COLUMN IF NOT EXISTS display_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS website_url VARCHAR(255),
ADD COLUMN IF NOT EXISTS social_media JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_sales INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0;

-- Update existing seller rows to have pending status
UPDATE profiles
SET seller_status = 'pending'
WHERE role = 'seller';

-- Now add the check constraint
ALTER TABLE profiles
ADD CONSTRAINT profiles_seller_status_check 
CHECK (
  (role = 'seller' AND seller_status IN ('pending', 'active', 'suspended', 'rejected'))
  OR 
  (role != 'seller' AND seller_status IS NULL)
);

-- Create indexes for seller fields
CREATE INDEX IF NOT EXISTS idx_profiles_seller_status ON profiles(seller_status) WHERE role = 'seller';
CREATE INDEX IF NOT EXISTS idx_profiles_average_rating ON profiles(average_rating) WHERE role = 'seller'; 