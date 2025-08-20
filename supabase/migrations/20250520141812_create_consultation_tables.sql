-- Create consultation_slots table
CREATE TABLE IF NOT EXISTS consultation_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT true,
    is_booked BOOLEAN DEFAULT false,
    booked_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create consultation_bookings table
CREATE TABLE IF NOT EXISTS consultation_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slot_id UUID NOT NULL REFERENCES consultation_slots(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    meeting_link TEXT,
    notes TEXT,
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    payment_amount DECIMAL(10,2),
    payment_intent_id VARCHAR(255),
    payment_method_id VARCHAR(255),
    payment_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_consultation_slots_seller_id ON consultation_slots(seller_id);
CREATE INDEX IF NOT EXISTS idx_consultation_slots_date ON consultation_slots(date);
CREATE INDEX IF NOT EXISTS idx_consultation_slots_available ON consultation_slots(is_available, is_booked);
CREATE INDEX IF NOT EXISTS idx_consultation_bookings_seller_id ON consultation_bookings(seller_id);
CREATE INDEX IF NOT EXISTS idx_consultation_bookings_buyer_id ON consultation_bookings(buyer_id);
CREATE INDEX IF NOT EXISTS idx_consultation_bookings_status ON consultation_bookings(status);
CREATE INDEX IF NOT EXISTS idx_consultation_bookings_date ON consultation_bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_consultation_bookings_payment_status ON consultation_bookings(payment_status);

-- Enable Row Level Security
ALTER TABLE consultation_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultation_bookings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for consultation_slots
-- Sellers can view their own slots
CREATE POLICY "Sellers can view their own slots"
    ON consultation_slots
    FOR SELECT
    USING (seller_id = auth.uid());

-- Sellers can insert their own slots
CREATE POLICY "Sellers can insert their own slots"
    ON consultation_slots
    FOR INSERT
    WITH CHECK (seller_id = auth.uid());

-- Sellers can update their own slots
CREATE POLICY "Sellers can update their own slots"
    ON consultation_slots
    FOR UPDATE
    USING (seller_id = auth.uid());

-- Sellers can delete their own slots
CREATE POLICY "Sellers can delete their own slots"
    ON consultation_slots
    FOR DELETE
    USING (seller_id = auth.uid());

-- Buyers can view available slots
CREATE POLICY "Buyers can view available slots"
    ON consultation_slots
    FOR SELECT
    USING (is_available = true AND is_booked = false);

-- RLS Policies for consultation_bookings
-- Sellers can view bookings for their consultations
CREATE POLICY "Sellers can view their consultation bookings"
    ON consultation_bookings
    FOR SELECT
    USING (seller_id = auth.uid());

-- Buyers can view their own bookings
CREATE POLICY "Buyers can view their own bookings"
    ON consultation_bookings
    FOR SELECT
    USING (buyer_id = auth.uid());

-- Buyers can insert their own bookings
CREATE POLICY "Buyers can insert their own bookings"
    ON consultation_bookings
    FOR INSERT
    WITH CHECK (buyer_id = auth.uid());

-- Sellers can update bookings for their consultations
CREATE POLICY "Sellers can update their consultation bookings"
    ON consultation_bookings
    FOR UPDATE
    USING (seller_id = auth.uid());

-- Buyers can update their own bookings
CREATE POLICY "Buyers can update their own bookings"
    ON consultation_bookings
    FOR UPDATE
    USING (buyer_id = auth.uid());

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_consultation_slots_updated_at
    BEFORE UPDATE ON consultation_slots
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_consultation_bookings_updated_at
    BEFORE UPDATE ON consultation_bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 