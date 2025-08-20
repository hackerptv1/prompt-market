import React, { useState, useEffect, useCallback } from 'react';
import { Video, Clock, Calendar, DollarSign, User } from 'lucide-react';
import { supabase } from '../../../utils/supabase';
import { ConsultationBookingModal } from './ConsultationBookingModal';
import { useBooking } from '../../../contexts/BookingContext';
import { useAuth } from '../../../contexts/AuthContext';

interface SellerData {
  id: string;
  name: string;
}

interface ConsultationSettings {
  consultation_enabled: boolean;
  consultation_price: number;
  consultation_duration: number;
  consultation_description: string;
  consultation_platform: string; // Now always 'Google Meet'
  google_calendar_email?: string;
  google_calendar_connected?: boolean;
  auto_generate_meeting_links?: boolean;
}

interface ConsultationSectionProps {
  seller: SellerData | null;
}

export function ConsultationSection({ seller }: ConsultationSectionProps) {
  const { bookingState, openBookingModal } = useBooking();
  const { user } = useAuth();
  const [consultationSettings, setConsultationSettings] = useState<ConsultationSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if the current user is viewing their own profile
  const isOwnProfile = user?.id === seller?.id;

  // Memoize the fetch function to prevent unnecessary re-creations
  const fetchConsultationSettings = useCallback(async () => {
    // Don't fetch if we already have settings for this seller
    if (consultationSettings && seller?.id) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('consultation_enabled, consultation_price, consultation_duration, consultation_description, consultation_platform, google_calendar_email, google_calendar_connected, auto_generate_meeting_links')
        .eq('id', seller?.id)
        .single();

      if (error) throw error;

      setConsultationSettings({
        consultation_enabled: data.consultation_enabled || false,
        consultation_price: data.consultation_price || 99.00,
        consultation_duration: data.consultation_duration || 60,
        consultation_description: data.consultation_description || 'Get personalized help with your prompt engineering needs. I\'ll help you create, refine, and optimize your AI prompts for better results.',
        consultation_platform: 'Google Meet', // Force Google Meet
        google_calendar_email: data.google_calendar_email || '',
        google_calendar_connected: data.google_calendar_connected || false,
        auto_generate_meeting_links: data.auto_generate_meeting_links !== false
      });
    } catch (error) {
      console.error('Error fetching consultation settings:', error);
      // Fallback to default settings
      setConsultationSettings({
        consultation_enabled: false,
        consultation_price: 99.00,
        consultation_duration: 60,
        consultation_description: 'Get personalized help with your prompt engineering needs. I\'ll help you create, refine, and optimize your AI prompts for better results.',
        consultation_platform: 'Google Meet',
        google_calendar_email: '',
        google_calendar_connected: false,
        auto_generate_meeting_links: true
      });
    } finally {
      setIsLoading(false);
    }
  }, [seller?.id, consultationSettings]);

  useEffect(() => {
    if (seller?.id) {
      fetchConsultationSettings();
    }
  }, [seller?.id, fetchConsultationSettings]);

  const handleBookNow = () => {
    if (seller && consultationSettings) {
      openBookingModal(seller.id, seller.name, consultationSettings);
    }
  };

  if (!seller || isLoading) return null;

  // Show a message if consultations are disabled
  if (!consultationSettings?.consultation_enabled) {
    return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Consultations</h2>
        </div>
        <div className="p-6 text-center">
          <p className="text-gray-600">This seller hasn't enabled consultations yet.</p>
        </div>
      </div>
    );
  }

  // Show different content if seller is viewing their own profile
  if (isOwnProfile) {
    return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Your Consultation Service</h2>
        </div>
        <div className="p-6">
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Service info */}
            <div className="flex-1 space-y-4">
              <h3 className="text-lg font-medium">1-on-1 Prompt Engineering Consultation</h3>
              <p className="text-gray-600">
                {consultationSettings.consultation_description}
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <Video className="h-5 w-5 text-red-600" />
                  <span>Google Meet</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <span>{consultationSettings.consultation_duration} Minutes</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <span>{consultationSettings.google_calendar_connected ? 'Calendar Integration' : 'Manual Scheduling'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                  <span>${consultationSettings.consultation_price} / session</span>
                </div>
              </div>
            </div>

            {/* CTA for own profile */}
            <div className="flex flex-col justify-center items-center sm:items-end gap-2 w-full sm:w-auto">
              <div className="font-bold text-2xl text-gray-900">${consultationSettings.consultation_price}</div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <User className="h-4 w-4" />
                <span>Your consultation service</span>
              </div>
              <div className="text-xs text-gray-400 text-center">
                Buyers can book consultations with you
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Book a Consultation</h2>
        </div>
        <div className="p-6">
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Service info */}
            <div className="flex-1 space-y-4">
              <h3 className="text-lg font-medium">1-on-1 Prompt Engineering Consultation</h3>
              <p className="text-gray-600">
                {consultationSettings.consultation_description}
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <Video className="h-5 w-5 text-red-600" />
                  <span>Google Meet</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <span>{consultationSettings.consultation_duration} Minutes</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <span>{consultationSettings.google_calendar_connected ? 'Calendar Integration' : 'Manual Scheduling'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                  <span>${consultationSettings.consultation_price} / session</span>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="flex flex-col justify-center items-center sm:items-end gap-2 w-full sm:w-auto">
              <div className="font-bold text-2xl text-gray-900">${consultationSettings.consultation_price}</div>
              <button 
                onClick={handleBookNow}
                className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Book Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal - Only render if modal is open for this seller */}
      {bookingState.isModalOpen && bookingState.sellerId === seller.id && bookingState.consultationSettings && (
        <ConsultationBookingModal
          isOpen={bookingState.isModalOpen}
          onClose={() => {}} // This will be handled by the modal itself
          seller={seller}
          consultationSettings={bookingState.consultationSettings}
        />
      )}
    </>
  );
}