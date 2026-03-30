import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Clock, ExternalLink, Trash2, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import PageLayout from "@/components/PageLayout";
import { Badge } from "@/components/ui/badge";

const riskColors: Record<string, string> = {
  safe: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  low: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  medium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  high: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  critical: "bg-destructive/10 text-destructive border-destructive/20",
};

const ScanHistory = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState("");

  const { data: scans, isLoading } = useQuery({
    queryKey: ["scans", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("scans")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const filtered = scans?.filter(
    (s) =>
      s.url.toLowerCase().includes(search.toLowerCase()) ||
      s.domain?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PageLayout>
      <section className="relative min-h-screen pt-24 pb-16">
        <div className="absolute inset-0 gradient-mesh" />
        <div className="absolute inset-0 cyber-grid opacity-20" />

        <div className="container relative z-10 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-extrabold text-foreground mb-2">
              Scan <span className="text-primary glow-text">History</span>
            </h1>
            <p className="text-muted-foreground text-sm">Your previous phishing URL scans</p>
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <div className="flex items-center gap-2 px-4 py-2 glass-panel rounded-xl">
              <Search className="w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Filter by URL or domain..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground/50 text-sm"
              />
            </div>
          </motion.div>

          {!user ? (
            <div className="glass-panel rounded-2xl p-12 text-center">
              <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Please <a href="/auth" className="text-primary hover:underline">sign in</a> to view your scan history.</p>
            </div>
          ) : isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass-panel rounded-xl p-4 animate-pulse h-20" />
              ))}
            </div>
          ) : !filtered?.length ? (
            <div className="glass-panel rounded-2xl p-12 text-center">
              <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No scans yet. Start scanning URLs from the home page!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((scan, i) => (
                <motion.div
                  key={scan.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-panel rounded-xl p-4 flex items-center gap-4 hover:border-primary/30 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-sm text-foreground truncate">{scan.url}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {new Date(scan.created_at).toLocaleString()}
                      </span>
                      {scan.domain && (
                        <span className="text-xs text-muted-foreground font-mono">{scan.domain}</span>
                      )}
                    </div>
                    {scan.ai_analysis && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{scan.ai_analysis}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-lg font-bold font-mono text-foreground">{scan.risk_score}</span>
                    <Badge className={`${riskColors[scan.risk_level] || riskColors.safe} border`}>
                      {scan.risk_level}
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </PageLayout>
  );
};

export default ScanHistory;
