import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Mail, Lock as LockIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import robotGuide from "@/assets/robot-guide.png";

export default function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email.trim() || !form.password) {
      toast.error("Please fill in both fields.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: form.email.trim(),
      password: form.password,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Welcome back!");
      navigate("/parents");
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
            src={robotGuide}
            alt="Robo Buddy"
            className="mx-auto mb-4 h-20 w-20 object-contain"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.1 }}
          />
          <h1 className="text-3xl font-bold">Welcome Back!</h1>
          <p className="mt-2 text-muted-foreground">
            Log in to Cyber Hero Academy
          </p>
        </div>

        <form
          onSubmit={handleLogin}
          className="space-y-4 rounded-2xl border bg-card p-6 shadow-card"
        >
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
              placeholder="Your password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="mt-1.5"
              autoComplete="current-password"
            />
          </div>
          <Button
            type="submit"
            variant="hero"
            size="lg"
            className="w-full"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Log In"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/signup" className="font-semibold text-primary hover:underline">
              Sign Up
            </Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
}
