import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { History, Search, Trash2, Download, Copy, FileDown, Loader2, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PageLayout from "@/components/PageLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const scanTypeColors: Record<string, string> = {
  "Domain Squatting": "bg-primary/10 text-primary border-primary/30",
  "Breach Check": "bg-destructive/10 text-destructive border-destructive/30",
  "DNS Twist": "bg-amber-500/10 text-amber-400 border-amber-500/30",
  "URL Scanner": "bg-muted/30 text-foreground border-border",
  "WHOIS Lookup": "bg-muted/20 text-muted-foreground border-border/50",
  "Network Scanner": "bg-primary/5 text-primary border-primary/20",
};

const FunctionalityScanHistory = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const { data: scans, isLoading } = useQuery({
    queryKey: ["functionality-scans", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("functionality_scans" as any)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
    enabled: !!user,
  });

  const filtered = useMemo(() => {
    if (!scans) return [];
    return scans.filter((s: any) => {
      const matchesType = typeFilter === "all" || s.scan_type === typeFilter;
      const matchesSearch =
        !search ||
        s.input_value?.toLowerCase().includes(search.toLowerCase()) ||
        s.result_summary?.toLowerCase().includes(search.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [scans, typeFilter, search]);

  const scanTypes = useMemo(() => {
    if (!scans) return [];
    return [...new Set(scans.map((s: any) => s.scan_type))];
  }, [scans]);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("functionality_scans" as any).delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: "Failed to delete scan", variant: "destructive" });
    } else {
      queryClient.invalidateQueries({ queryKey: ["functionality-scans"] });
      toast({ title: "Deleted", description: "Scan log removed" });
    }
  };

  const handleCopy = (scan: any) => {
    const text = `Type: ${scan.scan_type}\nInput: ${scan.input_value}\nDate: ${new Date(scan.created_at).toLocaleString()}\nStatus: ${scan.status}\nSummary: ${scan.result_summary}`;
    navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: "Scan details copied to clipboard" });
  };

  const handleExportCSV = () => {
    if (!filtered.length) return;
    const headers = ["Scan Type", "Input Value", "Date", "Status", "Summary"];
    const rows = filtered.map((s: any) => [
      s.scan_type,
      s.input_value,
      new Date(s.created_at).toLocaleString(),
      s.status,
      `"${(s.result_summary || "").replace(/"/g, '""')}"`,
    ]);
    const csv = [headers.join(","), ...rows.map((r: string[]) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `phishveda-scan-history-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadPDF = () => {
    // Generate a printable HTML and use window.print()
    const printContent = `
      <html><head><title>PhishVeda Scan History</title>
      <style>body{font-family:monospace;padding:20px}table{width:100%;border-collapse:collapse;margin-top:20px}
      th,td{border:1px solid #333;padding:8px;text-align:left;font-size:12px}th{background:#222;color:#fff}</style></head>
      <body><h1>PhishVeda - Scan History Report</h1><p>Generated: ${new Date().toLocaleString()}</p>
      <table><tr><th>Type</th><th>Input</th><th>Date</th><th>Status</th><th>Summary</th></tr>
      ${filtered.map((s: any) => `<tr><td>${s.scan_type}</td><td>${s.input_value}</td><td>${new Date(s.created_at).toLocaleString()}</td><td>${s.status}</td><td>${s.result_summary || ""}</td></tr>`).join("")}
      </table></body></html>`;
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(printContent);
      win.document.close();
      win.print();
    }
  };

  return (
    <PageLayout>
      <div className="container py-24 min-h-screen max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Link
            to="/functionalities"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Functionalities
          </Link>

          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold font-mono flex items-center gap-3">
                <History className="w-7 h-7 text-primary" />
                Scan History
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                {filtered.length} {filtered.length === 1 ? "entry" : "entries"}
              </p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={handleExportCSV} disabled={!filtered.length}>
                <FileDown className="w-4 h-4" /> CSV
              </Button>
              <Button size="sm" variant="outline" onClick={handleDownloadPDF} disabled={!filtered.length}>
                <Download className="w-4 h-4" /> PDF
              </Button>
            </div>
          </div>

          <div className="flex gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by input or summary..."
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {scanTypes.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {!user && (
            <div className="p-8 rounded-lg border border-border/50 bg-card text-center">
              <p className="text-muted-foreground">Please sign in to view your scan history.</p>
              <Link to="/auth" className="text-primary hover:underline text-sm mt-2 inline-block">Sign In</Link>
            </div>
          )}

          {isLoading && (
            <div className="p-8 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
            </div>
          )}

          {user && !isLoading && filtered.length === 0 && (
            <div className="p-8 rounded-lg border border-border/50 bg-card text-center">
              <p className="text-muted-foreground">No scan history found.</p>
            </div>
          )}

          <div className="space-y-3">
            {filtered.map((scan: any, i: number) => (
              <motion.div
                key={scan.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="p-4 rounded-lg border border-border/50 bg-card hover:border-primary/20 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Badge className={`text-xs ${scanTypeColors[scan.scan_type] || ""}`}>
                        {scan.scan_type}
                      </Badge>
                      <Badge variant={scan.status === "success" ? "secondary" : "destructive"} className="text-xs">
                        {scan.status}
                      </Badge>
                    </div>
                    <div className="font-mono text-sm text-foreground truncate">{scan.input_value}</div>
                    <div className="text-xs text-muted-foreground mt-1">{scan.result_summary}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(scan.created_at).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex gap-1 ml-3">
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleCopy(scan)}>
                      <Copy className="w-3.5 h-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(scan.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </PageLayout>
  );
};

export default FunctionalityScanHistory;
