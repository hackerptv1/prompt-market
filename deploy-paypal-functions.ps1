# Deploy PayPal payment functions to Supabase
Write-Host "🚀 Deploying PayPal payment functions..." -ForegroundColor Green

# Deploy create-paypal-order function
Write-Host "Deploying create-paypal-order..." -ForegroundColor Yellow
supabase functions deploy create-paypal-order

# Deploy create-prompt-paypal-order function  
Write-Host "Deploying create-prompt-paypal-order..." -ForegroundColor Yellow
supabase functions deploy create-prompt-paypal-order

# Deploy test-env function for debugging
Write-Host "Deploying test-env..." -ForegroundColor Yellow
supabase functions deploy test-env

Write-Host "✅ PayPal functions deployed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Configure environment variables in Supabase Dashboard" -ForegroundColor White
Write-Host "2. Add VITE_PAYPAL_CLIENT_ID to Vercel environment variables" -ForegroundColor White
Write-Host "3. Test the payment flow" -ForegroundColor White
