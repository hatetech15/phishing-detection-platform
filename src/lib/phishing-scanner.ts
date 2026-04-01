export interface ThreatIndicator {
  label: string;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
}

export interface DomainInfo {
  domain: string;
  tld: string;
  subdomain: string | null;
  protocol: string;
  pathDepth: number;
  hasQueryParams: boolean;
}

export interface ScanResult {
  url: string;
  riskScore: number; // 0-100
  riskLevel: "safe" | "low" | "medium" | "high" | "significant";
  domainInfo: DomainInfo;
  threats: ThreatIndicator[];
  scanTime: number; // ms
}

const SUSPICIOUS_TLDS = [
  "tk", "ml", "ga", "cf", "gq", "xyz", "top", "buzz", "club",
  "work", "click", "link", "info", "surf", "rest", "icu", "cam",
];

const PHISHING_KEYWORDS = [
  "login", "signin", "sign-in", "verify", "secure", "account",
  "update", "confirm", "bank", "paypal", "apple", "microsoft",
  "google", "amazon", "netflix", "facebook", "instagram", "wallet",
  "password", "credential", "suspend", "locked", "urgent", "alert",
];

const TRUSTED_DOMAINS = [
  "google.com", "youtube.com", "facebook.com", "amazon.com",
  "apple.com", "microsoft.com", "github.com", "stackoverflow.com",
  "wikipedia.org", "twitter.com", "x.com", "linkedin.com",
  "netflix.com", "paypal.com", "instagram.com", "reddit.com",
];

function parseDomain(urlStr: string): DomainInfo | null {
  try {
    let formatted = urlStr.trim();
    if (!formatted.match(/^https?:\/\//i)) formatted = `https://${formatted}`;
    const url = new URL(formatted);
    const hostParts = url.hostname.split(".");
    const tld = hostParts.slice(-1)[0];
    const domain = hostParts.slice(-2).join(".");
    const subdomain = hostParts.length > 2 ? hostParts.slice(0, -2).join(".") : null;
    return {
      domain,
      tld,
      subdomain,
      protocol: url.protocol.replace(":", ""),
      pathDepth: url.pathname.split("/").filter(Boolean).length,
      hasQueryParams: url.search.length > 1,
    };
  } catch {
    return null;
  }
}

export function scanUrl(urlStr: string): ScanResult {
  const start = performance.now();
  const threats: ThreatIndicator[] = [];
  let score = 0;

  const domainInfo = parseDomain(urlStr);
  if (!domainInfo) {
    return {
      url: urlStr,
      riskScore: 85,
      riskLevel: "high",
      domainInfo: { domain: urlStr, tld: "", subdomain: null, protocol: "unknown", pathDepth: 0, hasQueryParams: false },
      threats: [{ label: "Invalid URL", severity: "high", description: "The URL format is invalid or malformed." }],
      scanTime: Math.round(performance.now() - start),
    };
  }

  // Check protocol
  if (domainInfo.protocol === "http") {
    threats.push({ label: "No SSL/TLS", severity: "medium", description: "Connection is not encrypted (HTTP instead of HTTPS)." });
    score += 15;
  }

  // Check suspicious TLD
  if (SUSPICIOUS_TLDS.includes(domainInfo.tld)) {
    threats.push({ label: "Suspicious TLD", severity: "high", description: `The ".${domainInfo.tld}" top-level domain is commonly used in phishing attacks.` });
    score += 25;
  }

  // Check for IP address as domain
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(domainInfo.domain)) {
    threats.push({ label: "IP Address URL", severity: "critical", description: "URL uses an IP address instead of a domain name — a strong phishing indicator." });
    score += 35;
  }

  // Check for excessive subdomains
  if (domainInfo.subdomain && domainInfo.subdomain.split(".").length >= 3) {
    threats.push({ label: "Excessive Subdomains", severity: "medium", description: "Multiple subdomains are used to disguise the real domain." });
    score += 15;
  }

  // Check for phishing keywords in URL
  const lowerUrl = urlStr.toLowerCase();
  const foundKeywords = PHISHING_KEYWORDS.filter((kw) => lowerUrl.includes(kw));
  if (foundKeywords.length >= 3) {
    threats.push({ label: "Multiple Phishing Keywords", severity: "high", description: `Contains suspicious keywords: ${foundKeywords.slice(0, 4).join(", ")}.` });
    score += 25;
  } else if (foundKeywords.length >= 1) {
    threats.push({ label: "Phishing Keywords Detected", severity: "low", description: `Contains keywords often used in phishing: ${foundKeywords.join(", ")}.` });
    score += 8;
  }

  // Check for lookalike characters (homograph attack)
  if (/[а-яА-Яа-яёЁ]|xn--/.test(urlStr)) {
    threats.push({ label: "Homograph Attack", severity: "critical", description: "URL contains international characters that mimic Latin letters (IDN homograph attack)." });
    score += 35;
  }

  // Check for excessive path depth
  if (domainInfo.pathDepth > 5) {
    threats.push({ label: "Deep URL Path", severity: "low", description: "Unusually deep URL path structure, often used to hide redirect chains." });
    score += 8;
  }

  // Check for @ symbol in URL
  if (urlStr.includes("@")) {
    threats.push({ label: "@ Symbol in URL", severity: "high", description: "Contains '@' which can trick browsers into ignoring the real domain." });
    score += 20;
  }

  // Check for URL shortener patterns
  if (/^(bit\.ly|tinyurl|t\.co|goo\.gl|is\.gd|buff\.ly|ow\.ly|tr\.im)$/i.test(domainInfo.domain)) {
    threats.push({ label: "URL Shortener", severity: "medium", description: "Shortened URLs hide the true destination and are common in phishing." });
    score += 18;
  }

  // Check for unusual port
  try {
    let formatted = urlStr.trim();
    if (!formatted.match(/^https?:\/\//i)) formatted = `https://${formatted}`;
    const url = new URL(formatted);
    if (url.port && !["80", "443", ""].includes(url.port)) {
      threats.push({ label: "Non-Standard Port", severity: "medium", description: `Uses port ${url.port}, which is uncommon for legitimate websites.` });
      score += 12;
    }
  } catch {}

  // Check for very long URL
  if (urlStr.length > 150) {
    threats.push({ label: "Excessively Long URL", severity: "low", description: "Very long URLs can be used to hide suspicious parameters." });
    score += 5;
  }

  // Bonus: trusted domain
  if (TRUSTED_DOMAINS.includes(domainInfo.domain) && !domainInfo.subdomain) {
    score = Math.max(0, score - 30);
  }

  score = Math.min(100, Math.max(0, score));

  const riskLevel: ScanResult["riskLevel"] =
    score <= 10 ? "safe" : score <= 30 ? "low" : score <= 50 ? "medium" : score <= 75 ? "high" : "significant";

  return {
    url: urlStr,
    riskScore: score,
    riskLevel,
    domainInfo,
    threats,
    scanTime: Math.round(performance.now() - start),
  };
}
