import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Shield, Search, AlertTriangle, CheckCircle } from "lucide-react";
import { scanUrl, type ScanResult } from "@/lib/phishing-scanner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ScanResults from "@/components/ScanResults";

const HeroSection = () => {
  const [time, setTime] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(
        now.toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      );
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  const handleScan = useCallback(async () => {
    if (!urlInput.trim()) return;
    setIsScanning(true);
    setScanResult(null);
    setAiAnalysis(null);

    // Simulate brief delay then run heuristic scan
    await new Promise((r) => setTimeout(r, 1200));
    const result = scanUrl(urlInput.trim());
    setScanResult(result);
    setIsScanning(false);

    // Call AI analysis
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-threat-analysis", {
        body: {
          url: urlInput.trim(),
          threats: result.threats,
          riskScore: result.riskScore,
        },
      });
      if (error) throw error;
      if (data?.error) {
        if (data.error.includes("Rate limit")) {
          toast({ title: "Rate Limited", description: "AI analysis rate limit reached. Try again later.", variant: "destructive" });
        } else if (data.error.includes("credits")) {
          toast({ title: "Credits Exhausted", description: "AI credits need to be topped up.", variant: "destructive" });
        }
      } else {
        setAiAnalysis(data?.analysis || null);
      }
    } catch (err) {
      console.error("AI analysis error:", err);
    } finally {
      setAiLoading(false);
    }

    // Save scan to database if logged in
    if (user) {
      try {
        await supabase.from("scans").insert({
          user_id: user.id,
          url: urlInput.trim(),
          risk_score: result.riskScore,
          risk_level: result.riskLevel,
          domain: result.domainInfo.domain,
          threats: result.threats as any,
          ai_analysis: aiAnalysis,
        });
      } catch (err) {
        console.error("Failed to save scan:", err);
      }
    }
  }, [urlInput, user, toast]);

  // Update scan with AI analysis once it arrives
  useEffect(() => {
    if (aiAnalysis && scanResult && user) {
      supabase
        .from("scans")
        .update({ ai_analysis: aiAnalysis })
        .eq("user_id", user.id)
        .eq("url", scanResult.url)
        .order("created_at", { ascending: false })
        .limit(1)
        .then();
    }
  }, [aiAnalysis, scanResult, user]);

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 gradient-mesh" />
      <div className="absolute inset-0 cyber-grid opacity-40" />
      <div className="absolute inset-0 scan-line pointer-events-none" />

      <div className="container relative z-10 py-32 text-center">
        {/* Time display */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-8"
        >
          <span className="inline-block px-4 py-1.5 text-xs font-mono text-primary/80 glass-panel rounded-full">
            IST — {time}
          </span>
        </motion.div>

        {/* Shield icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.3, duration: 0.7, type: "spring" }}
          className="mb-8 inline-block"
        >
          <div className="relative">
            <img src="/phishveda-logo.png" alt="PhishVeda" className="w-28 h-28 invert animate-pulse-glow rounded-full" width={112} height={112} />
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6"
        >
          <span className="text-foreground">Phishing</span>{" "}
          <span className="text-primary glow-text">Detection</span>
          <br />
          <span className="text-foreground">Platform</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="max-w-2xl mx-auto text-lg text-muted-foreground mb-10 leading-relaxed"
        >
          PhishVeda transforms cybersecurity with AI-powered phishing detection, enabling real-time analysis, domain checks, and threat intelligence for enhanced protection.
        </motion.p>

        {/* Scan input */}
        <motion.div
          id="scan"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="max-w-xl mx-auto"
        >
          <div className="flex items-center gap-2 p-2 glass-panel rounded-xl glow-border transition-all duration-300 focus-within:glow-border-intense">
            <Search className="w-5 h-5 text-muted-foreground ml-3 flex-shrink-0" />
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleScan()}
              placeholder="Enter URL to scan for phishing..."
              className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground/60 py-3 px-2 font-mono text-sm"
            />
            <button
              onClick={handleScan}
              disabled={isScanning || !urlInput.trim()}
              className="px-6 py-3 bg-primary text-primary-foreground font-semibold text-sm rounded-lg transition-all duration-300 hover:shadow-[0_0_25px_hsl(217_71%_45%/0.4)] hover:scale-105 active:scale-95 flex-shrink-0 disabled:opacity-50 disabled:hover:scale-100"
            >
              {isScanning ? "Scanning..." : "Scan Now"}
            </button>
          </div>
        </motion.div>

        {/* Scan Results */}
        <ScanResults result={scanResult} isScanning={isScanning} aiAnalysis={aiAnalysis} aiLoading={aiLoading} />

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.6 }}
          className="flex flex-wrap justify-center gap-8 mt-16"
        >
          {[
            { icon: AlertTriangle, label: "Threats Detected", value: "12,847" },
            { icon: CheckCircle, label: "URLs Scanned", value: "1.2M+" },
            { icon: Shield, label: "Users Protected", value: "50K+" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 + i * 0.15, duration: 0.5 }}
              className="flex items-center gap-3 px-6 py-3 glass-panel rounded-xl"
            >
              <stat.icon className="w-5 h-5 text-primary" />
              <div className="text-left">
                <p className="text-xl font-bold font-mono text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
