import { motion } from "framer-motion";
import { Brain, Globe, ShieldCheck, Zap } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Intelligent Analysis",
    desc: "Advanced heuristics and pattern matching to identify suspicious URL structures.",
  },
  {
    icon: Globe,
    title: "Domain Verification",
    desc: "Cross-reference domains against known phishing databases and threat feeds.",
  },
  {
    icon: ShieldCheck,
    title: "Risk Scoring",
    desc: "Multi-factor risk assessment with confidence scoring for each scanned URL.",
  },
  {
    icon: Zap,
    title: "Real-Time Detection",
    desc: "Instant threat analysis with sub-second response times for live protection.",
  },
];

const AboutSection = () => (
  <section id="about" className="relative py-32 overflow-hidden">
    <div className="absolute inset-0 gradient-mesh opacity-50" />
    <div className="container relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-foreground">
          About <span className="text-primary glow-text">PhishVeda</span>
        </h2>
        <p className="max-w-2xl mx-auto text-muted-foreground text-lg">
          An open-source phishing detection engine powered by domain intelligence,
          risk scoring, and real-time threat intelligence feeds.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: i * 0.12, duration: 0.5 }}
            whileHover={{ y: -8, transition: { duration: 0.25 } }}
            className="glass-panel rounded-2xl p-6 group cursor-default transition-all duration-300 hover:glow-border"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <f.icon className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">{f.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default AboutSection;
