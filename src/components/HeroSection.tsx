import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, Search, AlertTriangle, CheckCircle } from "lucide-react";

const HeroSection = () => {
  const [time, setTime] = useState("");

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

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background effects */}
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
            <Shield className="w-20 h-20 text-primary animate-pulse-glow rounded-full" />
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
          Detect phishing URLs using intelligent analysis, domain verification,
          and threat intelligence to help identify and prevent online fraud in real time.
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
              placeholder="Enter URL to scan for phishing..."
              className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground/60 py-3 px-2 font-mono text-sm"
            />
            <button className="px-6 py-3 bg-primary text-primary-foreground font-semibold text-sm rounded-lg transition-all duration-300 hover:shadow-[0_0_25px_hsl(199_89%_60%/0.4)] hover:scale-105 active:scale-95 flex-shrink-0">
              Scan Now
            </button>
          </div>
        </motion.div>

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
