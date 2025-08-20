import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Check, CreditCard } from 'lucide-react';
import { supabase } from '../../../utils/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import { useBooking } from '../../../contexts/BookingContext';
import { ConsultationSlot, ConsultationSettings } from '../../../types';
import { PaymentForm } from '../../payment/PaymentForm';
import { generateAndStoreMeetingLink } from '../../../utils/meetingLinkService';
import { formatDate, formatDateShort } from '../../../utils/dateUtils';

interface ConsultationBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  seller: {
    id: string;
    name: string;
  };
  consultationSettings: ConsultationSettings;
}

export function ConsultationBookingModal({ 
  isOpen, 
  onClose, 
  seller, 
  consultationSettings 
}: ConsultationBookingModalProps) {
  const { user } = useAuth();
  const { 
    bookingState, 
    closeBookingModal, 
    setCurrentStep, 
    setSelectedSlot, 
    setBookingNotes,
    resetBookingState 
  } = useBooking();
  
  const [availableSlots, setAvailableSlots] = useState<ConsultationSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProceedingToPayment, setIsProceedingToPayment] = useState(false);
  const [reservingSlotId, setReservingSlotId] = useState<string | null>(null);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);

  // Check if the current user is trying to book their own slot
  const isOwnSlot = user?.id === seller.id;

  // If user is trying to book their own slot, show error and close
  useEffect(() => {
    if (isOwnSlot && isOpen) {
      alert('You cannot book your own consultation slots.');
      onClose();
    }
  }, [isOwnSlot, isOpen, onClose]);

  // Load available slots when modal opens
  useEffect(() => {
    console.log('Modal effect triggered:', { isOpen, sellerId: seller?.id });
    
    if (isOpen && seller?.id) {
      // First, clean up expired slots, then load available slots
      const initializeSlots = async () => {
        try {
          console.log('Initializing slots for seller:', seller.id);
          // Load available slots (cleanup is handled by the query filters)
          await loadAvailableSlots();
        } catch (error) {
          console.error('Error initializing slots:', error);
          await loadAvailableSlots();
        }
      };
      
      initializeSlots();
    }
  }, [isOpen, seller?.id]);

  // No timeout needed since slots are only reserved after successful payment

  const loadAvailableSlots = async () => {
    if (!seller?.id) {
      console.log('No seller ID provided');
      return;
    }

    console.log('Current user ID:', user?.id);
    console.log('Seller ID:', seller.id);
    console.log('User role:', user?.role);

    // Prevent sellers from loading their own slots
    if (user?.id === seller.id) {
      console.log('Sellers cannot book their own slots - User ID matches Seller ID');
      setAvailableSlots([]);
      return;
    }

    try {
      setIsLoading(true);
      console.log('Loading available slots for seller:', seller.id);

      const today = new Date().toISOString().split('T')[0];
      const currentTime = new Date().toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      });

      console.log('Query parameters:', {
        seller_id: seller.id,
        today,
        currentTime
      });

      // Get only future slots (no past slots at all)
      const { data, error } = await supabase
        .from('consultation_slots')
        .select('*')
        .eq('seller_id', seller.id)
        .eq('is_available', true)
        .eq('is_booked', false)
        .gte('date', today)
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });

      console.log('Supabase query result:', { data, error });
      console.log('Data length:', data?.length);
      console.log('Error details:', error);

      if (error) {
        console.error('Error loading slots:', error);
        throw error;
      }

      console.log('Available slots loaded:', data);
      setAvailableSlots(data || []);
    } catch (error) {
      console.error('Error loading available slots:', error);
      setAvailableSlots([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSlotSelection = async (slot: ConsultationSlot) => {
    // Prevent double-clicks
    if (reservingSlotId === slot.id) {
      return;
    }

    console.log('Selecting slot:', slot);
    setReservingSlotId(slot.id || null);
    
    try {
      // Just select the slot without reserving it yet
      // The actual reservation will happen after successful payment
      setSelectedSlot(slot);
      console.log('Slot selected successfully:', slot.id);
    } catch (error) {
      console.error('Error selecting slot:', error);
      alert('Error selecting slot. Please try again.');
    } finally {
      setReservingSlotId(null);
    }
  };

  const handleProceedToPayment = async () => {
    if (bookingState.selectedSlot && !isProceedingToPayment) {
      setIsProceedingToPayment(true);
      
      try {
        // Brief loading state for transition
        await new Promise(resolve => setTimeout(resolve, 300));
        setCurrentStep('payment');
      } catch (error) {
        console.error('Error proceeding to payment:', error);
        alert('Error proceeding to payment. Please try again.');
      } finally {
        setIsProceedingToPayment(false);
      }
    }
  };

  const handlePaymentSuccess = async () => {
    if (!user || !bookingState.selectedSlot) return;

    setIsPaymentProcessing(true);
    
    try {
      console.log('Payment successful, starting booking process for slot:', bookingState.selectedSlot);

      // Step 1: Reserve the slot first by updating its status
      const { data: slotUpdateResult, error: slotUpdateError } = await supabase
        .from('consultation_slots')
        .update({
          is_available: false,
          is_booked: true,
          booked_by: user.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', bookingState.selectedSlot.id)
        .eq('is_available', true)
        .eq('is_booked', false)
        .select()
        .single();

      console.log('Slot update result:', slotUpdateResult);
      console.log('Slot update error:', slotUpdateError);

      if (slotUpdateError) {
        throw new Error('Failed to reserve slot: ' + slotUpdateError.message);
      }

      if (!slotUpdateResult) {
        throw new Error('Failed to reserve slot: Slot is no longer available');
      }

      console.log('Slot reserved successfully:', bookingState.selectedSlot.id);

      // Step 2: Create the consultation booking
      const { data: bookingData, error: bookingError } = await supabase
        .from('consultation_bookings')
        .insert({
          slot_id: bookingState.selectedSlot.id,
          buyer_id: user.id,
          seller_id: seller.id,
          booking_date: bookingState.selectedSlot.date,
          start_time: bookingState.selectedSlot.start_time,
          end_time: bookingState.selectedSlot.end_time,
          status: 'confirmed',
          payment_status: 'paid',
          payment_amount: consultationSettings.consultation_price,
          notes: bookingState.bookingNotes.trim() || null
        })
        .select()
        .single();

      console.log('Booking created:', bookingData);
      console.log('Booking error:', bookingError);

      if (bookingError) throw bookingError;

      // Step 3: Generate meeting link if auto-generate is enabled
      if (bookingData.id) {
        const startDateTime = new Date(`${bookingState.selectedSlot.date}T${bookingState.selectedSlot.start_time}`);
        const endDateTime = new Date(`${bookingState.selectedSlot.date}T${bookingState.selectedSlot.end_time}`);
        
        await generateAndStoreMeetingLink(
          bookingData.id,
          seller.id,
          startDateTime.toISOString(),
          endDateTime.toISOString(),
          'Google Meet'
        );
      }

      // Show success step and reset payment loading states
      setCurrentStep('success');
      setIsProceedingToPayment(false);
      
    } catch (error) {
      console.error('Error creating booking:', error);
      
      // If booking creation failed, the slot was never reserved, so no need to release
      alert('Error creating booking. Please contact support.');
      setIsPaymentProcessing(false);
    } finally {
      // Reset payment processing state
      setIsPaymentProcessing(false);
    }
  };

  const handlePaymentError = async (error: string) => {
    // Reset loading states
    setIsProceedingToPayment(false);
    setReservingSlotId(null);
    setIsPaymentProcessing(false);

    // If payment failed, no slot was reserved, so just go back to slot selection
    console.log('Payment failed, returning to slot selection');
    
    alert(`Payment failed: ${error}`);
    setCurrentStep('select-slot');
    setSelectedSlot(null);
  };

  const handleCancel = async () => {
    // Reset loading states
    setIsProceedingToPayment(false);
    setReservingSlotId(null);
    setIsPaymentProcessing(false);

    // If user cancels, no slot was reserved, so just reset
    console.log('User cancelled, resetting to slot selection');
    
    setCurrentStep('select-slot');
    setSelectedSlot(null);
    setBookingNotes('');
  };

  const handleClose = () => {
    // Reset all loading states
    setIsProceedingToPayment(false);
    setReservingSlotId(null);
    setIsPaymentProcessing(false);
    
    // Reset booking state when closing
    resetBookingState();
    closeBookingModal();
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {bookingState.currentStep === 'payment' ? 'Payment' : 
               bookingState.currentStep === 'success' ? 'Booking Confirmed' :
               `Book Consultation with ${seller.name}`}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {bookingState.currentStep === 'payment' ? 'Complete your payment to confirm booking' :
               bookingState.currentStep === 'success' ? 'Your consultation has been booked successfully' :
               'Select an available time slot for your consultation'}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {bookingState.currentStep === 'select-slot' && (
            <>
              {/* Consultation Info */}
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">Consultation Details</h3>
                  <div className="text-2xl font-bold text-blue-600">
                    ${consultationSettings.consultation_price}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{consultationSettings.consultation_duration} minutes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{consultationSettings.consultation_platform}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-3">
                  {consultationSettings.consultation_description}
                </p>
              </div>

              {/* Available Slots */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-4">Available Time Slots</h3>
                
                {isLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-16 bg-gray-200 rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No available slots</h4>
                    <p className="text-gray-600">
                      This seller doesn't have any available consultation slots at the moment.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot.id}
                        onClick={() => handleSlotSelection(slot)}
                        disabled={reservingSlotId === slot.id}
                        className={`w-full p-4 border rounded-lg text-left transition-colors ${
                          bookingState.selectedSlot?.id === slot.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        } ${reservingSlotId === slot.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                              bookingState.selectedSlot?.id === slot.id
                                ? 'border-blue-500 bg-blue-500'
                                : 'border-gray-300'
                            }`}>
                              {bookingState.selectedSlot?.id === slot.id && (
                                <Check className="w-3 h-3 text-white" />
                              )}
                              {reservingSlotId === slot.id && (
                                <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {formatDate(slot.date)}
                              </div>
                              <div className="text-sm text-gray-600">
                                {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                              </div>
                            </div>
                          </div>
                          <div className="text-sm text-gray-500">
                            {reservingSlotId === slot.id ? 'Reserving...' : formatDateShort(slot.date)}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Booking Notes */}
              {bookingState.selectedSlot && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    value={bookingState.bookingNotes}
                    onChange={(e) => setBookingNotes(e.target.value)}
                    placeholder="Any specific topics you'd like to discuss or questions you have..."
                    rows={3}
                    className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              )}
            </>
          )}

          {bookingState.currentStep === 'payment' && bookingState.selectedSlot && (
            <PaymentForm
              key={`payment-${bookingState.selectedSlot.id}`}
              amount={consultationSettings.consultation_price}
              consultationDetails={{
                sellerName: seller.name,
                date: bookingState.selectedSlot.date,
                time: bookingState.selectedSlot.start_time,
                duration: consultationSettings.consultation_duration
              }}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentError={handlePaymentError}
              onCancel={handleCancel}
              disabled={isPaymentProcessing}
            />
          )}

          {bookingState.currentStep === 'success' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Consultation Booked Successfully!
              </h3>
              <p className="text-gray-600 mb-6">
                You will receive a confirmation email with meeting details shortly.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <h4 className="font-medium text-gray-900 mb-2">Booking Details:</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <div><strong>Seller:</strong> {seller.name}</div>
                  <div><strong>Date:</strong> {formatDate(bookingState.selectedSlot!.date)}</div>
                  <div><strong>Time:</strong> {formatTime(bookingState.selectedSlot!.start_time)} - {formatTime(bookingState.selectedSlot!.end_time)}</div>
                  <div><strong>Amount:</strong> ${consultationSettings.consultation_price}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {bookingState.currentStep === 'select-slot' && (
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-600">
              {bookingState.selectedSlot ? (
                <span>
                  Selected: {formatDate(bookingState.selectedSlot.date)} at {formatTime(bookingState.selectedSlot.start_time)}
                </span>
              ) : (
                <span>Please select a time slot</span>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleProceedToPayment}
                disabled={!bookingState.selectedSlot || isProceedingToPayment}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isProceedingToPayment ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>Proceed to Payment</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {bookingState.currentStep === 'success' && (
          <div className="flex justify-center p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={handleClose}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 