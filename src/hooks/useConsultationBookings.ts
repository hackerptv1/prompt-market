import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabase';
import { useAuth } from '../contexts/AuthContext';

interface BuyerInfo {
  id: string;
  full_name: string;
  email: string;
  profile_picture_url?: string;
}

interface ConsultationBooking {
  id: string;
  slot_id: string;
  buyer_id: string;
  seller_id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'missed' | 'in_progress';
  meeting_link?: string;
  notes?: string;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_amount: number;
  payment_intent_id?: string;
  payment_method_id?: string;
  payment_date?: string;
  created_at: string;
  updated_at: string;
  buyer?: BuyerInfo;
}

interface UseConsultationBookingsOptions {
  sellerId?: string;
  buyerId?: string;
  status?: string[];
  includeBuyerInfo?: boolean;
  includeSellerInfo?: boolean;
}

export function useConsultationBookings(options: UseConsultationBookingsOptions = {}) {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<ConsultationBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    // Don't fetch if user is not authenticated
    if (!user?.id) {
      setBookings([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      let query = supabase
        .from('consultation_bookings')
        .select('*')
        .order('booking_date', { ascending: true })
        .order('start_time', { ascending: true });

      // Apply filters
      if (options.sellerId) {
        query = query.eq('seller_id', options.sellerId);
      } else if (options.buyerId) {
        query = query.eq('buyer_id', options.buyerId);
      } else if (user?.id) {
        // Default to current user's bookings based on their role
        if (user.role === 'seller') {
          query = query.eq('seller_id', user.id);
        } else {
          query = query.eq('buyer_id', user.id);
        }
      }

      if (options.status && options.status.length > 0) {
        query = query.in('status', options.status);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      if (data && data.length > 0) {
        let enhancedBookings = data;

        // Fetch buyer information if requested
        if (options.includeBuyerInfo) {
          const buyerIds = [...new Set(data.map(booking => booking.buyer_id))];
          
          // Try to fetch buyer profiles directly
          const { data: buyers, error: buyersError } = await supabase
            .from('profiles')
            .select('id, full_name, email, profile_picture_url')
            .in('id', buyerIds);

          if (buyersError) {
            console.error('Error fetching buyer profiles:', buyersError);
            // If we can't fetch buyer profiles due to RLS, create fallback data
            enhancedBookings = data.map(booking => ({
              ...booking,
              buyer: {
                id: booking.buyer_id,
                full_name: `Buyer (${booking.buyer_id.slice(0, 8)}...)`,
                email: 'Email not available',
                profile_picture_url: undefined
              }
            }));
          } else {
            enhancedBookings = data.map(booking => {
              const buyer = buyers?.find(b => b.id === booking.buyer_id);
              return {
                ...booking,
                buyer: buyer || {
                  id: booking.buyer_id,
                  full_name: `Buyer (${booking.buyer_id.slice(0, 8)}...)`,
                  email: 'Email not available',
                  profile_picture_url: undefined
                }
              };
            });
          }
        }

        // Fetch seller information if requested (for buyers viewing their bookings)
        if (options.includeSellerInfo) {
          const sellerIds = [...new Set(data.map(booking => booking.seller_id))];
          
          const { data: sellers, error: sellersError } = await supabase
            .from('profiles')
            .select('id, full_name, email, profile_picture_url, display_name')
            .in('id', sellerIds);

          if (sellersError) {
            console.error('Error fetching seller profiles:', sellersError);
            // If we can't fetch seller profiles due to RLS, create fallback data
            enhancedBookings = enhancedBookings.map(booking => ({
              ...booking,
              seller: {
                id: booking.seller_id,
                full_name: `Seller (${booking.seller_id.slice(0, 8)}...)`,
                email: 'Email not available',
                display_name: `Seller (${booking.seller_id.slice(0, 8)}...)`,
                profile_picture_url: undefined
              }
            }));
          } else {
            enhancedBookings = enhancedBookings.map(booking => {
              const seller = sellers?.find(s => s.id === booking.seller_id);
              return {
                ...booking,
                seller: seller || {
                  id: booking.seller_id,
                  full_name: `Seller (${booking.seller_id.slice(0, 8)}...)`,
                  email: 'Email not available',
                  display_name: `Seller (${booking.seller_id.slice(0, 8)}...)`,
                  profile_picture_url: undefined
                }
              };
            });
          }
        }

        setBookings(enhancedBookings);
      } else {
        setBookings(data || []);
      }
    } catch (err) {
      console.error('Error fetching consultation bookings:', err);
      setError('Failed to load consultation bookings');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, user?.role, options.sellerId, options.buyerId, options.status?.join(','), options.includeBuyerInfo, options.includeSellerInfo]);

  const updateBookingStatus = useCallback(async (bookingId: string, status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'missed' | 'in_progress') => {
    try {
      const { error } = await supabase
        .from('consultation_bookings')
        .update({ status })
        .eq('id', bookingId);

      if (error) throw error;

      // Refresh the bookings list
      fetchBookings();
      return true;
    } catch (err) {
      console.error('Error updating booking status:', err);
      setError('Failed to update booking status');
      return false;
    }
  }, [fetchBookings]);

  const addMeetingLink = useCallback(async (bookingId: string, meetingLink: string) => {
    try {
      const { error } = await supabase
        .from('consultation_bookings')
        .update({ meeting_link: meetingLink })
        .eq('id', bookingId);

      if (error) throw error;

      // Refresh the bookings list
      fetchBookings();
      return true;
    } catch (err) {
      console.error('Error adding meeting link:', err);
      setError('Failed to add meeting link');
      return false;
    }
  }, [fetchBookings]);

  const getUpcomingBookings = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    return bookings.filter(booking => 
      booking.booking_date >= today && 
      ['pending', 'confirmed'].includes(booking.status)
    );
  }, [bookings]);

  const getPastBookings = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    return bookings.filter(booking => 
      booking.booking_date < today || 
      ['completed', 'cancelled'].includes(booking.status)
    );
  }, [bookings]);

  // Initial fetch
  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  return {
    bookings,
    isLoading,
    error,
    fetchBookings,
    updateBookingStatus,
    addMeetingLink,
    getUpcomingBookings,
    getPastBookings
  };
} 