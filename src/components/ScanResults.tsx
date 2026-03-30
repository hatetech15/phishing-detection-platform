import { motion, AnimatePresence } from "framer-motion";
import { Shield, ShieldAlert, ShieldCheck, ShieldX, Globe, Clock, AlertTriangle, Info, XCircle, CheckCircle, Brain, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import type { ScanResult, ThreatIndicator } from "@/lib/phishing-scanner";

const riskConfig = {
  safe: { color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/30", icon: ShieldCheck, label: "Safe" },
  low: { color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/30", icon: ShieldCheck, label: "Low Risk" },
  medium: { color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/30", icon: Shield, label: "Medium Risk" },
  high: { color: "text-orange-400", bg: "bg-orange-400/10", border: "border-orange-400/30", icon: ShieldAlert, label: "High Risk" },
  critical: { color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/30", icon: ShieldX, label: "Critical" },
};

const severityIcon = {
  low: Info,
  medium: AlertTriangle,
  high: XCircle,
  critical: ShieldX,
};

const severityColor = {
  low: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  medium: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  high: "text-orange-400 bg-orange-400/10 border-orange-400/20",
  critical: "text-destructive bg-destructive/10 border-destructive/20",
};

function ThreatRow({ threat, index }: { threat: ThreatIndicator; index: number }) {
  const Icon = severityIcon[threat.severity];
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.8 + index * 0.1 }}
      className={`flex items-start gap-3 p-3 rounded-lg border ${severityColor[threat.severity]}`}
    >
      <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
      <div className="min-w-0">
        <p className="text-sm font-semibold">{threat.label}</p>
        <p className="text-xs opacity-70 mt-0.5">{threat.description}</p>
      </div>
    </motion.div>
  );
}

interface ScanResultsProps {
  result: ScanResult | null;
  isScanning: boolean;
  aiAnalysis?: string | null;
  aiLoading?: boolean;
}

const ScanResults = ({ result, isScanning, aiAnalysis, aiLoading }: ScanResultsProps) => {
  return (
    <AnimatePresence mode="wait">
      {isScanning && (
        <motion.div
          key="scanning"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="mt-8 max-w-xl mx-auto"
        >
          <div className="glass-panel rounded-2xl p-8 text-center space-y-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            >
              <Shield className="w-10 h-10 text-primary mx-auto" />
            </motion.div>
            <p className="text-sm text-muted-foreground font-mono">Analyzing URL for threats...</p>
            <Progress value={65} className="h-1.5" />
          </div>
        </motion.div>
      )}

      {!isScanning && result && (
        <motion.div
          key="results"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-8 max-w-2xl mx-auto space-y-4 text-left"
        >
          {/* Risk Score Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className={`glass-panel rounded-2xl p-6 border ${riskConfig[result.riskLevel].border}`}
          >
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${riskConfig[result.riskLevel].bg}`}>
                  {(() => {
                    const Icon = riskConfig[result.riskLevel].icon;
                    return <Icon className={`w-8 h-8 ${riskConfig[result.riskLevel].color}`} />;
                  })()}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">Risk Assessment</h3>
                  <Badge className={`mt-1 ${riskConfig[result.riskLevel].bg} ${riskConfig[result.riskLevel].color} border ${riskConfig[result.riskLevel].border}`}>
                    {riskConfig[result.riskLevel].label}
                  </Badge>
                </div>
              </div>

              {/* Score Ring */}
              <div className="relative w-20 h-20">
                <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
                  <circle cx="40" cy="40" r="34" fill="none" stroke="hsl(var(--secondary))" strokeWidth="6" />
                  <motion.circle
                    cx="40" cy="40" r="34" fill="none"
                    stroke="currentColor"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 34}`}
                    className={riskConfig[result.riskLevel].color}
                    initial={{ strokeDashoffset: 2 * Math.PI * 34 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 34 * (1 - result.riskScore / 100) }}
                    transition={{ delay: 0.4, duration: 1, ease: "easeOut" }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-xl font-bold font-mono ${riskConfig[result.riskLevel].color}`}>
                    {result.riskScore}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* AI Analysis */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-panel rounded-2xl p-5"
          >
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-4 h-4 text-primary" />
              <h4 className="text-sm font-semibold text-foreground">AI Threat Analysis</h4>
            </div>
            {aiLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                <p className="text-sm">Analyzing with Gemini AI...</p>
              </div>
            ) : aiAnalysis ? (
              <p className="text-sm text-foreground/80 leading-relaxed">{aiAnalysis}</p>
            ) : (
              <p className="text-sm text-muted-foreground">AI analysis unavailable.</p>
            )}
          </motion.div>

          {/* Domain Info */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-panel rounded-2xl p-5"
          >
            <div className="flex items-center gap-2 mb-3">
              <Globe className="w-4 h-4 text-primary" />
              <h4 className="text-sm font-semibold text-foreground">Domain Information</h4>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: "Domain", value: result.domainInfo.domain },
                { label: "TLD", value: `.${result.domainInfo.tld}` },
                { label: "Protocol", value: result.domainInfo.protocol.toUpperCase() },
                { label: "Subdomain", value: result.domainInfo.subdomain || "None" },
                { label: "Path Depth", value: String(result.domainInfo.pathDepth) },
                { label: "Query Params", value: result.domainInfo.hasQueryParams ? "Yes" : "No" },
              ].map((item) => (
                <div key={item.label} className="bg-secondary/40 rounded-lg p-2.5">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{item.label}</p>
                  <p className="text-sm font-mono text-foreground truncate">{item.value}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Threat Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="glass-panel rounded-2xl p-5"
          >
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-primary" />
              <h4 className="text-sm font-semibold text-foreground">
                Threat Indicators ({result.threats.length})
              </h4>
            </div>
            {result.threats.length === 0 ? (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-400/10 border border-emerald-400/20 text-emerald-400">
                <CheckCircle className="w-4 h-4" />
                <p className="text-sm">No threats detected — URL appears safe.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {result.threats.map((threat, i) => (
                  <ThreatRow key={threat.label} threat={threat} index={i} />
                ))}
              </div>
            )}
          </motion.div>

          {/* Scan metadata */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="flex items-center justify-center gap-4 text-xs text-muted-foreground"
          >
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> Scanned in {result.scanTime}ms
            </span>
            <span className="font-mono truncate max-w-[300px]">{result.url}</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ScanResults;
