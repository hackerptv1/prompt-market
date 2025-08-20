-- Migration to remove seller approval requirement
-- This migration:
-- 1. Updates all existing pending sellers to active status
-- 2. Changes the default seller status from 'pending' to 'active'

-- Update all existing sellers with 'pending' status to 'active'
UPDATE profiles 
SET seller_status = 'active'
WHERE role = 'seller' 
AND seller_status = 'pending';

-- For the seller_profiles table (if it exists and is being used)
UPDATE seller_profiles 
SET status = 'active'
WHERE status = 'pending';

-- Note: We don't modify the database schema constraints since 'active' is already
-- an allowed value in the CHECK constraints. The default will be handled by 
-- the application code when creating new seller profiles.