import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Mail, Lock as LockIcon, User, CheckCircle2 } from "lucide-react";
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
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <motion.img
            src={heroCharacter}
            alt="Cyber Hero"
            className="mx-auto mb-4 h-20 w-20 object-contain"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.1 }}
          />
          <h1 className="text-3xl font-bold">Join Cyber Hero Academy</h1>
          <p className="mt-2 text-muted-foreground">
            Create a parent account to get your kids started
          </p>
        </div>

        <form
          onSubmit={handleSignup}
          className="space-y-4 rounded-2xl border bg-card p-6 shadow-card"
        >
          <div>
            <Label htmlFor="name" className="flex items-center gap-2 text-sm font-semibold">
              <User className="h-4 w-4 text-primary" /> Full Name
            </Label>
            <Input
              id="name"
              placeholder="Your full name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1.5"
              autoComplete="name"
            />
          </div>
          <div>
            <Label htmlFor="email" className="flex items-center gap-2 text-sm font-semibold">
              <Mail className="h-4 w-4 text-primary" /> Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="parent@email.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="mt-1.5"
              autoComplete="email"
            />
          </div>
          <div>
            <Label htmlFor="password" className="flex items-center gap-2 text-sm font-semibold">
              <LockIcon className="h-4 w-4 text-primary" /> Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="At least 6 characters"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="mt-1.5"
              autoComplete="new-password"
            />
          </div>
          <div>
            <Label htmlFor="confirmPassword" className="flex items-center gap-2 text-sm font-semibold">
              <CheckCircle2 className="h-4 w-4 text-primary" /> Confirm Password
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Re-enter your password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              className="mt-1.5"
              autoComplete="new-password"
            />
            {form.confirmPassword && form.password !== form.confirmPassword && (
              <p className="mt-1 text-xs text-destructive">Passwords do not match</p>
            )}
          </div>
          <Button
            type="submit"
            variant="hero"
            size="lg"
            className="w-full"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Parent Account"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Log In
            </Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
}
