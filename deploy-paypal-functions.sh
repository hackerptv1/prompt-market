#!/bin/bash

# Deploy PayPal payment functions to Supabase
echo "🚀 Deploying PayPal payment functions..."

# Deploy create-paypal-order function
echo "Deploying create-paypal-order..."
supabase functions deploy create-paypal-order

# Deploy create-prompt-paypal-order function  
echo "Deploying create-prompt-paypal-order..."
supabase functions deploy create-prompt-paypal-order

# Deploy test-env function for debugging
echo "Deploying test-env..."
supabase functions deploy test-env

echo "✅ PayPal functions deployed successfully!"
echo ""
echo "Next steps:"
echo "1. Configure environment variables in Supabase Dashboard"
echo "2. Add VITE_PAYPAL_CLIENT_ID to Vercel environment variables"
echo "3. Test the payment flow"
