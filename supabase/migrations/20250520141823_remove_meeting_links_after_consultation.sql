-- Function to remove meeting links after consultation end time
CREATE OR REPLACE FUNCTION remove_expired_meeting_links()
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    UPDATE consultation_bookings
    SET
        meeting_link = NULL,
        google_calendar_meet_link = NULL,
        platform_join_url = NULL
    WHERE
        (booking_date < CURRENT_DATE
         OR (booking_date = CURRENT_DATE AND end_time < CURRENT_TIME))
        AND (meeting_link IS NOT NULL OR google_calendar_meet_link IS NOT NULL OR platform_join_url IS NOT NULL);

    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION remove_expired_meeting_links() TO authenticated; 