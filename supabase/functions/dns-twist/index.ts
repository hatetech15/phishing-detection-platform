import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function generateTwists(domain: string): { type: string; domain: string }[] {
  const parts = domain.split('.');
  const name = parts[0];
  const tld = parts.slice(1).join('.');
  const twists: { type: string; domain: string }[] = [];

  // Bitsquatting
  for (let i = 0; i < name.length; i++) {
    const c = name.charCodeAt(i);
    for (let bit = 1; bit <= 128; bit <<= 1) {
      const nc = c ^ bit;
      if (nc >= 48 && nc <= 122) {
        const p = name.slice(0, i) + String.fromCharCode(nc) + name.slice(i + 1);
        if (p !== name) twists.push({ type: 'bitsquatting', domain: `${p}.${tld}` });
      }
    }
  }

  // Homoglyph
  const glyphs: Record<string, string[]> = {
    'a': ['à', 'á', 'â', 'ã', 'ä', 'å', 'ɑ'], 'c': ['ç', 'ć', 'ĉ'],
    'e': ['è', 'é', 'ê', 'ë', 'ē'], 'g': ['ğ', 'ĝ'],
    'i': ['ì', 'í', 'î', 'ï', 'ı'], 'n': ['ñ', 'ń'],
    'o': ['ò', 'ó', 'ô', 'õ', 'ö', 'ø'], 's': ['ş', 'ś', 'š'],
    'u': ['ù', 'ú', 'û', 'ü'], 'y': ['ý', 'ÿ'], 'z': ['ž', 'ź'],
  };
  for (let i = 0; i < name.length; i++) {
    if (glyphs[name[i]]) {
      for (const g of glyphs[name[i]].slice(0, 2)) {
        twists.push({ type: 'homoglyph', domain: `${name.slice(0, i)}${g}${name.slice(i + 1)}.${tld}` });
      }
    }
  }

  // Insertion
  const keys = 'qwertyuiopasdfghjklzxcvbnm';
  for (let i = 0; i <= name.length; i++) {
    for (const k of keys.slice(0, 5)) {
      twists.push({ type: 'insertion', domain: `${name.slice(0, i)}${k}${name.slice(i)}.${tld}` });
    }
  }

  // Omission
  for (let i = 0; i < name.length; i++) {
    const p = name.slice(0, i) + name.slice(i + 1);
    if (p) twists.push({ type: 'omission', domain: `${p}.${tld}` });
  }

  // Repetition
  for (let i = 0; i < name.length; i++) {
    twists.push({ type: 'repetition', domain: `${name.slice(0, i)}${name[i]}${name.slice(i)}.${tld}` });
  }

  // Transposition
  for (let i = 0; i < name.length - 1; i++) {
    const arr = name.split('');
    [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
    twists.push({ type: 'transposition', domain: `${arr.join('')}.${tld}` });
  }

  // Vowel swap
  const vowels = 'aeiou';
  for (let i = 0; i < name.length; i++) {
    if (vowels.includes(name[i])) {
      for (const v of vowels) {
        if (v !== name[i]) {
          twists.push({ type: 'vowel-swap', domain: `${name.slice(0, i)}${v}${name.slice(i + 1)}.${tld}` });
        }
      }
    }
  }

  // Addition
  for (const k of keys) {
    twists.push({ type: 'addition', domain: `${name}${k}.${tld}` });
  }

  // Subdomain
  for (let i = 1; i < name.length; i++) {
    if (name[i] !== '-' && name[i - 1] !== '-') {
      twists.push({ type: 'subdomain', domain: `${name.slice(0, i)}.${name.slice(i)}.${tld}` });
    }
  }

  const unique = [...new Map(twists.map(t => [t.domain, t])).values()];
  return unique.slice(0, 60);
}

async function resolveDomain(domain: string): Promise<{ ip?: string; registered: boolean; mx?: boolean }> {
  try {
    const [aResp, mxResp] = await Promise.all([
      fetch(`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=A`),
      fetch(`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=MX`),
    ]);
    const aData = await aResp.json();
    const mxData = await mxResp.json();
    const hasA = aData.Answer && aData.Answer.length > 0;
    const hasMX = mxData.Answer && mxData.Answer.length > 0;
    return {
      registered: hasA || hasMX,
      ip: hasA ? aData.Answer[0].data : undefined,
      mx: hasMX,
    };
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
    const twists = generateTwists(cleanDomain);

    const results = [];
    const batchSize = 10;
    for (let i = 0; i < twists.length; i += batchSize) {
      const batch = twists.slice(i, i + batchSize);
      const resolved = await Promise.all(
        batch.map(async (twist) => {
          const dns = await resolveDomain(twist.domain);
          return {
            ...twist,
            registered: dns.registered,
            ip: dns.ip || null,
            hasMX: dns.mx || false,
            flag: dns.registered ? (dns.mx ? 'phishing-risk' : 'registered') : 'available',
          };
        })
      );
      results.push(...resolved);
    }

    const registered = results.filter(r => r.registered).length;
    const phishingRisk = results.filter(r => r.hasMX).length;

    return new Response(JSON.stringify({
      original: cleanDomain,
      twists: results,
      totalGenerated: results.length,
      registeredCount: registered,
      phishingRiskCount: phishingRisk,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
