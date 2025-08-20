import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, Trash2, Save, X, AlertTriangle } from 'lucide-react';
import { supabase } from '../../utils/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { formatDate, parseLocalDate, isPastDate } from '../../utils/dateUtils';

interface ConsultationSlot {
  id?: string;
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  is_booked: boolean;
  consultation_bookings?: {
    id: string;
    buyer_id: string;
    buyer: {
      full_name: string;
      email: string;
    };
  }[];
}

interface ConsultationSettings {
  consultation_duration: number;
}

export function ConsultationSlotsManager() {
  const { user } = useAuth();
  const [slots, setSlots] = useState<ConsultationSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [consultationSettings, setConsultationSettings] = useState<ConsultationSettings | null>(null);
  const [newSlot, setNewSlot] = useState<ConsultationSlot>({
    date: '',
    start_time: '',
    end_time: '',
    is_available: true,
    is_booked: false
  });

  // Load existing slots and consultation settings
  useEffect(() => {
    if (user) {
      loadConsultationSettings();
      loadSlots();
    }
  }, [user]);

  const loadConsultationSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('consultation_duration')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      setConsultationSettings({
        consultation_duration: data.consultation_duration || 60
      });
    } catch (error) {
      console.error('Error loading consultation settings:', error);
      setConsultationSettings({ consultation_duration: 60 });
    }
  };

  const loadSlots = async () => {
    try {
      const { data, error } = await supabase
        .from('consultation_slots')
        .select('*, consultation_bookings(buyer_id, buyer:profiles!consultation_bookings_buyer_id_fkey(full_name, email))')
        .eq('seller_id', user?.id)
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) throw error;
      setSlots(data || []);
    } catch (error) {
      console.error('Error loading slots:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSlot = () => {
    setNewSlot({
      date: '',
      start_time: '',
      end_time: '',
      is_available: true,
      is_booked: false
    });
    setShowAddForm(true);
  };

  const createFixedDurationSlots = (startTime: string, endTime: string, duration: number) => {
    const slots: ConsultationSlot[] = [];
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    const durationMs = duration * 60 * 1000; // Convert minutes to milliseconds

    let currentTime = new Date(start);
    
    while (currentTime.getTime() + durationMs <= end.getTime()) {
      const slotEnd = new Date(currentTime.getTime() + durationMs);
      
      slots.push({
        date: newSlot.date,
        start_time: currentTime.toTimeString().slice(0, 5),
        end_time: slotEnd.toTimeString().slice(0, 5),
        is_available: true,
        is_booked: false
      });
      
      currentTime = slotEnd;
    }

    return slots;
  };

  const handleSaveSlot = async () => {
    if (!user || !newSlot.date || !newSlot.start_time || !newSlot.end_time || !consultationSettings) {
      alert('Please fill in all fields');
      return;
    }

    // Validate time
    if (newSlot.start_time >= newSlot.end_time) {
      alert('End time must be after start time');
      return;
    }

    // Validate date is not in the past
    if (isPastDate(newSlot.date)) {
      alert('Cannot create slots for past dates');
      return;
    }

    // Calculate total duration in minutes
    const start = new Date(`2000-01-01T${newSlot.start_time}`);
    const end = new Date(`2000-01-01T${newSlot.end_time}`);
    const totalDurationMinutes = (end.getTime() - start.getTime()) / (1000 * 60);

    // Check if the time block is long enough for at least one consultation
    if (totalDurationMinutes < consultationSettings.consultation_duration) {
      alert(`Time block must be at least ${consultationSettings.consultation_duration} minutes long`);
      return;
    }

    setIsSaving(true);
    try {
      // Create fixed-duration slots
      const fixedSlots = createFixedDurationSlots(
        newSlot.start_time, 
        newSlot.end_time, 
        consultationSettings.consultation_duration
      );

      if (fixedSlots.length === 0) {
        alert('No valid consultation slots could be created from this time range');
        return;
      }

      // Insert all slots
      const { error } = await supabase
        .from('consultation_slots')
        .insert(
          fixedSlots.map(slot => ({
            seller_id: user.id,
            date: slot.date,
            start_time: slot.start_time,
            end_time: slot.end_time,
            is_available: true,
            is_booked: false
          }))
        );

      if (error) throw error;

      setShowAddForm(false);
      setNewSlot({
        date: '',
        start_time: '',
        end_time: '',
        is_available: true,
        is_booked: false
      });
      loadSlots();
      
      // Show success message with slot count
      alert(`Successfully created ${fixedSlots.length} consultation slot(s) of ${consultationSettings.consultation_duration} minutes each`);
    } catch (error) {
      console.error('Error saving slots:', error);
      alert('Error saving slots');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    if (!confirm('Are you sure you want to delete this slot?')) return;

    try {
      // Check if the slot is booked
      const slot = slots.find(s => s.id === slotId);
      if (slot?.is_booked) {
        alert('Cannot delete a booked slot. Please cancel the booking first.');
        return;
      }

      const { error } = await supabase
        .from('consultation_slots')
        .delete()
        .eq('id', slotId);

      if (error) throw error;
      loadSlots();
    } catch (error) {
      console.error('Error deleting slot:', error);
      alert('Error deleting slot');
    }
  };

  const handleCancelBooking = async (slotId: string) => {
    if (!confirm('Are you sure you want to cancel this booking? This will refund the buyer.')) return;

    try {
      // Find the booking for this slot
      const { data: bookings, error: bookingError } = await supabase
        .from('consultation_bookings')
        .select('*')
        .eq('slot_id', slotId)
        .eq('status', 'confirmed');

      if (bookingError) throw bookingError;

      if (bookings && bookings.length > 0) {
        // Update booking status to cancelled
        const { error: updateError } = await supabase
          .from('consultation_bookings')
          .update({ 
            status: 'cancelled',
            payment_status: 'refunded'
          })
          .eq('slot_id', slotId);

        if (updateError) throw updateError;
      }

      // Make the slot available again
      const { error: slotError } = await supabase
        .from('consultation_slots')
        .update({ 
          is_available: true,
          is_booked: false,
          booked_by: null
        })
        .eq('id', slotId);

      if (slotError) throw slotError;

      loadSlots();
      alert('Booking cancelled successfully');
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert('Error cancelling booking');
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getStatusBadge = (slot: ConsultationSlot) => {
    if (slot.is_booked) {
      return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Booked</span>;
    }
    if (!slot.is_available) {
      return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">Unavailable</span>;
    }
    return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Available</span>;
  };

  const getBookingInfo = (slot: ConsultationSlot) => {
    if (!slot.is_booked || !slot.consultation_bookings || slot.consultation_bookings.length === 0) {
      return null;
    }

    const booking = slot.consultation_bookings[0];
    const buyer = booking.buyer;
    
    return (
      <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
        <div className="text-xs text-blue-800">
          <strong>Booked by:</strong> {buyer?.full_name || 'Unknown'} ({buyer?.email || 'No email'})
        </div>
      </div>
    );
  };

  const calculateSlotDuration = (startTime: string, endTime: string) => {
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    return Math.round((end.getTime() - start.getTime()) / (1000 * 60));
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Consultation Slots</h2>
            <p className="text-sm text-gray-600 mt-1">
              Manage your available consultation time slots
            </p>
            {consultationSettings && (
              <div className="flex items-center gap-2 mt-2 text-sm text-blue-600">
                <AlertTriangle className="w-4 h-4" />
                <span>Slots will be automatically split into {consultationSettings.consultation_duration}-minute sessions</span>
              </div>
            )}
          </div>
          <button
            onClick={handleAddSlot}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Time Block
          </button>
        </div>
      </div>

      {/* Add Slot Form */}
      {showAddForm && (
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="mb-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">How it works:</h4>
            <p className="text-sm text-blue-800">
              Enter a time block (e.g., 9:00 AM - 5:00 PM). The system will automatically create 
              {consultationSettings ? ` ${consultationSettings.consultation_duration}-minute` : ' 60-minute'} 
              consultation slots within that time range.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <input
                type="date"
                value={newSlot.date}
                onChange={(e) => setNewSlot({ ...newSlot, date: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Time
              </label>
              <input
                type="time"
                value={newSlot.start_time}
                onChange={(e) => setNewSlot({ ...newSlot, start_time: e.target.value })}
                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Time
              </label>
              <input
                type="time"
                value={newSlot.end_time}
                onChange={(e) => setNewSlot({ ...newSlot, end_time: e.target.value })}
                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-end space-x-2">
              <button
                onClick={handleSaveSlot}
                disabled={isSaving}
                className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Creating...' : 'Create Slots'}
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="inline-flex items-center justify-center px-3 py-2 bg-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Slots List */}
      <div className="p-6">
        {slots.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No consultation slots</h3>
            <p className="text-gray-600 mb-4">
              Add your first time block to start creating consultation slots
            </p>
            <button
              onClick={handleAddSlot}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Time Block
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {slots.map((slot) => (
              <div
                key={slot.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <Calendar className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {formatDate(slot.date)}
                    </div>
                    <div className="text-sm text-gray-600 flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>
                        {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                      </span>
                      <span className="text-blue-600 font-medium">
                        ({calculateSlotDuration(slot.start_time, slot.end_time)} min)
                      </span>
                    </div>
                    {getBookingInfo(slot)}
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {getStatusBadge(slot)}
                  {!slot.is_booked && (
                    <button
                      onClick={() => slot.id && handleDeleteSlot(slot.id)}
                      className="text-red-600 hover:text-red-800 p-1"
                      title="Delete slot"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  {slot.is_booked && (
                    <button
                      onClick={() => slot.id && handleCancelBooking(slot.id)}
                      className="text-yellow-600 hover:text-yellow-800 p-1"
                      title="Cancel booking"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 