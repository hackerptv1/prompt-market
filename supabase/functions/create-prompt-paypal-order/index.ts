import "jsr:@supabase/functions-js/edge-runtime.d.ts";

Deno.serve(async (req: Request) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
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
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  try {
    const { amount, promptDetails } = await req.json();

    console.log('Received request:', { amount, promptDetails });

    // Validate required fields
    if (!amount || amount <= 0) {
      return new Response(JSON.stringify({ error: 'Invalid amount' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    if (!promptDetails) {
      return new Response(JSON.stringify({ error: 'Prompt details required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Check PayPal environment variables
    const paypalClientId = Deno.env.get('PAYPAL_CLIENT_ID');
    const paypalClientSecret = Deno.env.get('PAYPAL_CLIENT_SECRET');
    const paypalBaseUrl = Deno.env.get('PAYPAL_BASE_URL') || 'https://api-m.sandbox.paypal.com';

    console.log('Environment check:', {
      hasClientId: !!paypalClientId,
      hasClientSecret: !!paypalClientSecret,
      paypalBaseUrl
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
    console.log('Getting PayPal access token...');
    const tokenResponse = await fetch(`${paypalBaseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${paypalClientId}:${paypalClientSecret}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('PayPal token error:', errorText);
      throw new Error(`Failed to get PayPal access token: ${tokenResponse.status} ${errorText}`);
    }

    const { access_token } = await tokenResponse.json();
    console.log('PayPal access token obtained');

    // Create PayPal order
    console.log('Creating PayPal order...');
    const orderResponse = await fetch(`${paypalBaseUrl}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: 'USD',
              value: amount.toString(),
            },
            description: `Prompt: ${promptDetails.title}`,
            custom_id: `prompt-${promptDetails.title}`,
            soft_descriptor: 'Prompt Purchase',
          },
        ],
        application_context: {
          return_url: `${Deno.env.get('FRONTEND_URL') || 'http://localhost:5173'}/payment/success`,
          cancel_url: `${Deno.env.get('FRONTEND_URL') || 'http://localhost:5173'}/payment/cancel`,
          shipping_preference: 'NO_SHIPPING',
        },
      }),
    });

    if (!orderResponse.ok) {
      const errorData = await orderResponse.json().catch(() => ({ message: 'Unknown error' }));
      console.error('PayPal order creation error:', errorData);
      throw new Error(errorData.message || `Failed to create PayPal order: ${orderResponse.status}`);
    }

    const orderData = await orderResponse.json();
    console.log('PayPal order created successfully:', orderData.id);

    return new Response(JSON.stringify({ 
      orderID: orderData.id,
      status: orderData.status,
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error('PayPal order creation error:', error);
    
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