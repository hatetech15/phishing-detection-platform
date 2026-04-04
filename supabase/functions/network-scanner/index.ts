import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function parseIPRange(input: string): string[] {
  const ips: string[] = [];
  const trimmed = input.trim();

  // CIDR notation (e.g., 192.168.1.0/24)
  const cidrMatch = trimmed.match(/^(\d+\.\d+\.\d+\.\d+)\/(\d+)$/);
  if (cidrMatch) {
    const baseIP = cidrMatch[1].split('.').map(Number);
    const prefix = parseInt(cidrMatch[2]);
    const hostBits = 32 - prefix;
    const numHosts = Math.min(Math.pow(2, hostBits), 256); // cap at 256

    const baseNum = (baseIP[0] << 24) | (baseIP[1] << 16) | (baseIP[2] << 8) | baseIP[3];
    const networkAddr = baseNum & (~0 << hostBits);

    for (let i = 1; i < numHosts - 1 && ips.length < 50; i++) {
      const ip = networkAddr + i;
      ips.push(`${(ip >> 24) & 0xFF}.${(ip >> 16) & 0xFF}.${(ip >> 8) & 0xFF}.${ip & 0xFF}`);
    }
    return ips;
  }

  // Range notation (e.g., 192.168.1.1-192.168.1.10)
  const rangeMatch = trimmed.match(/^(\d+\.\d+\.\d+\.)(\d+)-\1?(\d+)$/);
  if (rangeMatch) {
    const base = rangeMatch[1];
    const start = parseInt(rangeMatch[2]);
    const end = Math.min(parseInt(rangeMatch[3]), start + 49);
    for (let i = start; i <= end; i++) {
      ips.push(`${base}${i}`);
    }
    return ips;
  }

  // Single IP or hostname
  ips.push(trimmed);
  return ips;
}

async function checkHost(ip: string): Promise<any> {
  const result: any = { ip, alive: false, hostname: null, ports: [] };

  // DNS reverse lookup
  try {
    const resp = await fetch(`https://dns.google/resolve?name=${ip.split('.').reverse().join('.')}.in-addr.arpa&type=PTR`);
    const data = await resp.json();
    if (data.Answer && data.Answer.length > 0) {
      result.hostname = data.Answer[0].data.replace(/\.$/, '');
      result.alive = true;
    }
  } catch { /* ignore */ }

  // Check common ports via HTTP/HTTPS
  const commonPorts = [80, 443, 8080, 8443];
  for (const port of commonPorts) {
    const protocol = port === 443 || port === 8443 ? 'https' : 'http';
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);
      const resp = await fetch(`${protocol}://${ip}:${port}`, {
        signal: controller.signal,
        redirect: 'manual',
      });
      clearTimeout(timeout);
      result.ports.push({ port, status: 'open', protocol });
      result.alive = true;
      await resp.text();
    } catch {
      // Port closed or filtered
    }
  }

  // DNS forward lookup for hostname
  if (!result.hostname) {
    try {
      const resp = await fetch(`https://dns.google/resolve?name=${ip}&type=A`);
      const data = await resp.json();
      if (data.Answer && data.Answer.length > 0) {
        result.alive = true;
      }
    } catch { /* ignore */ }
  }

  return result;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { input } = await req.json();
    if (!input || typeof input !== 'string') {
      return new Response(JSON.stringify({ error: 'IP range or subnet is required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const ips = parseIPRange(input);
    const results = [];
    const batchSize = 5;

    for (let i = 0; i < ips.length; i += batchSize) {
      const batch = ips.slice(i, i + batchSize);
      const checks = await Promise.all(batch.map(checkHost));
      results.push(...checks);
    }

    const liveHosts = results.filter(r => r.alive);
    const openPorts = results.reduce((sum, r) => sum + r.ports.length, 0);

    return new Response(JSON.stringify({
      input,
      scannedIPs: results.length,
      liveHosts: liveHosts.length,
      totalOpenPorts: openPorts,
      results,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
