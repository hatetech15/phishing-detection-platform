import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="border-t border-border/30 bg-card/40 backdrop-blur-sm">
    <div className="container py-10 flex flex-col md:flex-row items-center justify-between gap-4">
      <Link to="/" className="flex items-center gap-2 group">
        <img src="/phishveda-logo.png" alt="PhishVeda" className="w-7 h-7 invert transition-transform group-hover:scale-110" width={28} height={28} />
        <span className="font-mono font-bold text-sm text-foreground">
          Phish<span className="text-primary">Veda</span>
        </span>
      </Link>
      <nav className="flex gap-6 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-primary transition-colors">Home</Link>
        <Link to="/report" className="hover:text-primary transition-colors">Report</Link>
        <Link to="/contact" className="hover:text-primary transition-colors">Contact</Link>
      </nav>
      <p className="text-xs text-muted-foreground">
        © 2026 PhishVeda | Open Source Security Tool
      </p>
    </div>
  </footer>
);

export default Footer;
