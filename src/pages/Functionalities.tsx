import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Globe, ShieldAlert, Shuffle, Search, FileText, Wifi, History } from "lucide-react";
import PageLayout from "@/components/PageLayout";

const modules = [
  {
    title: "Domain Squatting Check",
    description: "Detect lookalike domains that could be used for phishing attacks",
    icon: Globe,
    path: "/functionalities/domain-squatting",
    color: "from-muted/50 to-muted/20",
  },
  {
    title: "Breach Check",
    description: "Check if an email or domain has been compromised in data breaches",
    icon: ShieldAlert,
    path: "/functionalities/breach-check",
    color: "from-muted/50 to-muted/20",
  },
  {
    title: "DNS Twisting",
    description: "Generate domain permutations to identify potential phishing domains",
    icon: Shuffle,
    path: "/functionalities/dns-twist",
    color: "from-muted/50 to-muted/20",
  },
  {
    title: "URL Scanner",
    description: "Analyze URLs for security risks, technologies, and threat indicators",
    icon: Search,
    path: "/functionalities/url-scanner",
    color: "from-muted/50 to-muted/20",
  },
  {
    title: "WHOIS Lookup",
    description: "Look up domain registration details, ownership, and expiry info",
    icon: FileText,
    path: "/functionalities/whois-lookup",
    color: "from-muted/50 to-muted/20",
  },
  {
    title: "Network Scanner",
    description: "Scan IP ranges for live hosts, open ports, and hostnames",
    icon: Wifi,
    path: "/functionalities/network-scanner",
    color: "from-muted/50 to-muted/20",
  },
];

const Functionalities = () => {
  return (
    <PageLayout>
      <div className="container py-24 min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold font-mono mb-4">
            Security <span className="text-primary">Functionalities</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Comprehensive security tools to analyze domains, detect breaches, scan networks, and protect your digital assets.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {modules.map((mod, i) => (
            <motion.div
              key={mod.path}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Link
                to={mod.path}
                className="block group p-6 rounded-xl border border-border/50 bg-gradient-to-br from-card to-card/80 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                    <mod.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">{mod.title}</h3>
                    <p className="text-sm text-muted-foreground">{mod.description}</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Link
            to="/functionalities/scan-history"
            className="flex items-center gap-3 p-5 rounded-xl border border-border/50 bg-card hover:border-primary/30 transition-all duration-300 max-w-md mx-auto"
          >
            <History className="w-5 h-5 text-primary" />
            <div>
              <h3 className="font-semibold text-foreground">Scan History</h3>
              <p className="text-sm text-muted-foreground">View, filter, and export all your scan logs</p>
            </div>
          </Link>
        </motion.div>
      </div>
    </PageLayout>
  );
};

export default Functionalities;
