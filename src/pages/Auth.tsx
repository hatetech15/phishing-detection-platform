import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Eye, EyeOff, User, Mail, Phone, Building } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import PageLayout from "@/components/PageLayout";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
    fullName: "",
    phone: "",
    organization: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        });
        if (error) throw error;
        toast({ title: "Welcome back!", description: "Successfully logged in." });
        navigate("/");
      } else {
        const { error } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: {
            data: {
              full_name: form.fullName,
              phone: form.phone,
              organization: form.organization,
            },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;

        // Update profile with additional fields
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from("profiles").update({
            phone: form.phone,
            organization: form.organization,
          }).eq("user_id", user.id);
        }

        toast({ title: "Account created!", description: "Please check your email to verify." });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full pl-10 pr-4 py-3 bg-secondary/50 border border-border rounded-lg text-foreground placeholder:text-muted-foreground/50 text-sm outline-none focus:ring-2 focus:ring-primary/40 transition-all";

  return (
    <PageLayout>
      <section className="relative min-h-screen flex items-center justify-center pt-20">
        <div className="absolute inset-0 gradient-mesh" />
        <div className="absolute inset-0 cyber-grid opacity-30" />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="container relative z-10 max-w-md py-20"
        >
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-4"
            >
              <Shield className="w-7 h-7 text-primary" />
            </motion.div>
            <h1 className="text-3xl font-extrabold text-foreground mb-2">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isLogin
                ? "Sign in to access your PhishVeda dashboard"
                : "Register to start scanning and protecting"}
            </p>
          </div>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            onSubmit={handleSubmit}
            className="glass-panel rounded-2xl p-8 space-y-4"
          >
            {!isLogin && (
              <>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
                  <input
                    name="fullName"
                    type="text"
                    required
                    placeholder="Full Name"
                    value={form.fullName}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
                <div className="relative">
                  <Phone className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
                  <input
                    name="phone"
                    type="tel"
                    placeholder="Phone (optional)"
                    value={form.phone}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
                <div className="relative">
                  <Building className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
                  <input
                    name="organization"
                    type="text"
                    placeholder="Organization (optional)"
                    value={form.organization}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
              </>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
              <input
                name="email"
                type="email"
                required
                placeholder="Email Address"
                value={form.email}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                className="w-full pl-4 pr-10 py-3 bg-secondary/50 border border-border rounded-lg text-foreground placeholder:text-muted-foreground/50 text-sm outline-none focus:ring-2 focus:ring-primary/40 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-lg transition-all duration-300 hover:shadow-[0_0_25px_hsl(217_71%_45%/0.4)] hover:scale-[1.02] active:scale-95 disabled:opacity-50"
            >
              {loading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
            </button>

            <p className="text-center text-sm text-muted-foreground">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-primary hover:underline font-medium"
              >
                {isLogin ? "Sign Up" : "Sign In"}
              </button>
            </p>
          </motion.form>
        </motion.div>
      </section>
    </PageLayout>
  );
};

export default Auth;
