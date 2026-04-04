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
    const { url } = await req.json();
    if (!url || typeof url !== 'string') {
      return new Response(JSON.stringify({ error: 'URL is required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const URLSCAN_API_KEY = Deno.env.get('URLSCAN_API_KEY');
    if (!URLSCAN_API_KEY) {
      return new Response(JSON.stringify({ error: 'URLScan API key not configured. Please add URLSCAN_API_KEY secret.' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Submit scan
    const submitResp = await fetch('https://urlscan.io/api/v1/scan/', {
      method: 'POST',
      headers: {
        'API-Key': URLSCAN_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url, visibility: 'public' }),
    });

    if (!submitResp.ok) {
      const text = await submitResp.text();
      return new Response(JSON.stringify({ error: `URLScan submit error: ${submitResp.status} ${text}` }), {
        status: submitResp.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const submitData = await submitResp.json();
    const resultUrl = submitData.api;
    const uuid = submitData.uuid;

    // Poll for results (urlscan takes time)
    let resultData = null;
    for (let attempt = 0; attempt < 12; attempt++) {
      await new Promise(r => setTimeout(r, 5000));
      try {
        const resultResp = await fetch(resultUrl);
        if (resultResp.ok) {
          resultData = await resultResp.json();
          break;
        }
        await resultResp.text();
      } catch {
        // retry
      }
    }

    if (!resultData) {
      return new Response(JSON.stringify({
        uuid,
        status: 'pending',
        message: 'Scan submitted but results not yet available. Check back using the UUID.',
        resultUrl: `https://urlscan.io/result/${uuid}/`,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const page = resultData.page || {};
    const lists = resultData.lists || {};
    const stats = resultData.stats || {};
    const verdicts = resultData.verdicts || {};

    return new Response(JSON.stringify({
      uuid,
      url: page.url,
      domain: page.domain,
      ip: page.ip,
      country: page.country,
      title: page.title,
      server: page.server,
      screenshotUrl: `https://urlscan.io/screenshots/${uuid}.png`,
      technologies: lists.technologies || [],
      certificates: lists.certificates?.slice(0, 5) || [],
      riskIndicators: {
        malicious: verdicts.overall?.malicious || false,
        score: verdicts.overall?.score || 0,
        categories: verdicts.overall?.categories || [],
      },
      stats: {
        requests: stats.requests?.total || 0,
        uniqueIPs: stats.ips?.length || 0,
        uniqueDomains: stats.domains?.length || 0,
      },
      resultUrl: `https://urlscan.io/result/${uuid}/`,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
