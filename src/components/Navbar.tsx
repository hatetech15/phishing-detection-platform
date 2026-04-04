import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import phishvedaLogo from "/phishveda-logo.png";

const navItems = [
  { label: "Home", path: "/" },
  { label: "Security Scan", path: "/security" },
  { label: "Functionalities", path: "/functionalities" },
  { label: "Scan History", path: "/history" },
  { label: "Report Phishing", path: "/report" },
  { label: "Blog", path: "/blog" },
  { label: "Contact Us", path: "/contact" },
  { label: "About", path: "/#about" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-border/30"
    >
      <div className="container flex items-center justify-between py-4">
        <Link to="/" className="flex items-center gap-2.5 group">
          <img src={phishvedaLogo} alt="PhishVeda" className="w-10 h-10 invert transition-all duration-300 group-hover:scale-110" width={40} height={40} />
          <span className="text-xl font-bold font-mono tracking-tight text-foreground">
            Phish<span className="text-primary">Veda</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-300 hover:text-primary hover:bg-primary/5 ${
                location.pathname === item.path
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm text-muted-foreground truncate max-w-[140px]">
                {user.email}
              </span>
              <button
                onClick={signOut}
                className="px-4 py-2 text-sm font-medium text-destructive border border-destructive/30 rounded-md transition-all duration-300 hover:bg-destructive/10 flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/auth"
                className="px-4 py-2 text-sm font-medium text-primary border border-primary/30 rounded-md transition-all duration-300 hover:bg-primary/10 hover:border-primary/60 hover:shadow-[0_0_15px_hsl(217_71%_45%/0.15)]"
              >
                Login
              </Link>
              <Link
                to="/auth"
                className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md transition-all duration-300 hover:shadow-[0_0_20px_hsl(217_71%_45%/0.4)] hover:scale-105"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-foreground p-2"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden overflow-hidden glass-panel border-t border-border/30"
          >
            <nav className="flex flex-col p-4 gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 text-sm font-medium text-muted-foreground rounded-md transition-all hover:text-primary hover:bg-primary/5"
                >
                  {item.label}
                </Link>
              ))}
              <div className="flex gap-3 pt-3 border-t border-border/30">
                {user ? (
                  <button
                    onClick={() => { signOut(); setMobileOpen(false); }}
                    className="flex-1 text-center px-4 py-2 text-sm font-medium text-destructive border border-destructive/30 rounded-md"
                  >
                    Logout
                  </button>
                ) : (
                  <>
                    <Link to="/auth" onClick={() => setMobileOpen(false)} className="flex-1 text-center px-4 py-2 text-sm font-medium text-primary border border-primary/30 rounded-md">
                      Login
                    </Link>
                    <Link to="/auth" onClick={() => setMobileOpen(false)} className="flex-1 text-center px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md">
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Navbar;
