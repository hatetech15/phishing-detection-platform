import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import PageLayout from "@/components/PageLayout";

const Report = () => (
  <PageLayout>
    <section className="relative min-h-screen flex items-center justify-center pt-20">
      <div className="absolute inset-0 gradient-mesh" />
      <div className="absolute inset-0 cyber-grid opacity-30" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="container relative z-10 max-w-lg py-20"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-destructive/10 mb-4"
          >
            <AlertTriangle className="w-7 h-7 text-destructive" />
          </motion.div>
          <h1 className="text-4xl font-extrabold text-foreground mb-2">
            Report <span className="text-primary glow-text">Phishing</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            <strong>Disclaimer:</strong> Free phishing reporting tool
          </p>
          <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
            Report suspected phishing URLs or domains to help improve security awareness
            and prevent cyber fraud.
          </p>
        </div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="glass-panel rounded-2xl p-8 space-y-5"
        >
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Phishing URL or Domain
            </label>
            <input
              type="text"
              required
              placeholder="https://suspicious-site.com"
              className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-lg text-foreground placeholder:text-muted-foreground/50 font-mono text-sm outline-none focus:ring-2 focus:ring-primary/40 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Email ID <span className="text-muted-foreground">(Optional)</span>
            </label>
            <input
              type="email"
              placeholder="your@email.com"
              className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-lg text-foreground placeholder:text-muted-foreground/50 text-sm outline-none focus:ring-2 focus:ring-primary/40 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Additional Details
            </label>
            <textarea
              rows={4}
              placeholder="Describe the phishing attempt..."
              className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-lg text-foreground placeholder:text-muted-foreground/50 text-sm outline-none focus:ring-2 focus:ring-primary/40 transition-all resize-none"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-lg transition-all duration-300 hover:shadow-[0_0_25px_hsl(199_89%_60%/0.4)] hover:scale-[1.02] active:scale-95"
          >
            Submit Report
          </button>
        </motion.form>
      </motion.div>
    </section>
  </PageLayout>
);

export default Report;
