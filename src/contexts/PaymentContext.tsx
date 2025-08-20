import React, { createContext, useContext, useState } from 'react';

interface PaymentContextType {
  isLoading: boolean;
  error: string | null;
  createPayment: (amount: number, consultationId: string, details: any) => Promise<string | null>;
  createPromptPayment: (amount: number, promptDetails: any) => Promise<string | null>;
  clearError: () => void;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export function PaymentProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPayment = async (amount: number, consultationId: string, details: any): Promise<string | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://yopfhezzxygqzqnayrss.supabase.co';
      const response = await fetch(`${supabaseUrl}/functions/v1/create-paypal-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          amount: amount,
          consultationId,
          details,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create PayPal order');
      }

      const { orderID } = await response.json();
      return orderID;
    } catch (err) {
      console.error('Error creating PayPal order:', err);
      setError('Failed to initialize payment');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const createPromptPayment = async (amount: number, promptDetails: any): Promise<string | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://yopfhezzxygqzqnayrss.supabase.co';
      const response = await fetch(`${supabaseUrl}/functions/v1/create-prompt-paypal-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          amount: amount,
          promptDetails,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create PayPal order');
      }

      const { orderID } = await response.json();
      return orderID;
    } catch (err) {
      console.error('Error creating PayPal order:', err);
      setError('Failed to initialize payment');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value: PaymentContextType = {
    isLoading,
    error,
    createPayment,
    createPromptPayment,
    clearError,
  };

  return (
    <PaymentContext.Provider value={value}>
      {children}
    </PaymentContext.Provider>
  );
}

export function usePayment() {
  const context = useContext(PaymentContext);
  if (context === undefined) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
} 