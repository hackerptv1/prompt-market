import { supabase } from './supabase';

/**
 * Run consultation cleanup to remove expired slots and old bookings
 */
export async function runConsultationCleanup(): Promise<{
  past_slots_cleaned: number;
  old_booked_slots_deleted: number;
  old_bookings_deleted: number;
  timestamp: string;
} | null> {
  try {
    const { data, error } = await supabase
      .rpc('run_consultation_cleanup');

    if (error) {
      console.error('Error running consultation cleanup:', error);
      return null;
    }

    console.log('Consultation cleanup completed:', data);
    return data;
  } catch (error) {
    console.error('Error running consultation cleanup:', error);
    return null;
  }
}

/**
 * Clean up all past slots (for immediate cleanup)
 * This preserves booking history by moving slots to consultation_bookings first
 */
export async function cleanupAllPastSlots(): Promise<number | null> {
  try {
    const { data, error } = await supabase
      .rpc('cleanup_all_past_slots');

    if (error) {
      console.error('Error cleaning up past slots:', error);
      return null;
    }

    console.log('Past slots cleaned up:', data);
    return data;
  } catch (error) {
    console.error('Error cleaning up past slots:', error);
    return null;
  }
}

/**
 * Mark booked slots for deletion (for slots older than 20 days)
 */
export async function markBookedSlotsForDeletion(): Promise<number | null> {
  try {
    const { data, error } = await supabase
      .rpc('mark_booked_slots_for_deletion');

    if (error) {
      console.error('Error marking booked slots for deletion:', error);
      return null;
    }

    console.log('Booked slots marked for deletion:', data);
    return data;
  } catch (error) {
    console.error('Error marking booked slots for deletion:', error);
    return null;
  }
}

/**
 * Delete old booked slots (older than 20 days)
 */
export async function deleteOldBookedSlots(): Promise<number | null> {
  try {
    const { data, error } = await supabase
      .rpc('delete_old_booked_slots');

    if (error) {
      console.error('Error deleting old booked slots:', error);
      return null;
    }

    console.log('Old booked slots deleted:', data);
    return data;
  } catch (error) {
    console.error('Error deleting old booked slots:', error);
    return null;
  }
}

/**
 * Clean up old consultation bookings (older than 20 days)
 */
export async function cleanupOldConsultationBookings(): Promise<number | null> {
  try {
    const { data, error } = await supabase
      .rpc('cleanup_old_consultation_bookings');

    if (error) {
      console.error('Error cleaning up old bookings:', error);
      return null;
    }

    console.log('Old consultation bookings cleaned up:', data);
    return data;
  } catch (error) {
    console.error('Error cleaning up old bookings:', error);
    return null;
  }
} 