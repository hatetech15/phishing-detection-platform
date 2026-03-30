import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, ShieldAlert, AlertTriangle, CheckCircle, Search, Filter, BarChart3 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import PageLayout from "@/components/PageLayout";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const riskColors: Record<string, string> = {
  safe: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  low: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  medium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  high: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  critical: "bg-destructive/10 text-destructive border-destructive/20",
};

const SecurityScan = () => {
  const { user } = useAuth();
  const [filter, setFilter] = useState("all");

  const { data: scans, isLoading } = useQuery({
    queryKey: ["security-scans", user?.id],
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

  const filtered = filter === "all" ? scans : scans?.filter((s) => s.risk_level === filter);

  const stats = {
    total: scans?.length || 0,
    safe: scans?.filter((s) => s.risk_level === "safe" || s.risk_level === "low").length || 0,
    threats: scans?.filter((s) => s.risk_level === "high" || s.risk_level === "critical").length || 0,
    medium: scans?.filter((s) => s.risk_level === "medium").length || 0,
  };

  return (
    <PageLayout>
      <section className="relative min-h-screen pt-24 pb-16">
        <div className="absolute inset-0 gradient-mesh" />
        <div className="absolute inset-0 cyber-grid opacity-20" />

        <div className="container relative z-10 max-w-5xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-3xl font-extrabold text-foreground mb-2">
              Security <span className="text-primary glow-text">Scan</span> Reports
            </h1>
            <p className="text-muted-foreground text-sm">All scanned URLs and their threat analysis reports</p>
          </motion.div>

          {!user ? (
            <div className="glass-panel rounded-2xl p-12 text-center">
              <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">
                Please <a href="/auth" className="text-primary hover:underline">sign in</a> to view security reports.
              </p>
            </div>
          ) : (
            <>
              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
              >
                {[
                  { label: "Total Scans", value: stats.total, icon: BarChart3, color: "text-primary" },
                  { label: "Safe", value: stats.safe, icon: CheckCircle, color: "text-emerald-400" },
                  { label: "Warnings", value: stats.medium, icon: AlertTriangle, color: "text-amber-400" },
                  { label: "Threats", value: stats.threats, icon: ShieldAlert, color: "text-destructive" },
                ].map((stat) => (
                  <div key={stat.label} className="glass-panel rounded-xl p-4 text-center">
                    <stat.icon className={`w-6 h-6 ${stat.color} mx-auto mb-2`} />
                    <p className="text-2xl font-bold font-mono text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </motion.div>

              {/* Tabs for filtering */}
              <Tabs defaultValue="all" onValueChange={setFilter}>
                <TabsList className="bg-secondary/50 mb-6">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="critical">Critical</TabsTrigger>
                  <TabsTrigger value="high">High</TabsTrigger>
                  <TabsTrigger value="medium">Medium</TabsTrigger>
                  <TabsTrigger value="safe">Safe</TabsTrigger>
                </TabsList>

                <TabsContent value={filter}>
                  {isLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="glass-panel rounded-xl p-4 animate-pulse h-28" />
                      ))}
                    </div>
                  ) : !filtered?.length ? (
                    <div className="glass-panel rounded-2xl p-12 text-center">
                      <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No reports found for this filter.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filtered.map((scan, i) => {
                        const threats = Array.isArray(scan.threats) ? scan.threats : [];
                        return (
                          <motion.div
                            key={scan.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.03 }}
                            className="glass-panel rounded-xl p-5 hover:border-primary/30 transition-colors"
                          >
                            <div className="flex items-start justify-between gap-4 mb-3">
                              <div className="min-w-0 flex-1">
                                <p className="font-mono text-sm text-foreground truncate">{scan.url}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {new Date(scan.created_at).toLocaleString()} • Domain: {scan.domain || "N/A"}
                                </p>
                              </div>
                              <div className="flex items-center gap-3 flex-shrink-0">
                                <div className="text-center">
                                  <p className="text-xl font-bold font-mono text-foreground">{scan.risk_score}</p>
                                  <p className="text-[10px] text-muted-foreground uppercase">Score</p>
                                </div>
                                <Badge className={`${riskColors[scan.risk_level] || riskColors.safe} border`}>
                                  {scan.risk_level}
                                </Badge>
                              </div>
                            </div>

                            {/* Threats list */}
                            {threats.length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-2">
                                {threats.map((t: any, idx: number) => (
                                  <span
                                    key={idx}
                                    className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border"
                                  >
                                    {t.label || t}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* AI Analysis */}
                            {scan.ai_analysis && (
                              <div className="mt-2 p-3 bg-secondary/40 rounded-lg">
                                <p className="text-xs text-muted-foreground mb-1 font-semibold">AI Analysis:</p>
                                <p className="text-xs text-foreground/80 leading-relaxed">{scan.ai_analysis}</p>
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </section>
    </PageLayout>
  );
};

export default SecurityScan;
