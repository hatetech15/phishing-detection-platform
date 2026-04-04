import { useState } from "react";
import { motion } from "framer-motion";
import { Wifi, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ScanModuleLayout from "@/components/ScanModuleLayout";
import { supabase } from "@/integrations/supabase/client";
import { useScanLogger } from "@/hooks/useScanLogger";

const NetworkScanner = () => {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const { logScan } = useScanLogger();

  const handleScan = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("network-scanner", {
        body: { input: input.trim() },
      });
      if (fnError) throw fnError;
      setResult(data);
      await logScan(
        "Network Scanner",
        input.trim(),
        `${data.liveHosts}/${data.scannedIPs} hosts alive, ${data.totalOpenPorts} open ports`,
        data
      );
    } catch (e: any) {
      setError(e.message || "Scan failed");
      await logScan("Network Scanner", input.trim(), `Error: ${e.message}`, {}, "failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScanModuleLayout
      title="Network Scanner"
      description="Scan IP ranges for live hosts, open ports, and hostnames."
    >
      <div className="space-y-6">
        <div className="flex gap-3">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g., 192.168.1.0/24 or 192.168.1.1-192.168.1.10"
            onKeyDown={(e) => e.key === "Enter" && handleScan()}
            className="flex-1"
          />
          <Button onClick={handleScan} disabled={loading || !input.trim()}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wifi className="w-4 h-4" />}
            Scan
          </Button>
        </div>

        {loading && (
          <div className="p-6 rounded-lg border border-border/50 bg-card text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Scanning network... This may take a moment.</p>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-lg border border-destructive/30 bg-destructive/5 text-destructive text-sm">{error}</div>
        )}

        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-lg border border-border/50 bg-card text-center">
                <div className="text-2xl font-bold text-foreground">{result.scannedIPs}</div>
                <div className="text-xs text-muted-foreground">IPs Scanned</div>
              </div>
              <div className="p-4 rounded-lg border border-border/50 bg-card text-center">
                <div className="text-2xl font-bold text-primary">{result.liveHosts}</div>
                <div className="text-xs text-muted-foreground">Live Hosts</div>
              </div>
              <div className="p-4 rounded-lg border border-border/50 bg-card text-center">
                <div className="text-2xl font-bold text-foreground">{result.totalOpenPorts}</div>
                <div className="text-xs text-muted-foreground">Open Ports</div>
              </div>
            </div>

            <div className="rounded-lg border border-border/50 overflow-hidden">
              <div className="p-3 bg-muted/30 border-b border-border/50">
                <h3 className="font-semibold text-sm">Scan Results</h3>
              </div>
              <div className="max-h-96 overflow-y-auto divide-y divide-border/30">
                {result.results?.map((r: any, i: number) => (
                  <div key={i} className="px-4 py-3 text-sm hover:bg-muted/10">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-foreground">{r.ip}</span>
                      <Badge variant={r.alive ? "default" : "secondary"} className="text-xs">
                        {r.alive ? "Alive" : "Down"}
                      </Badge>
                    </div>
                    {r.hostname && (
                      <div className="text-xs text-muted-foreground">Hostname: {r.hostname}</div>
                    )}
                    {r.ports?.length > 0 && (
                      <div className="flex gap-1.5 mt-1.5">
                        {r.ports.map((p: any, j: number) => (
                          <Badge key={j} variant="outline" className="text-xs font-mono">
                            {p.port}/{p.protocol}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </ScanModuleLayout>
  );
};

export default NetworkScanner;
