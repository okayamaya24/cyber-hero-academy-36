import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Mail, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { toast.error("Please enter your email address."); return; }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      setSent(true);
    }
  };

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

        {sent ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl border border-border bg-card p-8 shadow-card text-center space-y-4"
          >
            <CheckCircle2 className="mx-auto h-12 w-12 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Check Your Email</h1>
            <p className="text-muted-foreground">
              We sent a password reset link to <span className="font-semibold text-foreground">{email}</span>.
              Check your inbox and follow the link to reset your password.
            </p>
            <p className="text-xs text-muted-foreground">Didn't get it? Check your spam folder or try again.</p>
            <Button variant="outline" className="w-full" onClick={() => setSent(false)}>
              Try a different email
            </Button>
            <Link to="/login" className="block text-sm font-semibold text-primary hover:underline">
              Back to Log In
            </Link>
          </motion.div>
        ) : (
          <>
            <div className="mb-6 text-center">
              <h1 className="text-3xl font-bold text-foreground">Forgot Password?</h1>
              <p className="mt-2 text-muted-foreground">Enter your email and we'll send you a reset link.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-border bg-card p-7 shadow-card">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Mail className="h-4 w-4 text-primary" /> Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
              <Button type="submit" variant="hero" size="lg" className="w-full text-base" disabled={loading}>
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>
              <p className="pt-1 text-center text-sm text-muted-foreground">
                Remember it?{" "}
                <Link to="/login" className="font-semibold text-primary hover:underline">Back to Log In</Link>
              </p>
            </form>
          </>
        )}

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Shield className="h-3.5 w-3.5" />
          <span>Cyber Hero Academy · Safe &amp; Secure</span>
        </motion.div>
      </motion.div>
    </div>
  );
}
