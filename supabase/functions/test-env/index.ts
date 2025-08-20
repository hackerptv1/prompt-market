import "jsr:@supabase/functions-js/edge-runtime.d.ts";

Deno.serve(async (req: Request) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  try {
    // Check environment variables
    const paypalClientId = Deno.env.get('PAYPAL_CLIENT_ID');
    const paypalClientSecret = Deno.env.get('PAYPAL_CLIENT_SECRET');
    const paypalBaseUrl = Deno.env.get('PAYPAL_BASE_URL');
    const frontendUrl = Deno.env.get('FRONTEND_URL');

    const envStatus = {
      hasPaypalClientId: !!paypalClientId,
      hasPaypalClientSecret: !!paypalClientSecret,
      paypalBaseUrl: paypalBaseUrl || 'not set',
      frontendUrl: frontendUrl || 'not set',
      paypalClientIdLength: paypalClientId ? paypalClientId.length : 0,
      paypalClientSecretLength: paypalClientSecret ? paypalClientSecret.length : 0
    };

    console.log('Environment variables status:', envStatus);

    return new Response(JSON.stringify({
      message: 'Environment variables test',
      status: envStatus,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error('Test function error:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Test function failed',
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