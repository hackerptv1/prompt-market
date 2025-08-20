-- Create function to reserve a consultation slot
CREATE OR REPLACE FUNCTION reserve_consultation_slot(
    p_slot_id UUID,
    p_buyer_id UUID
)
RETURNS JSON AS $$
DECLARE
    slot_record consultation_slots%ROWTYPE;
    result JSON;
BEGIN
    -- Check if slot exists and is available
    SELECT * INTO slot_record
    FROM consultation_slots
    WHERE id = p_slot_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Slot not found'
        );
    END IF;
    
    -- Check if slot is available and not booked
    IF NOT slot_record.is_available OR slot_record.is_booked THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Slot is not available for booking'
        );
    END IF;
    
    -- Check if slot is in the past
    IF slot_record.date < CURRENT_DATE OR 
       (slot_record.date = CURRENT_DATE AND slot_record.end_time < CURRENT_TIME) THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Slot is in the past'
        );
    END IF;
    
    -- Reserve the slot by updating its status
    UPDATE consultation_slots
    SET 
        is_available = false,
        is_booked = true,
        booked_by = p_buyer_id,
        updated_at = TIMEZONE('utc'::text, NOW())
    WHERE id = p_slot_id;
    
    -- Check if update was successful
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Failed to reserve slot'
        );
    END IF;
    
    -- Return success
    RETURN json_build_object(
        'success', true,
        'slot_id', p_slot_id,
        'buyer_id', p_buyer_id
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION reserve_consultation_slot(UUID, UUID) TO authenticated;

-- Create function to release a consultation slot (for cancellations)
CREATE OR REPLACE FUNCTION release_consultation_slot(
    p_slot_id UUID
)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    -- Release the slot by updating its status
    UPDATE consultation_slots
    SET 
        is_available = true,
        is_booked = false,
        booked_by = NULL,
        updated_at = TIMEZONE('utc'::text, NOW())
    WHERE id = p_slot_id;
    
    -- Check if update was successful
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Slot not found'
        );
    END IF;
    
    -- Return success
    RETURN json_build_object(
        'success', true,
        'slot_id', p_slot_id
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION release_consultation_slot(UUID) TO authenticated; 