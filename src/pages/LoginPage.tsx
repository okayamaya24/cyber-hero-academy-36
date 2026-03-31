import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Mail, Lock as LockIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";

const KID_EMAIL_DOMAIN = "@cyberhero.app";

export default function LoginPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ identifier: "", password: "" });

  // Auto-redirect based on role after login
  useEffect(() => {
    if (!user || profileLoading || !profile) return;
    switch (profile.role) {
      case "creator":
        navigate("/admin-portal/games", { replace: true });
        break;
      case "family":
      case "school":
        navigate("/dashboard", { replace: true });
        break;
      case "kid":
        navigate("/dashboard", { replace: true });
        break;
      default:
        navigate("/kid-dashboard", { replace: true });
    }
  }, [user, profile, profileLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.identifier.trim() || !form.password) {
      toast.error("Please fill in both fields.");
      return;
    }
    setLoading(true);

    // If identifier has @, treat as email. Otherwise append kid email domain.
    const email = form.identifier.includes("@")
      ? form.identifier.trim()
      : form.identifier.trim().toLowerCase() + KID_EMAIL_DOMAIN;

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: form.password,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Welcome back!");
    }
  };

  // Already logged in — show nothing while redirect fires
  if (user && profile) return null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.1, stiffness: 200 }}
          className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full gradient-hero shadow-glow"
        >
          <Shield className="h-8 w-8 text-primary-foreground" />
        </motion.div>

        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-foreground">Welcome Back!</h1>
          <p className="mt-2 text-muted-foreground">Log in to continue.</p>
        </div>

        <form
          onSubmit={handleLogin}
          className="space-y-5 rounded-2xl border border-border bg-card p-7 shadow-card"
        >
          <div className="space-y-1.5">
            <Label htmlFor="identifier" className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Mail className="h-4 w-4 text-primary" /> Username or Email
            </Label>
            <Input
              id="identifier"
              type="text"
              placeholder="your@email.com or username"
              value={form.identifier}
              onChange={(e) => setForm({ ...form, identifier: e.target.value })}
              autoComplete="username"
              maxLength={255}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password" className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <LockIcon className="h-4 w-4 text-primary" /> Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Your password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              autoComplete="current-password"
            />
          </div>
          <Button type="submit" variant="hero" size="lg" className="w-full text-base" disabled={loading}>
            {loading ? "Logging in..." : "Sign In"}
          </Button>
          <p className="pt-1 text-center text-sm text-muted-foreground">
            Parent or Teacher?{" "}
            <Link to="/signup" className="font-semibold text-primary hover:underline">Create an account</Link>
          </p>
        </form>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Shield className="h-3.5 w-3.5" />
          <span>Cyber Hero Academy · Safe &amp; Secure</span>
        </motion.div>
      </motion.div>
    </div>
  );
}
