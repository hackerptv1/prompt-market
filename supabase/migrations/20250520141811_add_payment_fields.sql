-- Add payment fields to consultation_bookings table
ALTER TABLE consultation_bookings
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
ADD COLUMN IF NOT EXISTS payment_amount DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS payment_intent_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS payment_method_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS payment_date TIMESTAMP WITH TIME ZONE;

-- Add index for payment status
CREATE INDEX IF NOT EXISTS idx_consultation_bookings_payment_status 
ON consultation_bookings(payment_status);

-- Add index for payment intent
CREATE INDEX IF NOT EXISTS idx_consultation_bookings_payment_intent 
ON consultation_bookings(payment_intent_id);

-- Update existing bookings to have default payment status
UPDATE consultation_bookings 
SET payment_status = 'paid' 
WHERE payment_status IS NULL; 