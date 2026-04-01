import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [phase, setPhase] = useState<"logo" | "text" | "exit">("logo");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("text"), 600);
    const t2 = setTimeout(() => setPhase("exit"), 2000);
    const t3 = setTimeout(onComplete, 2600);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {phase !== "exit" ? null : undefined}
      <motion.div
        key="splash"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        animate={phase === "exit" ? { opacity: 0, scale: 1.1 } : { opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background"
      >
        {/* Subtle grid */}
        <div className="absolute inset-0 cyber-grid opacity-20" />

        {/* Logo */}
        <motion.img
          src="/phishveda-logo.png"
          alt="PhishVeda"
          className="w-24 h-24 invert"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 200 }}
        />

        {/* Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={phase === "text" || phase === "exit" ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4 }}
          className="mt-6 text-center"
        >
          <h1 className="text-3xl font-extrabold font-mono tracking-tight text-foreground">
            Phish<span className="text-primary">Veda</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-2">AI-Powered Phishing Detection</p>
        </motion.div>

        {/* Loading bar */}
        <motion.div
          className="mt-8 h-0.5 bg-primary/30 rounded-full overflow-hidden w-48"
          initial={{ opacity: 0 }}
          animate={phase === "text" || phase === "exit" ? { opacity: 1 } : {}}
        >
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 1.3, ease: "easeInOut" }}
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SplashScreen;
