import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';
import { PromptPaymentForm } from '../payment/PromptPaymentForm';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../utils/supabase';

interface PromptPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  prompt: {
    id: string;
    title: string;
    description: string;
    price: number;
    ai_platform: string;
    product_type: string;
    seller_id: string;
  };
  seller: {
    id: string;
    name: string;
    email: string;
  };
}

export function PromptPurchaseModal({ 
  isOpen, 
  onClose, 
  prompt, 
  seller 
}: PromptPurchaseModalProps) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<'payment' | 'success'>('payment');
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset to payment step when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep('payment');
      setError(null);
      setIsPaymentProcessing(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePaymentSuccess = async (orderID?: string) => {
    if (!user) return;

    setIsPaymentProcessing(true);
    
    try {
      console.log('Payment successful, creating purchase record for prompt:', prompt.id);

      // SECURITY: Only create purchase record if we have a valid PayPal order ID
      if (!orderID) {
        throw new Error('Invalid payment: No order ID provided');
      }

      // Create the prompt purchase record with the PayPal order ID
      const { data: purchaseData, error: purchaseError } = await supabase
        .from('prompt_purchases')
        .insert({
          prompt_id: prompt.id,
          buyer_id: user.id,
          seller_id: seller.id,
          payment_status: 'paid',
          payment_amount: prompt.price,
          payment_date: new Date().toISOString(),
          paypal_order_id: orderID
        })
        .select()
        .single();

      console.log('Purchase created:', purchaseData);
      console.log('Purchase error:', purchaseError);

      if (purchaseError) throw purchaseError;

      // Update seller's total sales using the database function
      const { error: incrementError } = await supabase
        .rpc('increment_seller_sales', { seller_uuid: seller.id });

      if (incrementError) {
        console.error('Error incrementing seller sales:', incrementError);
      } else {
        console.log('Successfully incremented seller sales for:', seller.id);
      }

      setCurrentStep('success');
    } catch (error) {
      console.error('Error creating purchase:', error);
      setError('Failed to complete purchase. Please contact support.');
    } finally {
      setIsPaymentProcessing(false);
    }
  };

  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage);
    setIsPaymentProcessing(false);
  };

  const handleCancel = () => {
    setCurrentStep('payment');
    setError(null);
    onClose();
  };

  const handleClose = () => {
    if (currentStep === 'success') {
      // Redirect to dashboard or purchased prompts
      window.location.href = '/dashboard';
    } else {
      handleCancel();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {currentStep === 'payment' && 'Purchase Prompt'}
            {currentStep === 'success' && 'Purchase Complete!'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {currentStep === 'payment' && (
            <PromptPaymentForm
              amount={prompt.price}
              promptDetails={{
                title: prompt.title,
                sellerName: seller.name,
                description: prompt.description,
                aiPlatform: prompt.ai_platform,
                productType: prompt.product_type
              }}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentError={handlePaymentError}
              onCancel={handleCancel}
              disabled={isPaymentProcessing}
            />
          )}

          {currentStep === 'success' && (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Purchase Successful!
              </h3>
              <p className="text-gray-600 mb-6">
                You now have access to "{prompt.title}". You can find it in your purchased prompts.
              </p>
              <button
                onClick={handleClose}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 