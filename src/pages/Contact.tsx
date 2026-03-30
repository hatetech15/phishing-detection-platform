import { motion } from "framer-motion";
import { Mail } from "lucide-react";
import PageLayout from "@/components/PageLayout";

const Contact = () => (
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
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-4"
          >
            <Mail className="w-7 h-7 text-primary" />
          </motion.div>
          <h1 className="text-4xl font-extrabold text-foreground mb-2">
            Contact <span className="text-primary glow-text">Us</span>
          </h1>
          <p className="text-muted-foreground text-sm">
            Have questions? We'd love to hear from you.
          </p>
        </div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          action="https://formsubmit.co/q7bhavishyarane@gmail.com"
          method="POST"
          className="glass-panel rounded-2xl p-8 space-y-5"
        >
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Name</label>
            <input
              type="text"
              name="name"
              required
              placeholder="Your name"
              className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-lg text-foreground placeholder:text-muted-foreground/50 text-sm outline-none focus:ring-2 focus:ring-primary/40 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Email ID</label>
            <input
              type="email"
              name="email"
              required
              placeholder="your@email.com"
              className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-lg text-foreground placeholder:text-muted-foreground/50 text-sm outline-none focus:ring-2 focus:ring-primary/40 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Subject</label>
            <input
              type="text"
              name="subject"
              required
              placeholder="What's this about?"
              className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-lg text-foreground placeholder:text-muted-foreground/50 text-sm outline-none focus:ring-2 focus:ring-primary/40 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Message</label>
            <textarea
              name="message"
              rows={5}
              required
              placeholder="Tell us more..."
              className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-lg text-foreground placeholder:text-muted-foreground/50 text-sm outline-none focus:ring-2 focus:ring-primary/40 transition-all resize-none"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-lg transition-all duration-300 hover:shadow-[0_0_25px_hsl(199_89%_60%/0.4)] hover:scale-[1.02] active:scale-95"
          >
            Send Message
          </button>
        </motion.form>
      </motion.div>
    </section>
  </PageLayout>
);

export default Contact;
