import { useState } from "react";
import { motion } from "framer-motion";
import { Globe, Loader2, AlertTriangle, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ScanModuleLayout from "@/components/ScanModuleLayout";
import { supabase } from "@/integrations/supabase/client";
import { useScanLogger } from "@/hooks/useScanLogger";

const DomainSquatting = () => {
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const { logScan } = useScanLogger();

  const handleScan = async () => {
    if (!domain.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("domain-squatting", {
        body: { domain: domain.trim() },
      });
      if (fnError) throw fnError;
      setResult(data);
      await logScan(
        "Domain Squatting",
        domain.trim(),
        `${data.registeredCount}/${data.totalChecked} similar domains registered (Risk: ${data.riskScore}%)`,
        data
      );
    } catch (e: any) {
      setError(e.message || "Scan failed");
      await logScan("Domain Squatting", domain.trim(), `Error: ${e.message}`, {}, "failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScanModuleLayout
      title="Domain Squatting Check"
      description="Detect lookalike domains that could be used for phishing attacks against your brand."
    >
      <div className="space-y-6">
        <div className="flex gap-3">
          <Input
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="e.g., example.com"
            onKeyDown={(e) => e.key === "Enter" && handleScan()}
            className="flex-1"
          />
          <Button onClick={handleScan} disabled={loading || !domain.trim()}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
            Scan
          </Button>
        </div>

        {error && (
          <div className="p-4 rounded-lg border border-destructive/30 bg-destructive/5 text-destructive text-sm">
            {error}
          </div>
        )}

        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-lg border border-border/50 bg-card text-center">
                <div className="text-2xl font-bold text-foreground">{result.totalChecked}</div>
                <div className="text-xs text-muted-foreground">Checked</div>
              </div>
              <div className="p-4 rounded-lg border border-border/50 bg-card text-center">
                <div className="text-2xl font-bold text-destructive">{result.registeredCount}</div>
                <div className="text-xs text-muted-foreground">Registered</div>
              </div>
              <div className="p-4 rounded-lg border border-border/50 bg-card text-center">
                <div className="text-2xl font-bold text-foreground">{result.riskScore}%</div>
                <div className="text-xs text-muted-foreground">Risk Score</div>
              </div>
            </div>

            <div className="rounded-lg border border-border/50 overflow-hidden">
              <div className="p-3 bg-muted/30 border-b border-border/50">
                <h3 className="font-semibold text-sm">Domain Permutations</h3>
              </div>
              <div className="max-h-96 overflow-y-auto divide-y divide-border/30">
                {result.permutations?.map((p: any, i: number) => (
                  <div key={i} className="flex items-center justify-between px-4 py-2.5 text-sm hover:bg-muted/10">
                    <span className="font-mono text-foreground">{p.domain}</span>
                    <div className="flex items-center gap-2">
                      {p.ip && <span className="text-xs text-muted-foreground">{p.ip}</span>}
                      {p.registered ? (
                        <Badge variant="destructive" className="text-xs">
                          <AlertTriangle className="w-3 h-3 mr-1" />Registered
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          <CheckCircle className="w-3 h-3 mr-1" />Available
                        </Badge>
                      )}
                    </div>
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

export default DomainSquatting;
