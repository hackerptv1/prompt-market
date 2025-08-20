-- Add policy to allow sellers to view buyer profiles when they have consultation bookings
CREATE POLICY "Sellers can view buyer profiles for consultations"
    ON profiles
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM consultation_bookings
            WHERE consultation_bookings.seller_id = auth.uid()
            AND consultation_bookings.buyer_id = profiles.id
        )
    );

-- Add policy to allow buyers to view seller profiles when they have consultation bookings
CREATE POLICY "Buyers can view seller profiles for consultations"
    ON profiles
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM consultation_bookings
            WHERE consultation_bookings.buyer_id = auth.uid()
            AND consultation_bookings.seller_id = profiles.id
        )
    );

-- Add policy to allow public viewing of seller profiles (for browsing)
CREATE POLICY "Anyone can view seller profiles"
    ON profiles
    FOR SELECT
    USING (role = 'seller'); 