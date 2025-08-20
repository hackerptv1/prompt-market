import React, { createContext, useContext, useState, useEffect } from 'react';
import { ConsultationSlot, ConsultationSettings } from '../types';
import { useAuth } from './AuthContext';

type BookingStep = 'select-slot' | 'payment' | 'success';

interface BookingState {
  isModalOpen: boolean;
  currentStep: BookingStep;
  selectedSlot: ConsultationSlot | null;
  bookingNotes: string;
  sellerId: string | null;
  sellerName: string | null;
  consultationSettings: ConsultationSettings | null;
}

interface BookingContextType {
  bookingState: BookingState;
  openBookingModal: (sellerId: string, sellerName: string, settings: ConsultationSettings) => void;
  closeBookingModal: () => void;
  setCurrentStep: (step: BookingStep) => void;
  setSelectedSlot: (slot: ConsultationSlot | null) => void;
  setBookingNotes: (notes: string) => void;
  resetBookingState: () => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

const STORAGE_KEY = 'consultation_booking_state';

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [bookingState, setBookingState] = useState<BookingState>({
    isModalOpen: false,
    currentStep: 'select-slot',
    selectedSlot: null,
    bookingNotes: '',
    sellerId: null,
    sellerName: null,
    consultationSettings: null,
  });

  // Load state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        setBookingState(parsed);
      } catch (error) {
        console.error('Error loading booking state:', error);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookingState));
  }, [bookingState]);

  const openBookingModal = (sellerId: string, sellerName: string, settings: ConsultationSettings) => {
    if (!user) {
      console.error('User not authenticated, cannot open booking modal.');
      return;
    }

    // Prevent sellers from booking their own slots
    if (user.id === sellerId) {
      console.error('Sellers cannot book their own consultation slots.');
      alert('You cannot book your own consultation slots.');
      return;
    }

    setBookingState(prev => ({
      ...prev,
      isModalOpen: true,
      sellerId,
      sellerName,
      consultationSettings: settings,
      // Only reset step if it's a different seller
      currentStep: prev.sellerId === sellerId ? prev.currentStep : 'select-slot',
      // Only reset slot if it's a different seller
      selectedSlot: prev.sellerId === sellerId ? prev.selectedSlot : null,
      // Only reset notes if it's a different seller
      bookingNotes: prev.sellerId === sellerId ? prev.bookingNotes : '',
    }));
  };

  const closeBookingModal = () => {
    setBookingState(prev => ({
      ...prev,
      isModalOpen: false,
    }));
  };

  const setCurrentStep = (step: BookingStep) => {
    setBookingState(prev => ({
      ...prev,
      currentStep: step,
    }));
  };

  const setSelectedSlot = (slot: ConsultationSlot | null) => {
    setBookingState(prev => ({
      ...prev,
      selectedSlot: slot,
    }));
  };

  const setBookingNotes = (notes: string) => {
    setBookingState(prev => ({
      ...prev,
      bookingNotes: notes,
    }));
  };

  const resetBookingState = () => {
    setBookingState({
      isModalOpen: false,
      currentStep: 'select-slot',
      selectedSlot: null,
      bookingNotes: '',
      sellerId: null,
      sellerName: null,
      consultationSettings: null,
    });
    localStorage.removeItem(STORAGE_KEY);
  };

  const value: BookingContextType = {
    bookingState,
    openBookingModal,
    closeBookingModal,
    setCurrentStep,
    setSelectedSlot,
    setBookingNotes,
    resetBookingState,
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
} 