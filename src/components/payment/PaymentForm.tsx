import React, { useState, useEffect } from 'react';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import { CreditCard, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { usePayment } from '../../contexts/PaymentContext';

interface PaymentFormProps {
  amount: number;
  consultationDetails: {
    sellerName: string;
    date: string;
    time: string;
    duration: number;
  };
  onPaymentSuccess: () => void;
  onPaymentError: (error: string) => void;
  onCancel: () => void;
  disabled?: boolean;
}

export function PaymentForm({
  amount,
  consultationDetails,
  onPaymentSuccess,
  onPaymentError,
  onCancel,
  disabled = false
}: PaymentFormProps) {
  const { createPayment, isLoading, error, clearError } = usePayment();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  useEffect(() => {
    if (error) {
      setPaymentError(error);
    }
  }, [error]);

  const handlePaymentSuccess = async (orderID: string) => {
    setIsProcessing(true);
    setPaymentError(null);
    
    try {
      // Payment was successful, call the parent success handler
      onPaymentSuccess();
    } catch (error) {
      console.error('Payment success handling error:', error);
      setPaymentError('Payment completed but there was an issue processing your booking. Please contact support.');
      setIsProcessing(false);
    }
  };

  const handlePaymentError = (error: any) => {
    console.error('PayPal payment error:', error);
    const errorMessage = error?.details?.[0]?.description || 'Payment failed. Please try again.';
    setPaymentError(errorMessage);
    onPaymentError(errorMessage);
    setIsProcessing(false);
  };

  const formatDate = (date: string) => {
    const [year, month, day] = date.split('-').map(Number);
    const localDate = new Date(year, month - 1, day);
    
    return localDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const paypalOptions = {
    clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID ?? 'test',
    currency: 'USD',
    intent: 'capture' as const,
  };

  return (
    <div className="max-w-md mx-auto">
      {/* Consultation Summary */}
      <div className="bg-blue-50 rounded-lg p-4 mb-6">
        <h3 className="font-medium text-blue-900 mb-3">Consultation Summary</h3>
        <div className="space-y-2 text-sm text-blue-800">
          <div><strong>Seller:</strong> {consultationDetails.sellerName}</div>
          <div><strong>Date:</strong> {formatDate(consultationDetails.date)}</div>
          <div><strong>Time:</strong> {formatTime(consultationDetails.time)}</div>
          <div><strong>Duration:</strong> {consultationDetails.duration} minutes</div>
          <div className="text-lg font-bold text-blue-900 mt-3">
            Total: ${amount.toFixed(2)}
          </div>
        </div>
      </div>

      {/* PayPal Payment */}
      <div className="space-y-6">
        {/* Security Notice */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Lock className="w-4 h-4" />
          <span>Your payment information is secure and encrypted</span>
        </div>

        {/* Error Display */}
        {paymentError && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <AlertCircle className="w-4 h-4" />
            <span>{paymentError}</span>
          </div>
        )}

        {/* PayPal Buttons */}
        <PayPalScriptProvider options={paypalOptions}>
          <PayPalButtons
            style={{ layout: 'vertical' }}
            createOrder={async (data, actions) => {
              try {
                const orderID = await createPayment(amount, 'consultation', consultationDetails);
                if (!orderID) {
                  throw new Error('Failed to create payment order');
                }
                return orderID;
              } catch (error) {
                console.error('Error creating order:', error);
                throw error;
              }
            }}
            onApprove={async (data, actions) => {
              try {
                // Capture the order
                const order = await actions.order?.capture();
                if (order?.status === 'COMPLETED' && order.id) {
                  await handlePaymentSuccess(order.id);
                } else {
                  throw new Error('Payment was not completed');
                }
              } catch (error) {
                console.error('Payment capture error:', error);
                handlePaymentError(error);
              }
            }}
            onError={(err) => {
              handlePaymentError(err);
            }}
            onCancel={() => {
              onCancel();
            }}
            disabled={disabled || isProcessing}
          />
        </PayPalScriptProvider>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isProcessing}
            className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
} 