import { useState } from "react";
import { motion } from "framer-motion";
import { ShieldAlert, Loader2, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ScanModuleLayout from "@/components/ScanModuleLayout";
import { supabase } from "@/integrations/supabase/client";
import { useScanLogger } from "@/hooks/useScanLogger";

const BreachCheck = () => {
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
      const { data, error: fnError } = await supabase.functions.invoke("breach-check", {
        body: { input: input.trim() },
      });
      if (fnError) throw fnError;
      if (data.error) throw new Error(data.error);
      setResult(data);
      await logScan(
        "Breach Check",
        input.trim(),
        data.breachCount > 0
          ? `${data.breachCount} breaches found, ${data.totalPwned?.toLocaleString()} accounts compromised`
          : "No breaches found",
        data
      );
    } catch (e: any) {
      setError(e.message || "Check failed");
      await logScan("Breach Check", input.trim(), `Error: ${e.message}`, {}, "failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScanModuleLayout
      title="Breach Check"
      description="Check if an email address or domain has been compromised in known data breaches."
    >
      <div className="space-y-6">
        <div className="flex gap-3">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter email or domain (e.g., user@example.com)"
            onKeyDown={(e) => e.key === "Enter" && handleScan()}
            className="flex-1"
          />
          <Button onClick={handleScan} disabled={loading || !input.trim()}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldAlert className="w-4 h-4" />}
            Check
          </Button>
        </div>

        {error && (
          <div className="p-4 rounded-lg border border-destructive/30 bg-destructive/5 text-destructive text-sm">{error}</div>
        )}

        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {result.breachCount === 0 ? (
              <div className="p-6 rounded-lg border border-border/50 bg-card text-center">
                <ShieldCheck className="w-12 h-12 text-primary mx-auto mb-3" />
                <h3 className="font-semibold text-lg text-foreground">No Breaches Found</h3>
                <p className="text-muted-foreground text-sm">
                  {result.input} was not found in any known data breaches.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg border border-destructive/30 bg-destructive/5 text-center">
                    <div className="text-3xl font-bold text-destructive">{result.breachCount}</div>
                    <div className="text-xs text-muted-foreground">Breaches</div>
                  </div>
                  <div className="p-4 rounded-lg border border-border/50 bg-card text-center">
                    <div className="text-3xl font-bold text-foreground">{result.totalPwned?.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">Accounts Affected</div>
                  </div>
                </div>

                <div className="space-y-3">
                  {result.breaches?.map((b: any, i: number) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="p-4 rounded-lg border border-border/50 bg-card"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-foreground">{b.title || b.name}</h4>
                        <Badge variant={b.isVerified ? "destructive" : "secondary"} className="text-xs">
                          {b.isVerified ? "Verified" : "Unverified"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        Breach date: {b.breachDate} · {b.pwnCount?.toLocaleString()} accounts
                      </p>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{b.description}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {b.dataClasses?.map((dc: string) => (
                          <Badge key={dc} variant="outline" className="text-xs">{dc}</Badge>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        )}
      </div>
    </ScanModuleLayout>
  );
};

export default BreachCheck;
