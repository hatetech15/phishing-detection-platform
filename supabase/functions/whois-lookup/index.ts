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
    const { domain } = await req.json();
    if (!domain || typeof domain !== 'string') {
      return new Response(JSON.stringify({ error: 'Domain is required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const WHOIS_API_KEY = Deno.env.get('WHOIS_API_KEY');
    if (!WHOIS_API_KEY) {
      return new Response(JSON.stringify({ error: 'WHOIS API key not configured. Please add WHOIS_API_KEY secret.' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '').toLowerCase();

    const resp = await fetch(
      `https://www.whoisxmlapi.com/whoisserver/WhoisService?apiKey=${WHOIS_API_KEY}&domainName=${encodeURIComponent(cleanDomain)}&outputFormat=JSON`
    );

    if (!resp.ok) {
      const text = await resp.text();
      return new Response(JSON.stringify({ error: `WHOIS API error: ${resp.status} ${text}` }), {
        status: resp.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await resp.json();
    const record = data.WhoisRecord || {};

    const result = {
      domain: cleanDomain,
      registrar: record.registrarName || record.registrant?.organization || 'Unknown',
      createdDate: record.createdDate || record.registryData?.createdDate || null,
      updatedDate: record.updatedDate || record.registryData?.updatedDate || null,
      expiresDate: record.expiresDate || record.registryData?.expiresDate || null,
      status: record.status || record.registryData?.status || null,
      nameServers: record.nameServers?.hostNames || [],
      registrant: {
        name: record.registrant?.name || 'REDACTED',
        organization: record.registrant?.organization || 'REDACTED',
        country: record.registrant?.country || record.registrant?.countryCode || 'Unknown',
        state: record.registrant?.state || 'REDACTED',
        email: record.contactEmail || 'REDACTED',
      },
      domainAge: null as string | null,
      rawText: record.rawText?.substring(0, 2000) || null,
    };

    // Calculate domain age
    if (result.createdDate) {
      const created = new Date(result.createdDate);
      const now = new Date();
      const years = Math.floor((now.getTime() - created.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      const months = Math.floor(((now.getTime() - created.getTime()) % (365.25 * 24 * 60 * 60 * 1000)) / (30.44 * 24 * 60 * 60 * 1000));
      result.domainAge = `${years} years, ${months} months`;
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
