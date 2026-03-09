import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Mail, Lock as LockIcon, Sparkles, Rocket, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import type { Tables } from "@/integrations/supabase/types";

type ChildProfile = Tables<"child_profiles">;
type AuthMode = "parent" | "child";

export default function LoginPage() {
  const navigate = useNavigate();
  const { user, setActiveChildId } = useAuth();
  const [mode, setMode] = useState<AuthMode>("parent");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  // Fetch children when user is logged in and in child mode
  const { data: children = [], isLoading: childrenLoading } = useQuery({
    queryKey: ["children-login", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("child_profiles")
        .select("*")
        .eq("parent_id", user!.id)
        .order("created_at");
      if (error) throw error;
      return data as ChildProfile[];
    },
    enabled: !!user && mode === "child",
  });

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

  const selectChild = (child: ChildProfile) => {
    setActiveChildId(child.id);
    navigate("/dashboard");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        {/* Brand Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.1, stiffness: 200 }}
          className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full gradient-hero shadow-glow"
        >
          <Shield className="h-8 w-8 text-primary-foreground" />
        </motion.div>

        {/* Toggle */}
        <div className="mx-auto mb-8 flex w-fit rounded-full border border-border bg-muted p-1 shadow-sm">
          <button
            onClick={() => setMode("parent")}
            className={`flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold transition-all ${
              mode === "parent"
                ? "bg-card text-foreground shadow-card"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            Parent
          </button>
          <button
            onClick={() => setMode("child")}
            className={`flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold transition-all ${
              mode === "child"
                ? "bg-card text-foreground shadow-card"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Rocket className="h-4 w-4" />
            Child
          </button>
        </div>

        <AnimatePresence mode="wait">
          {mode === "parent" ? (
            <motion.div
              key="parent"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25 }}
            >
              {/* Parent Header */}
              <div className="mb-6 text-center">
                <h1 className="text-3xl font-bold text-foreground">Parent Login</h1>
                <p className="mt-2 text-muted-foreground">
                  Log in to manage your child's learning journey.
                </p>
              </div>

              {/* Parent Form */}
              <form
                onSubmit={handleLogin}
                className="space-y-5 rounded-2xl border border-border bg-card p-7 shadow-card"
              >
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
                <Button
                  type="submit"
                  variant="hero"
                  size="lg"
                  className="w-full text-base"
                  disabled={loading}
                >
                  {loading ? "Logging in..." : "Login"}
                </Button>
                <div className="flex items-center justify-between pt-1 text-sm">
                  <Link to="/signup" className="font-semibold text-primary hover:underline">
                    Create Parent Account
                  </Link>
                  <button
                    type="button"
                    className="font-semibold text-muted-foreground hover:text-foreground hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="child"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              {/* Child Header */}
              <div className="mb-6 text-center">
                <h1 className="text-3xl font-bold text-foreground">
                  Child Login{" "}
                  <Sparkles className="inline h-6 w-6 text-accent" />
                </h1>
                <p className="mt-2 text-muted-foreground">
                  Choose your profile and continue your cyber adventure.
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-card p-7 shadow-card">
                {!user ? (
                  /* Parent must log in first */
                  <div className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                      <Shield className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="mb-1 font-semibold text-foreground">Parent login required</p>
                    <p className="mb-5 text-sm text-muted-foreground">
                      A parent needs to log in first so we can load the hero profiles.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => setMode("parent")}
                      className="mx-auto"
                    >
                      Switch to Parent Login
                    </Button>
                  </div>
                ) : childrenLoading ? (
                  <div className="py-8 text-center text-muted-foreground">Loading heroes...</div>
                ) : children.length === 0 ? (
                  /* No children */
                  <div className="py-4 text-center">
                    <div className="mx-auto mb-4 text-5xl">🦸</div>
                    <p className="mb-1 font-semibold text-foreground">No Heroes Yet!</p>
                    <p className="mb-5 text-sm text-muted-foreground">
                      Create a hero profile from the Parent Dashboard first.
                    </p>
                    <Button variant="hero" onClick={() => navigate("/parents")}>
                      Go to Parent Dashboard
                    </Button>
                  </div>
                ) : (
                  /* Child cards */
                  <div className="grid grid-cols-2 gap-4">
                    {children.map((child, i) => (
                      <motion.button
                        key={child.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => selectChild(child)}
                        className="flex flex-col items-center gap-2 rounded-2xl border-2 border-border bg-background p-5 shadow-sm transition-colors hover:border-primary hover:shadow-playful"
                      >
                        <span className="text-5xl">{child.avatar}</span>
                        <span className="text-base font-bold text-foreground">{child.name}</span>
                        <span className="text-xs text-muted-foreground">
                          Age {child.age} · Level {child.level}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>

              {user && children.length > 0 && (
                <p className="mt-4 text-center text-xs text-muted-foreground">
                  Tap your hero to enter the adventure!
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer trust badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground"
        >
          <Shield className="h-3.5 w-3.5" />
          <span>Cyber Hero Academy · Safe &amp; Secure</span>
        </motion.div>
      </motion.div>
    </div>
  );
}
