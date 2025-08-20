// Test utility for consultation booking process

import { supabase } from './supabase';

/**
 * Test the complete booking process
 */
export async function testBookingProcess(
  sellerId: string,
  buyerId: string,
  slotId: string
): Promise<{
  success: boolean;
  message: string;
  details?: any;
}> {
  try {
    console.log('Testing booking process for slot:', slotId);

    // Step 1: Check slot availability
    const { data: slot, error: slotError } = await supabase
      .from('consultation_slots')
      .select('*')
      .eq('id', slotId)
      .single();

    if (slotError || !slot) {
      return {
        success: false,
        message: 'Slot not found'
      };
    }

    console.log('Current slot state:', slot);

    // Step 2: Test slot reservation
    const { data: reserveResult, error: reserveError } = await supabase
      .rpc('reserve_consultation_slot', {
        p_slot_id: slotId,
        p_buyer_id: buyerId
      });

    if (reserveError) {
      return {
        success: false,
        message: `Reservation failed: ${reserveError.message}`
      };
    }

    if (!reserveResult.success) {
      return {
        success: false,
        message: `Reservation failed: ${reserveResult.error}`
      };
    }

    console.log('Slot reserved successfully');

    // Step 3: Test booking
    const { data: bookingResult, error: bookingError } = await supabase
      .rpc('book_consultation_slot', {
        p_slot_id: slotId,
        p_buyer_id: buyerId,
        p_seller_id: sellerId,
        p_booking_date: slot.date,
        p_start_time: slot.start_time,
        p_end_time: slot.end_time,
        p_notes: 'Test booking',
        p_payment_amount: 50.00
      });

    if (bookingError) {
      return {
        success: false,
        message: `Booking failed: ${bookingError.message}`
      };
    }

    if (!bookingResult.success) {
      return {
        success: false,
        message: `Booking failed: ${bookingResult.error}`
      };
    }

    console.log('Booking completed successfully');

    // Step 4: Verify final state
    const { data: finalSlot, error: finalSlotError } = await supabase
      .from('consultation_slots')
      .select('*')
      .eq('id', slotId)
      .single();

    if (finalSlotError || !finalSlot) {
      return {
        success: false,
        message: 'Could not verify final slot state'
      };
    }

    console.log('Final slot state:', finalSlot);

    return {
      success: true,
      message: 'Booking process test completed successfully',
      details: {
        bookingId: bookingResult.booking_id,
        slotState: finalSlot
      }
    };

  } catch (error) {
    console.error('Error testing booking process:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Get slot details for debugging
 */
export async function getSlotDetails(slotId: string): Promise<{
  success: boolean;
  slot?: any;
  error?: string;
}> {
  try {
    const { data, error } = await supabase
      .from('consultation_slots')
      .select('*')
      .eq('id', slotId)
      .single();

    if (error) {
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      slot: data
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Clean up test data
 */
export async function cleanupTestBooking(bookingId: string, slotId: string): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    // Delete the booking
    await supabase
      .from('consultation_bookings')
      .delete()
      .eq('id', bookingId);

    // Reset the slot
    await supabase
      .from('consultation_slots')
      .update({
        is_available: true,
        is_booked: false,
        booked_by: null
      })
      .eq('id', slotId);

    return {
      success: true,
      message: 'Test data cleaned up successfully'
    };

  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to cleanup test data'
    };
  }
} 