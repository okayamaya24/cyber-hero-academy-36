import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Mail, Lock as LockIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import RoleSelectorModal from "@/components/RoleSelectorModal";
import ParentPinModal from "@/components/ParentPinModal";

type ModalStep = "none" | "role" | "pin";

export default function LoginPage() {
  const navigate = useNavigate();
  const { user, setActiveChildId, setParentUnlocked, setJustLoggedIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [modalStep, setModalStep] = useState<ModalStep>("none");
  const [pinError, setPinError] = useState<string | null>(null);
  const [pinLoading, setPinLoading] = useState(false);

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
      setModalStep("role");
    }
  };

  const handleChildMode = () => {
    setModalStep("none");
    setJustLoggedIn(false);
    navigate("/select-child");
  };

  const handleParentMode = () => {
    setPinError(null);
    setModalStep("pin");
  };

  const handlePinUnlock = async (pin: string) => {
    setPinLoading(true);
    setPinError(null);

    // Fetch the parent's PIN from profiles
    const { data: session } = await supabase.auth.getSession();
    const userId = session?.session?.user?.id;
    if (!userId) {
      setPinError("Session error. Please log in again.");
      setPinLoading(false);
      return;
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("parent_pin")
      .eq("user_id", userId)
      .single();

    setPinLoading(false);

    if (error || !profile) {
      setPinError("Could not verify PIN. Please try again.");
      return;
    }

    if ((profile as any).parent_pin === pin) {
      setParentUnlocked(true);
      setModalStep("none");
      setJustLoggedIn(false);
      navigate("/parent-dashboard");
    } else {
      setPinError("Incorrect PIN. Please try again.");
    }
  };

  // If user is already logged in and lands on login page, show role selector
  if (user && modalStep === "none") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.1, stiffness: 200 }}
            className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full gradient-hero shadow-glow"
          >
            <Shield className="h-8 w-8 text-primary-foreground" />
          </motion.div>
          <h1 className="text-2xl font-bold mb-2">You're already logged in!</h1>
          <p className="text-muted-foreground mb-6">Choose how to continue:</p>
          <div className="flex justify-center gap-4">
            <Button variant="hero" size="lg" onClick={() => setModalStep("role")}>
              Choose Mode
            </Button>
          </div>
        </motion.div>
        <RoleSelectorModal open={false} onSelectChild={handleChildMode} onSelectParent={handleParentMode} />
      </div>
    );
  }

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

        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-foreground">Welcome Back!</h1>
          <p className="mt-2 text-muted-foreground">
            Log in to continue your cyber adventure.
          </p>
        </div>

        {/* Login Form */}
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

      {/* Modals */}
      <RoleSelectorModal
        open={modalStep === "role"}
        onSelectChild={handleChildMode}
        onSelectParent={handleParentMode}
      />
      <ParentPinModal
        open={modalStep === "pin"}
        onBack={() => setModalStep("role")}
        onUnlock={handlePinUnlock}
        error={pinError}
        loading={pinLoading}
      />
    </div>
  );
}
