import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield, Mail, Lock as LockIcon, User, CheckCircle2, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { usePlatformSettings } from "@/hooks/usePlatformSettings";

export default function SignupPage() {
  const navigate = useNavigate();
  const { data: settings } = usePlatformSettings();
  const schoolEnabled = settings?.school_accounts_enabled ?? true;

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    accountType: "family" as "family" | "school",
  });
  const [agreeTerms, setAgreeTerms] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error("Please enter your name."); return; }
    if (!form.email.trim()) { toast.error("Please enter your email."); return; }
    if (form.password.length < 8) { toast.error("Password must be at least 8 characters."); return; }
    if (form.password !== form.confirmPassword) { toast.error("Passwords do not match."); return; }
    if (!agreeTerms) { toast.error("Please agree to the Terms."); return; }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.password,
      options: {
        data: {
          display_name: form.name.trim(),
          role: form.accountType,
          account_type: form.accountType,
        },
        emailRedirectTo: window.location.origin,
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Account created! Welcome aboard.");
      navigate("/dashboard");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.1, stiffness: 200 }} className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full gradient-hero shadow-glow">
            <ShieldCheck className="h-10 w-10 text-primary-foreground" />
          </motion.div>
          <h1 className="text-3xl font-bold text-foreground">Create Your Account</h1>
          <p className="mx-auto mt-3 max-w-sm text-muted-foreground">Get started with Cyber Hero Academy.</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-5 rounded-2xl border border-border bg-card p-7 shadow-card">
          <div>
            <Label className="text-sm font-semibold">Account Type</Label>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <button
                type="button"
                onClick={() => setForm({ ...form, accountType: "family" })}
                className={`rounded-xl border-2 p-3 text-left transition-colors ${form.accountType === "family" ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/30"}`}
              >
                <p className="font-semibold text-foreground text-sm">👨‍👩‍👧 Family</p>
                <p className="text-xs text-muted-foreground">For home use</p>
              </button>
              {schoolEnabled ? (
                <button
                  type="button"
                  onClick={() => setForm({ ...form, accountType: "school" })}
                  className={`rounded-xl border-2 p-3 text-left transition-colors ${form.accountType === "school" ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/30"}`}
                >
                  <p className="font-semibold text-foreground text-sm">🏫 School / Teacher</p>
                  <p className="text-xs text-muted-foreground">For classrooms</p>
                </button>
              ) : (
                <div className="rounded-xl border-2 border-dashed border-border p-3 text-left opacity-60">
                  <p className="font-semibold text-foreground text-sm">🏫 School / Teacher</p>
                  <p className="text-xs text-muted-foreground">Coming soon</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="name" className="flex items-center gap-2 text-sm font-semibold text-foreground"><User className="h-4 w-4 text-primary" /> Full Name</Label>
            <Input id="name" placeholder="Your full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="name" maxLength={100} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="flex items-center gap-2 text-sm font-semibold text-foreground"><Mail className="h-4 w-4 text-primary" /> Email Address</Label>
            <Input id="email" type="email" placeholder="your@email.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" maxLength={255} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="flex items-center gap-2 text-sm font-semibold text-foreground"><LockIcon className="h-4 w-4 text-primary" /> Password</Label>
            <Input id="password" type="password" placeholder="At least 8 characters" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} autoComplete="new-password" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword" className="flex items-center gap-2 text-sm font-semibold text-foreground"><CheckCircle2 className="h-4 w-4 text-primary" /> Confirm Password</Label>
            <Input id="confirmPassword" type="password" placeholder="Re-enter your password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} autoComplete="new-password" />
            {form.confirmPassword && form.password !== form.confirmPassword && <p className="mt-1 text-xs text-destructive">Passwords do not match</p>}
          </div>

          <div className="flex items-start gap-3 pt-1">
            <Checkbox id="terms" checked={agreeTerms} onCheckedChange={(v) => setAgreeTerms(v === true)} className="mt-0.5" />
            <Label htmlFor="terms" className="text-sm leading-snug text-muted-foreground cursor-pointer">
              I agree to the <Link to="/terms" className="font-semibold text-primary hover:underline">Terms</Link> and <Link to="/privacy" className="font-semibold text-primary hover:underline">Privacy Policy</Link>
            </Label>
          </div>

          <Button type="submit" variant="hero" size="lg" className="w-full text-base" disabled={loading}>
            <Shield className="mr-2 h-5 w-5" />
            {loading ? "Creating Account..." : "Create Account"}
          </Button>

          <p className="pt-1 text-center text-sm text-muted-foreground">
            Already have an account? <Link to="/login" className="font-semibold text-primary hover:underline">Log in</Link>
          </p>
        </form>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Shield className="h-3.5 w-3.5" />
          <span>Your data is encrypted and kept safe</span>
        </motion.div>
      </motion.div>
    </div>
  );
}
