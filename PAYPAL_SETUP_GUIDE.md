# 🚀 PayPal Integration Setup Guide

This guide will help you set up PayPal payments for PromptMarket.

## 📋 Prerequisites

- PayPal business account
- Supabase project
- Vercel deployment

## 🔧 Step 1: PayPal Developer Account Setup

### 1.1 Create PayPal Developer Account
1. Go to [PayPal Developer Portal](https://developer.paypal.com/)
2. Sign in with your PayPal business account
3. If you don't have a business account, create one at [PayPal Business](https://www.paypal.com/business)

### 1.2 Create New Application
1. Click "Create App" in the developer portal
2. Fill in the details:
   - **App Name**: `PromptMarket Payments`
   - **Merchant**: Select your business account
   - **Features**: Check "Accept payments"
3. Click "Create App"

### 1.3 Get Credentials
After creating the app, you'll see:
- **Client ID** (starts with `Ae...` or `AZ...`)
- **Client Secret** (starts with `E...`)

**⚠️ Important**: Copy these values - you'll need them for configuration.

### 1.4 Choose Environment
- **Sandbox** (for testing) - Use this first
- **Live** (for production) - Switch to this after testing

## 🔧 Step 2: Configure Supabase Environment Variables

### 2.1 Access Supabase Dashboard
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project

### 2.2 Add Edge Function Environment Variables
1. Go to "Edge Functions" in the sidebar
2. Click "Environment Variables"
3. Add these variables:

```
PAYPAL_CLIENT_ID=your_client_id_here
PAYPAL_CLIENT_SECRET=your_client_secret_here
PAYPAL_BASE_URL=https://api-m.sandbox.paypal.com
FRONTEND_URL=https://prompt-market-flame.vercel.app
```

**Note**: For production, change `PAYPAL_BASE_URL` to `https://api-m.paypal.com`

## 🔧 Step 3: Configure Vercel Environment Variables

### 3.1 Access Vercel Dashboard
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your `prompt-market-flame` project

### 3.2 Add Environment Variables
1. Go to "Settings" → "Environment Variables"
2. Add these variables:

```
VITE_PAYPAL_CLIENT_ID=your_client_id_here
VITE_SUPABASE_URL=https://yopfhezzxygqzqnayrss.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 3.3 Redeploy
After adding environment variables, redeploy your project:
1. Go to "Deployments" tab
2. Click "Redeploy" on the latest deployment

## 🔧 Step 4: Deploy Edge Functions

### 4.1 Using PowerShell Script (Windows)
```powershell
.\deploy-paypal-functions.ps1
```

### 4.2 Manual Deployment
```bash
supabase functions deploy create-paypal-order
supabase functions deploy create-prompt-paypal-order
supabase functions deploy test-env
```

## 🧪 Step 5: Test the Integration

### 5.1 Test Environment Variables
1. Go to your deployed site
2. Try to purchase a prompt
3. You should see PayPal payment buttons (not the "not configured" message)

### 5.2 Test Payment Flow
1. Click "Buy Now" on a prompt
2. Click PayPal payment button
3. Use PayPal sandbox test account to complete payment
4. Verify you get access to the prompt files

### 5.3 Create PayPal Sandbox Test Account
1. Go to [PayPal Sandbox](https://developer.paypal.com/developer/accounts/)
2. Click "Create Account"
3. Choose "Personal" or "Business"
4. Use this account for testing payments

## 🔧 Step 6: Production Setup

### 6.1 Switch to Live Environment
1. In PayPal Developer Portal, create a new app for "Live" environment
2. Update Supabase environment variables:
   ```
   PAYPAL_BASE_URL=https://api-m.paypal.com
   ```
3. Update Vercel environment variables with live Client ID
4. Redeploy both Supabase functions and Vercel app

### 6.2 Verify Production
1. Test with real PayPal account
2. Verify payments are received
3. Check payment records in database

## 🚨 Troubleshooting

### Common Issues:

1. **"Payment System Not Configured" message**
   - Check if `VITE_PAYPAL_CLIENT_ID` is set in Vercel
   - Redeploy Vercel app after adding environment variables

2. **"PayPal configuration missing" error**
   - Check if Supabase environment variables are set
   - Redeploy Supabase functions after adding variables

3. **Payment fails with "Invalid amount"**
   - Check if amount is greater than 0
   - Verify currency is USD

4. **"Object not found" error**
   - Check if Supabase functions are deployed
   - Verify function URLs are correct

### Debug Commands:
```bash
# Test Supabase environment variables
curl https://your-project.supabase.co/functions/v1/test-env

# Check function logs
supabase functions logs create-paypal-order
```

## 📞 Support

If you encounter issues:
1. Check the browser console for errors
2. Check Supabase function logs
3. Verify all environment variables are set correctly
4. Test with PayPal sandbox first

## 🎉 Success!

Once everything is working:
- Users can purchase prompts with PayPal
- You receive payments in your PayPal account
- Payment records are stored in the database
- File access is properly controlled

---

**Remember**: Always test in sandbox mode first before going live!
