import { useState } from "react";
import { motion } from "framer-motion";
import { Shuffle, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ScanModuleLayout from "@/components/ScanModuleLayout";
import { supabase } from "@/integrations/supabase/client";
import { useScanLogger } from "@/hooks/useScanLogger";

const flagColors: Record<string, string> = {
  "phishing-risk": "bg-destructive/10 text-destructive border-destructive/30",
  registered: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  available: "bg-muted/30 text-muted-foreground border-border/50",
};

const DnsTwist = () => {
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const { logScan } = useScanLogger();

  const handleScan = async () => {
    if (!domain.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("dns-twist", {
        body: { domain: domain.trim() },
      });
      if (fnError) throw fnError;
      setResult(data);
      await logScan(
        "DNS Twist",
        domain.trim(),
        `${data.totalGenerated} permutations, ${data.registeredCount} registered, ${data.phishingRiskCount} phishing risk`,
        data
      );
    } catch (e: any) {
      setError(e.message || "Scan failed");
      await logScan("DNS Twist", domain.trim(), `Error: ${e.message}`, {}, "failed");
    } finally {
      setLoading(false);
    }
  };

  const filtered = result?.twists?.filter((t: any) => filter === "all" || t.flag === filter) || [];

  return (
    <ScanModuleLayout
      title="DNS Twisting"
      description="Generate domain permutations and check for registered lookalike domains."
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
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shuffle className="w-4 h-4" />}
            Scan
          </Button>
        </div>

        {error && (
          <div className="p-4 rounded-lg border border-destructive/30 bg-destructive/5 text-destructive text-sm">{error}</div>
        )}

        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-lg border border-border/50 bg-card text-center">
                <div className="text-2xl font-bold text-foreground">{result.totalGenerated}</div>
                <div className="text-xs text-muted-foreground">Permutations</div>
              </div>
              <div className="p-4 rounded-lg border border-border/50 bg-card text-center">
                <div className="text-2xl font-bold text-amber-400">{result.registeredCount}</div>
                <div className="text-xs text-muted-foreground">Registered</div>
              </div>
              <div className="p-4 rounded-lg border border-border/50 bg-card text-center">
                <div className="text-2xl font-bold text-destructive">{result.phishingRiskCount}</div>
                <div className="text-xs text-muted-foreground">Phishing Risk</div>
              </div>
            </div>

            <div className="flex gap-2">
              {["all", "phishing-risk", "registered", "available"].map((f) => (
                <Button
                  key={f}
                  size="sm"
                  variant={filter === f ? "default" : "outline"}
                  onClick={() => setFilter(f)}
                  className="text-xs capitalize"
                >
                  {f === "all" ? "All" : f.replace("-", " ")}
                </Button>
              ))}
            </div>

            <div className="rounded-lg border border-border/50 overflow-hidden">
              <div className="max-h-96 overflow-y-auto divide-y divide-border/30">
                {filtered.map((t: any, i: number) => (
                  <div key={i} className="flex items-center justify-between px-4 py-2.5 text-sm hover:bg-muted/10">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-xs font-mono">{t.type}</Badge>
                      <span className="font-mono text-foreground">{t.domain}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {t.ip && <span className="text-xs text-muted-foreground">{t.ip}</span>}
                      <Badge className={`text-xs ${flagColors[t.flag] || ""}`}>
                        {t.flag?.replace("-", " ")}
                      </Badge>
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

export default DnsTwist;
