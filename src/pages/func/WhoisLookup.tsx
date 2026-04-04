import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ScanModuleLayout from "@/components/ScanModuleLayout";
import { supabase } from "@/integrations/supabase/client";
import { useScanLogger } from "@/hooks/useScanLogger";

const WhoisLookup = () => {
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
      const { data, error: fnError } = await supabase.functions.invoke("whois-lookup", {
        body: { domain: domain.trim() },
      });
      if (fnError) throw fnError;
      if (data.error) throw new Error(data.error);
      setResult(data);
      await logScan(
        "WHOIS Lookup",
        domain.trim(),
        `Registrar: ${data.registrar}, Created: ${data.createdDate || 'N/A'}, Expires: ${data.expiresDate || 'N/A'}`,
        data
      );
    } catch (e: any) {
      setError(e.message || "Lookup failed");
      await logScan("WHOIS Lookup", domain.trim(), `Error: ${e.message}`, {}, "failed");
    } finally {
      setLoading(false);
    }
  };

  const fields = result
    ? [
        { label: "Domain", value: result.domain },
        { label: "Registrar", value: result.registrar },
        { label: "Created", value: result.createdDate },
        { label: "Updated", value: result.updatedDate },
        { label: "Expires", value: result.expiresDate },
        { label: "Domain Age", value: result.domainAge },
        { label: "Status", value: result.status },
        { label: "Owner", value: result.registrant?.name },
        { label: "Organization", value: result.registrant?.organization },
        { label: "Country", value: result.registrant?.country },
        { label: "Contact Email", value: result.registrant?.email },
      ]
    : [];

  return (
    <ScanModuleLayout
      title="WHOIS Lookup"
      description="Look up domain registration details including registrar, ownership, and expiry info."
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
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
            Lookup
          </Button>
        </div>

        {error && (
          <div className="p-4 rounded-lg border border-destructive/30 bg-destructive/5 text-destructive text-sm">{error}</div>
        )}

        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="rounded-lg border border-border/50 overflow-hidden">
              <div className="p-3 bg-muted/30 border-b border-border/50">
                <h3 className="font-semibold text-sm">Registration Details</h3>
              </div>
              <div className="divide-y divide-border/30">
                {fields.map((f, i) =>
                  f.value && f.value !== "REDACTED" ? (
                    <div key={i} className="flex items-center px-4 py-2.5 text-sm">
                      <span className="w-36 text-muted-foreground">{f.label}</span>
                      <span className="text-foreground font-mono">{f.value}</span>
                    </div>
                  ) : null
                )}
              </div>
            </div>

            {result.nameServers?.length > 0 && (
              <div className="rounded-lg border border-border/50 p-4">
                <h4 className="text-sm font-semibold text-foreground mb-2">Name Servers</h4>
                <div className="space-y-1">
                  {result.nameServers.map((ns: string, i: number) => (
                    <div key={i} className="text-sm font-mono text-muted-foreground">{ns}</div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </ScanModuleLayout>
  );
};

export default WhoisLookup;
