-- Add PayPal fields to consultation_bookings table
ALTER TABLE consultation_bookings
ADD COLUMN IF NOT EXISTS paypal_order_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS paypal_payment_id VARCHAR(255);

-- Create index for PayPal order ID
CREATE INDEX IF NOT EXISTS idx_consultation_bookings_paypal_order_id 
ON consultation_bookings(paypal_order_id); 