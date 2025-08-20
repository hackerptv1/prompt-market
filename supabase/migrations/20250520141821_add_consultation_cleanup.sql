-- Add automatic cleanup functionality for consultation slots

-- Function to clean up expired available slots (remove immediately)
CREATE OR REPLACE FUNCTION cleanup_expired_available_slots()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Delete available slots that are in the past
    DELETE FROM consultation_slots 
    WHERE is_available = true 
      AND is_booked = false
      AND (date < CURRENT_DATE OR (date = CURRENT_DATE AND end_time < CURRENT_TIME));
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark booked slots for deletion after 20 days
CREATE OR REPLACE FUNCTION mark_booked_slots_for_deletion()
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    -- Mark booked slots that are older than 20 days for deletion
    UPDATE consultation_slots 
    SET is_available = false
    WHERE is_booked = true 
      AND date < (CURRENT_DATE - INTERVAL '20 days');
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to delete old booked slots (older than 20 days)
CREATE OR REPLACE FUNCTION delete_old_booked_slots()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Delete booked slots that are older than 20 days
    DELETE FROM consultation_slots 
    WHERE is_booked = true 
      AND date < (CURRENT_DATE - INTERVAL '20 days');
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up old consultation bookings (older than 20 days)
CREATE OR REPLACE FUNCTION cleanup_old_consultation_bookings()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Delete consultation bookings that are older than 20 days
    DELETE FROM consultation_bookings 
    WHERE booking_date < (CURRENT_DATE - INTERVAL '20 days');
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Master cleanup function that runs all cleanup operations
CREATE OR REPLACE FUNCTION run_consultation_cleanup()
RETURNS JSON AS $$
DECLARE
    result JSON;
    expired_slots_deleted INTEGER;
    booked_slots_marked INTEGER;
    old_booked_slots_deleted INTEGER;
    old_bookings_deleted INTEGER;
BEGIN
    -- Clean up expired available slots
    SELECT cleanup_expired_available_slots() INTO expired_slots_deleted;
    
    -- Mark booked slots for deletion
    SELECT mark_booked_slots_for_deletion() INTO booked_slots_marked;
    
    -- Delete old booked slots
    SELECT delete_old_booked_slots() INTO old_booked_slots_deleted;
    
    -- Clean up old consultation bookings
    SELECT cleanup_old_consultation_bookings() INTO old_bookings_deleted;
    
    -- Return results
    result := json_build_object(
        'expired_slots_deleted', expired_slots_deleted,
        'booked_slots_marked', booked_slots_marked,
        'old_booked_slots_deleted', old_booked_slots_deleted,
        'old_bookings_deleted', old_bookings_deleted,
        'timestamp', NOW()
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a cron job to run cleanup daily at 2 AM UTC
-- Note: This requires pg_cron extension to be enabled
-- SELECT cron.schedule('consultation-cleanup', '0 2 * * *', 'SELECT run_consultation_cleanup();');

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION cleanup_expired_available_slots() TO authenticated;
GRANT EXECUTE ON FUNCTION mark_booked_slots_for_deletion() TO authenticated;
GRANT EXECUTE ON FUNCTION delete_old_booked_slots() TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_consultation_bookings() TO authenticated;
GRANT EXECUTE ON FUNCTION run_consultation_cleanup() TO authenticated;

-- Create indexes for better cleanup performance
CREATE INDEX IF NOT EXISTS idx_consultation_slots_cleanup 
ON consultation_slots(date, is_available, is_booked);

CREATE INDEX IF NOT EXISTS idx_consultation_bookings_cleanup 
ON consultation_bookings(booking_date); 