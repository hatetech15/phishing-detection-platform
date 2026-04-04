import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Loader2, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ScanModuleLayout from "@/components/ScanModuleLayout";
import { supabase } from "@/integrations/supabase/client";
import { useScanLogger } from "@/hooks/useScanLogger";

const UrlScanner = () => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const { logScan } = useScanLogger();

  const handleScan = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("url-scanner", {
        body: { url: url.trim() },
      });
      if (fnError) throw fnError;
      if (data.error) throw new Error(data.error);
      setResult(data);
      const summary = data.status === "pending"
        ? "Scan submitted, results pending"
        : `${data.title || data.domain} - ${data.riskIndicators?.malicious ? "MALICIOUS" : "Clean"} (Score: ${data.riskIndicators?.score || 0})`;
      await logScan("URL Scanner", url.trim(), summary, data);
    } catch (e: any) {
      setError(e.message || "Scan failed");
      await logScan("URL Scanner", url.trim(), `Error: ${e.message}`, {}, "failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScanModuleLayout
      title="URL Scanner"
      description="Submit a URL for deep analysis — screenshots, technologies, and risk indicators."
    >
      <div className="space-y-6">
        <div className="flex gap-3">
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            onKeyDown={(e) => e.key === "Enter" && handleScan()}
            className="flex-1"
          />
          <Button onClick={handleScan} disabled={loading || !url.trim()}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Scan
          </Button>
        </div>

        {loading && (
          <div className="p-6 rounded-lg border border-border/50 bg-card text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Scanning URL... This may take up to 60 seconds.</p>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-lg border border-destructive/30 bg-destructive/5 text-destructive text-sm">{error}</div>
        )}

        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {result.status === "pending" ? (
              <div className="p-6 rounded-lg border border-border/50 bg-card text-center">
                <p className="text-foreground font-semibold mb-2">Scan Submitted</p>
                <p className="text-sm text-muted-foreground mb-3">Results are still processing.</p>
                <a href={result.resultUrl} target="_blank" rel="noreferrer" className="text-primary text-sm hover:underline inline-flex items-center gap-1">
                  View on URLScan.io <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ) : (
              <>
                {result.screenshotUrl && (
                  <div className="rounded-lg border border-border/50 overflow-hidden">
                    <img src={result.screenshotUrl} alt="Page screenshot" className="w-full" />
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-3 rounded-lg border border-border/50 bg-card">
                    <div className="text-xs text-muted-foreground">Domain</div>
                    <div className="font-mono text-sm text-foreground truncate">{result.domain}</div>
                  </div>
                  <div className="p-3 rounded-lg border border-border/50 bg-card">
                    <div className="text-xs text-muted-foreground">IP</div>
                    <div className="font-mono text-sm text-foreground">{result.ip}</div>
                  </div>
                  <div className="p-3 rounded-lg border border-border/50 bg-card">
                    <div className="text-xs text-muted-foreground">Country</div>
                    <div className="text-sm text-foreground">{result.country}</div>
                  </div>
                  <div className="p-3 rounded-lg border border-border/50 bg-card">
                    <div className="text-xs text-muted-foreground">Malicious</div>
                    <Badge variant={result.riskIndicators?.malicious ? "destructive" : "secondary"}>
                      {result.riskIndicators?.malicious ? "Yes" : "No"}
                    </Badge>
                  </div>
                </div>

                {result.title && (
                  <div className="p-3 rounded-lg border border-border/50 bg-card">
                    <div className="text-xs text-muted-foreground mb-1">Page Title</div>
                    <div className="text-sm text-foreground">{result.title}</div>
                  </div>
                )}

                {result.technologies?.length > 0 && (
                  <div className="p-3 rounded-lg border border-border/50 bg-card">
                    <div className="text-xs text-muted-foreground mb-2">Technologies</div>
                    <div className="flex flex-wrap gap-1.5">
                      {result.technologies.map((t: any, i: number) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {typeof t === 'string' ? t : t.app || t.name || JSON.stringify(t)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg border border-border/50 bg-card text-center">
                    <div className="text-xl font-bold text-foreground">{result.stats?.requests}</div>
                    <div className="text-xs text-muted-foreground">Requests</div>
                  </div>
                  <div className="p-3 rounded-lg border border-border/50 bg-card text-center">
                    <div className="text-xl font-bold text-foreground">{result.stats?.uniqueIPs}</div>
                    <div className="text-xs text-muted-foreground">Unique IPs</div>
                  </div>
                  <div className="p-3 rounded-lg border border-border/50 bg-card text-center">
                    <div className="text-xl font-bold text-foreground">{result.stats?.uniqueDomains}</div>
                    <div className="text-xs text-muted-foreground">Domains</div>
                  </div>
                </div>

                <a href={result.resultUrl} target="_blank" rel="noreferrer" className="text-primary text-sm hover:underline inline-flex items-center gap-1">
                  View full report on URLScan.io <ExternalLink className="w-3 h-3" />
                </a>
              </>
            )}
          </motion.div>
        )}
      </div>
    </ScanModuleLayout>
  );
};

export default UrlScanner;
