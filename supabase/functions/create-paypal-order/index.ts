import "jsr:@supabase/functions-js/edge-runtime.d.ts";

Deno.serve(async (req: Request) => {
  console.log('=== PayPal Order Function Started ===');
  
  // Handle CORS
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  if (req.method !== 'POST') {
    console.log('Invalid method:', req.method);
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  try {
    console.log('Parsing request body...');
    const bodyText = await req.text();
    console.log('Raw request body:', bodyText);
    
    const { amount, consultationId, details } = JSON.parse(bodyText);

    console.log('Received consultation request:', { amount, consultationId, details });

    // Validate required fields
    if (!amount || amount <= 0) {
      console.log('Invalid amount:', amount);
      return new Response(JSON.stringify({ error: 'Invalid amount' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    if (!details) {
      console.log('Missing details');
      return new Response(JSON.stringify({ error: 'Consultation details required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Check PayPal environment variables
    console.log('Checking environment variables...');
    const paypalClientId = Deno.env.get('PAYPAL_CLIENT_ID');
    const paypalClientSecret = Deno.env.get('PAYPAL_CLIENT_SECRET');
    const paypalBaseUrl = Deno.env.get('PAYPAL_BASE_URL') || 'https://api-m.sandbox.paypal.com';

    console.log('Environment check:', {
      hasClientId: !!paypalClientId,
      hasClientSecret: !!paypalClientSecret,
      paypalBaseUrl,
      clientIdLength: paypalClientId?.length || 0,
      clientSecretLength: paypalClientSecret?.length || 0
    });

    if (!paypalClientId || !paypalClientSecret) {
      console.error('PayPal credentials missing:', {
        hasClientId: !!paypalClientId,
        hasClientSecret: !!paypalClientSecret
      });
      
      return new Response(JSON.stringify({ 
        error: 'PayPal configuration missing. Please check environment variables.',
        details: 'PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET must be set in Supabase environment variables.'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Get PayPal access token
    console.log('Getting PayPal access token from:', `${paypalBaseUrl}/v1/oauth2/token`);
    const tokenResponse = await fetch(`${paypalBaseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${paypalClientId}:${paypalClientSecret}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    console.log('Token response status:', tokenResponse.status);
    console.log('Token response headers:', Object.fromEntries(tokenResponse.headers.entries()));

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('PayPal token error:', errorText);
      throw new Error(`Failed to get PayPal access token: ${tokenResponse.status} ${errorText}`);
    }

    const tokenData = await tokenResponse.json();
    console.log('PayPal access token obtained, expires in:', tokenData.expires_in);

    // Create PayPal order
    console.log('Creating PayPal order...');
    const orderPayload = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: amount.toString(),
          },
          description: `Consultation with ${details.sellerName}`,
          custom_id: consultationId || 'consultation',
          soft_descriptor: 'Consultation',
          // Mark as digital product
          items: [
            {
              name: `Consultation with ${details.sellerName}`,
              description: 'Digital consultation service',
              quantity: '1',
              unit_amount: {
                currency_code: 'USD',
                value: amount.toString(),
              },
              category: 'DIGITAL_GOODS',
            },
          ],
        },
      ],
      application_context: {
        return_url: `${Deno.env.get('FRONTEND_URL') || 'http://localhost:5173'}/payment/success`,
        cancel_url: `${Deno.env.get('FRONTEND_URL') || 'http://localhost:5173'}/payment/cancel`,
        shipping_preference: 'NO_SHIPPING',
      },
    };

    console.log('Order payload:', JSON.stringify(orderPayload, null, 2));

    const orderResponse = await fetch(`${paypalBaseUrl}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderPayload),
    });

    console.log('Order response status:', orderResponse.status);
    console.log('Order response headers:', Object.fromEntries(orderResponse.headers.entries()));

    if (!orderResponse.ok) {
      const errorData = await orderResponse.json().catch(() => ({ message: 'Unknown error' }));
      console.error('PayPal order creation error:', errorData);
      throw new Error(errorData.message || `Failed to create PayPal order: ${orderResponse.status}`);
    }

    const orderData = await orderResponse.json();
    console.log('PayPal order created successfully:', orderData.id);

    const response = {
      orderID: orderData.id,
      status: orderData.status,
    };

    console.log('Returning response:', response);
    console.log('=== PayPal Order Function Completed Successfully ===');

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error('=== PayPal Order Function Error ===');
    console.error('Error type:', typeof error);
    console.error('Error name:', (error as any)?.name);
    console.error('Error message:', (error as any)?.message);
    console.error('Error stack:', (error as any)?.stack);
    console.error('Full error object:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Failed to create PayPal order',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}); 