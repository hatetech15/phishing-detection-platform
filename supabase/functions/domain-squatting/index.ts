import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function generatePermutations(domain: string): string[] {
  const parts = domain.split('.');
  const name = parts[0];
  const tld = parts.slice(1).join('.');
  const perms: string[] = [];

  // Homoglyph substitutions
  const homoglyphs: Record<string, string[]> = {
    'a': ['@', '4', 'à', 'á', 'â', 'ã', 'ä'],
    'e': ['3', 'è', 'é', 'ê', 'ë'],
    'i': ['1', '!', 'ì', 'í', 'î', 'ï', 'l'],
    'o': ['0', 'ò', 'ó', 'ô', 'õ', 'ö'],
    'l': ['1', 'I', '|'],
    's': ['5', '$'],
    'g': ['9', 'q'],
    't': ['7', '+'],
  };

  // Character omission
  for (let i = 0; i < name.length; i++) {
    const p = name.slice(0, i) + name.slice(i + 1);
    if (p.length > 0) perms.push(`${p}.${tld}`);
  }

  // Character swap (adjacent)
  for (let i = 0; i < name.length - 1; i++) {
    const arr = name.split('');
    [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
    perms.push(`${arr.join('')}.${tld}`);
  }

  // Character duplication
  for (let i = 0; i < name.length; i++) {
    const p = name.slice(0, i) + name[i] + name.slice(i);
    perms.push(`${p}.${tld}`);
  }

  // Homoglyph replacement
  for (let i = 0; i < name.length; i++) {
    const ch = name[i].toLowerCase();
    if (homoglyphs[ch]) {
      for (const g of homoglyphs[ch].slice(0, 2)) {
        const p = name.slice(0, i) + g + name.slice(i + 1);
        perms.push(`${p}.${tld}`);
      }
    }
  }

  // TLD variations
  const altTlds = ['com', 'net', 'org', 'co', 'io', 'info', 'biz', 'xyz'];
  for (const t of altTlds) {
    if (t !== tld) perms.push(`${name}.${t}`);
  }

  // Hyphenation
  for (let i = 1; i < name.length; i++) {
    perms.push(`${name.slice(0, i)}-${name.slice(i)}.${tld}`);
  }

  return [...new Set(perms)].slice(0, 50);
}

async function checkDomain(domain: string): Promise<{ registered: boolean; ip?: string }> {
  try {
    const resp = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=A`);
    const data = await resp.json();
    if (data.Answer && data.Answer.length > 0) {
      return { registered: true, ip: data.Answer[0].data };
    }
    return { registered: false };
  } catch {
    return { registered: false };
  }
}

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

    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '').toLowerCase();
    const permutations = generatePermutations(cleanDomain);

    // Check DNS for each permutation (batch with concurrency limit)
    const results = [];
    const batchSize = 10;
    for (let i = 0; i < permutations.length; i += batchSize) {
      const batch = permutations.slice(i, i + batchSize);
      const checks = await Promise.all(
        batch.map(async (perm) => {
          const check = await checkDomain(perm);
          return {
            domain: perm,
            registered: check.registered,
            ip: check.ip || null,
            risk: check.registered ? 'high' : 'low',
          };
        })
      );
      results.push(...checks);
    }

    const registeredCount = results.filter(r => r.registered).length;
    const riskScore = Math.min(100, Math.round((registeredCount / results.length) * 100));

    return new Response(JSON.stringify({
      original: cleanDomain,
      permutations: results,
      totalChecked: results.length,
      registeredCount,
      riskScore,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
