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
import heroCharacter from "@/assets/hero-character.png";

export default function SignupPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [confirmParent, setConfirmParent] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Please enter your name.");
      return;
    }
    if (!form.email.trim()) {
      toast.error("Please enter your email.");
      return;
    }
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (!agreeTerms) {
      toast.error("Please agree to the Terms and Privacy Policy.");
      return;
    }
    if (!confirmParent) {
      toast.error("Please confirm you are a parent or guardian.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.password,
      options: {
        data: { display_name: form.name.trim() },
        emailRedirectTo: window.location.origin,
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Account created! Let's set up your child's profile.");
      navigate("/create-child");
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
        {/* Header */}
        <div className="mb-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.1, stiffness: 200 }}
            className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full gradient-hero shadow-glow"
          >
            <ShieldCheck className="h-10 w-10 text-primary-foreground" />
          </motion.div>
          <h1 className="text-3xl font-bold text-foreground md:text-4xl">
            Create Your Parent Account
          </h1>
          <p className="mx-auto mt-3 max-w-sm text-muted-foreground">
            Set up your family's Cyber Hero Academy account to track learning, missions, and progress.
          </p>
        </div>

        {/* Card */}
        <form
          onSubmit={handleSignup}
          className="space-y-5 rounded-2xl border border-border bg-card p-7 shadow-card"
        >
          {/* Full Name */}
          <div className="space-y-1.5">
            <Label htmlFor="name" className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <User className="h-4 w-4 text-primary" /> Full Name
            </Label>
            <Input
              id="name"
              placeholder="Your full name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              autoComplete="name"
              maxLength={100}
            />
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="email" className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Mail className="h-4 w-4 text-primary" /> Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="parent@email.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              autoComplete="email"
              maxLength={255}
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <Label htmlFor="password" className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <LockIcon className="h-4 w-4 text-primary" /> Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="At least 6 characters"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              autoComplete="new-password"
            />
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword" className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <CheckCircle2 className="h-4 w-4 text-primary" /> Confirm Password
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Re-enter your password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              autoComplete="new-password"
            />
            {form.confirmPassword && form.password !== form.confirmPassword && (
              <p className="mt-1 text-xs text-destructive">Passwords do not match</p>
            )}
          </div>

          {/* Checkboxes */}
          <div className="space-y-3 pt-1">
            <div className="flex items-start gap-3">
              <Checkbox
                id="terms"
                checked={agreeTerms}
                onCheckedChange={(v) => setAgreeTerms(v === true)}
                className="mt-0.5"
              />
              <Label htmlFor="terms" className="text-sm leading-snug text-muted-foreground cursor-pointer">
                I agree to the{" "}
                <span className="font-semibold text-primary hover:underline cursor-pointer">Terms</span> and{" "}
                <span className="font-semibold text-primary hover:underline cursor-pointer">Privacy Policy</span>
              </Label>
            </div>
            <div className="flex items-start gap-3">
              <Checkbox
                id="guardian"
                checked={confirmParent}
                onCheckedChange={(v) => setConfirmParent(v === true)}
                className="mt-0.5"
              />
              <Label htmlFor="guardian" className="text-sm leading-snug text-muted-foreground cursor-pointer">
                I confirm I am a parent or guardian
              </Label>
            </div>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            variant="hero"
            size="lg"
            className="w-full text-base"
            disabled={loading}
          >
            <Shield className="mr-2 h-5 w-5" />
            {loading ? "Creating Account..." : "Create Parent Account"}
          </Button>

          {/* Login link */}
          <p className="pt-1 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Log in
            </Link>
          </p>
        </form>

        {/* Footer trust badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground"
        >
          <Shield className="h-3.5 w-3.5" />
          <span>Your data is encrypted and kept safe</span>
        </motion.div>
      </motion.div>
    </div>
  );
}
