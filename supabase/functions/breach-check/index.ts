import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { input, type } = await req.json();
    if (!input || typeof input !== 'string') {
      return new Response(JSON.stringify({ error: 'Input (email or domain) is required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const HIBP_API_KEY = Deno.env.get('HIBP_API_KEY');
    if (!HIBP_API_KEY) {
      return new Response(JSON.stringify({ error: 'HIBP API key not configured. Please add HIBP_API_KEY secret.' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const isEmail = input.includes('@');
    const endpoint = isEmail
      ? `https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(input)}?truncateResponse=false`
      : `https://haveibeenpwned.com/api/v3/breaches?domain=${encodeURIComponent(input)}`;

    const resp = await fetch(endpoint, {
      headers: {
        'hibp-api-key': HIBP_API_KEY,
        'user-agent': 'PhishVeda-SecurityScanner',
      },
    });

    if (resp.status === 404) {
      return new Response(JSON.stringify({
        input,
        type: isEmail ? 'email' : 'domain',
        breaches: [],
        breachCount: 0,
        message: 'No breaches found',
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (resp.status === 429) {
      return new Response(JSON.stringify({ error: 'Rate limited. Please wait and try again.' }), {
        status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!resp.ok) {
      const text = await resp.text();
      return new Response(JSON.stringify({ error: `HIBP API error: ${resp.status} ${text}` }), {
        status: resp.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const breaches = await resp.json();

    const formattedBreaches = breaches.map((b: any) => ({
      name: b.Name,
      title: b.Title,
      domain: b.Domain,
      breachDate: b.BreachDate,
      addedDate: b.AddedDate,
      pwnCount: b.PwnCount,
      description: b.Description?.replace(/<[^>]*>/g, ''),
      dataClasses: b.DataClasses,
      isVerified: b.IsVerified,
      isSensitive: b.IsSensitive,
    }));

    return new Response(JSON.stringify({
      input,
      type: isEmail ? 'email' : 'domain',
      breaches: formattedBreaches,
      breachCount: formattedBreaches.length,
      totalPwned: formattedBreaches.reduce((sum: number, b: any) => sum + (b.pwnCount || 0), 0),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
