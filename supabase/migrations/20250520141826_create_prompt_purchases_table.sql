-- Create prompt_purchases table
CREATE TABLE IF NOT EXISTS prompt_purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prompt_id UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    payment_amount DECIMAL(10,2) NOT NULL,
    payment_date TIMESTAMP WITH TIME ZONE,
    paypal_order_id VARCHAR(255),
    paypal_payment_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_prompt_purchases_buyer_id ON prompt_purchases(buyer_id);
CREATE INDEX IF NOT EXISTS idx_prompt_purchases_seller_id ON prompt_purchases(seller_id);
CREATE INDEX IF NOT EXISTS idx_prompt_purchases_prompt_id ON prompt_purchases(prompt_id);
CREATE INDEX IF NOT EXISTS idx_prompt_purchases_payment_status ON prompt_purchases(payment_status);
CREATE INDEX IF NOT EXISTS idx_prompt_purchases_paypal_order_id ON prompt_purchases(paypal_order_id);

-- Enable Row Level Security
ALTER TABLE prompt_purchases ENABLE ROW LEVEL SECURITY;

-- RLS Policies for prompt_purchases
-- Buyers can view their own purchases
CREATE POLICY "Buyers can view their own purchases"
    ON prompt_purchases
    FOR SELECT
    USING (buyer_id = auth.uid());

-- Sellers can view purchases of their prompts
CREATE POLICY "Sellers can view purchases of their prompts"
    ON prompt_purchases
    FOR SELECT
    USING (seller_id = auth.uid());

-- Buyers can insert their own purchases
CREATE POLICY "Buyers can insert their own purchases"
    ON prompt_purchases
    FOR INSERT
    WITH CHECK (buyer_id = auth.uid());

-- Buyers can update their own purchases
CREATE POLICY "Buyers can update their own purchases"
    ON prompt_purchases
    FOR UPDATE
    USING (buyer_id = auth.uid());

-- Create function to increment seller sales
CREATE OR REPLACE FUNCTION increment_seller_sales(seller_uuid UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE seller_profiles 
    SET total_sales = COALESCE(total_sales, 0) + 1
    WHERE user_id = seller_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION increment_seller_sales(UUID) TO authenticated;

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_prompt_purchases_updated_at
    BEFORE UPDATE ON prompt_purchases
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 