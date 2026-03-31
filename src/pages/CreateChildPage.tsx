import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import CyberHeroCreator, { type CyberHeroConfig } from "@/components/avatar/CyberHeroCreator";
import { ArrowLeft, Copy, CheckCircle } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";

function getDifficultyFromAge(age: number): string {
  if (age <= 7) return "easy";
  if (age <= 10) return "medium";
  return "hard";
}

export default function CreateChildPage() {
  const { user, session, setActiveChildId } = useAuth();
  const { data: profile } = useProfile();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Detect if the logged-in user IS the kid (kid-mode)
  const isKidMode = profile?.role === "kid";

  const [step, setStep] = useState<"info" | "hero" | "success">("info");
  const [childName, setChildName] = useState("");
  const [childAge, setChildAge] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [createdKidId, setCreatedKidId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    age?: string;
    username?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  // In kid-mode, skip straight to hero builder
  useEffect(() => {
    if (isKidMode) {
      setStep("hero");
    }
  }, [isKidMode]);

  const suggestUsername = (name: string) => {
    const base = name.trim().toLowerCase().replace(/\s+/g, "");
    const age = parseInt(childAge, 10);
    return isNaN(age) ? base : `${base}${age}`;
  };

  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    const trimmed = childName.trim();
    if (!trimmed) newErrors.name = "Name is required";
    else if (trimmed.length > 50) newErrors.name = "Name must be less than 50 characters";

    const ageNum = parseInt(childAge, 10);
    if (!childAge) newErrors.age = "Age is required";
    else if (isNaN(ageNum) || ageNum < 5 || ageNum > 17) newErrors.age = "Age must be between 5 and 17";

    const u = username.trim().toLowerCase();
    if (!u) newErrors.username = "Username is required";
    else if (u.length < 3) newErrors.username = "Username must be at least 3 characters";
    else if (!/^[a-z0-9_.]+$/.test(u)) newErrors.username = "Only letters, numbers, dots and underscores";

    if (!password) newErrors.password = "Password is required";
    else if (password.length < 8) newErrors.password = "Password must be at least 8 characters";

    if (!confirmPassword) newErrors.confirmPassword = "Please confirm the password";
    else if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) setStep("hero");
  };

  // Kid-mode: save avatar to existing child_profiles row
  const handleKidModeSaveHero = async (config: CyberHeroConfig) => {
    if (!user) return;
    setSaving(true);
    try {
      const avatarConfig = {
        gender: config.gender,
        skin: config.skin,
        suitKey: config.suitKey,
        accessory: config.accessory,
        heroName: config.name,
        heroSrc: config.heroSrc,
      };

      const { error } = await supabase
        .from("child_profiles")
        .update({
          avatar_config: avatarConfig as any,
          avatar: config.gender === "girl" ? "👧" : "👦",
        })
        .eq("id", user.id);

      if (error) throw error;

      setActiveChildId(user.id);
      toast.success("Your Cyber Hero is ready! 🦸");
      navigate("/kid-dashboard", { replace: true });
    } catch (err: any) {
      toast.error("Failed to save hero: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveHero = async (config: CyberHeroConfig) => {
    // If kid-mode, use the simplified save
    if (isKidMode) {
      return handleKidModeSaveHero(config);
    }

    if (!user) return;
    setSaving(true);

    const age = parseInt(childAge, 10);
    const u = username.trim().toLowerCase();
    const fakeEmail = `${u}@cyberhero.app`;

    try {
      // Save parent session BEFORE creating kid account
      const parentAccessToken = session?.access_token;
      const parentRefreshToken = session?.refresh_token;

      // Step 1 — Create auth account for the kid
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: fakeEmail,
        password,
        options: {
          data: { name: childName.trim(), role: "kid" },
        },
      });

      if (signUpError) {
        if (signUpError.message.includes("already registered")) {
          toast.error("That username is already taken — try a different one");
        } else {
          toast.error("Failed to create account: " + signUpError.message);
        }
        setSaving(false);
        return;
      }

      const kidId = signUpData.user?.id;
      if (!kidId) throw new Error("No user ID returned");

      // Step 2 — Restore parent session immediately so inserts use parent's RLS
      if (parentAccessToken && parentRefreshToken) {
        await supabase.auth.setSession({
          access_token: parentAccessToken,
          refresh_token: parentRefreshToken,
        });
      }

      // Step 3 — Insert profiles row for kid
      await supabase.from("profiles").upsert({
        id: kidId,
        user_id: kidId,
        role: "kid",
        account_type: "kid",
        display_name: childName.trim(),
        email: fakeEmail,
      });

      // Step 4 — Insert child_profiles row
      await supabase.from("child_profiles").insert({
        id: kidId,
        parent_id: user.id,
        name: childName.trim(),
        age,
        learning_mode: "standard",
        avatar: config.gender === "girl" ? "👧" : "👦",
        avatar_config: {
          gender: config.gender,
          skin: config.skin,
          suitKey: config.suitKey,
          accessory: config.accessory,
          heroName: config.name,
          heroSrc: config.heroSrc,
        } as any,
      });

      // Step 5 — Insert parent_kid_links
      await supabase.from("parent_kid_links").insert({
        parent_id: user.id,
        kid_id: kidId,
      });

      setCreatedKidId(kidId);
      await queryClient.invalidateQueries({ queryKey: ["children", user.id] });
      toast.success(`${childName.trim()} can now log in with username: ${u}`);
      setStep("success");
    } catch (err: any) {
      toast.error("Something went wrong: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const copyCredentials = () => {
    navigator.clipboard.writeText(`Username: ${username.trim().toLowerCase()}\nPassword: ${password}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Success screen (parent mode only)
  if (step === "success") {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto max-w-md px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl border bg-card p-8 shadow-card text-center"
          >
            <div className="text-5xl mb-4">🎉</div>
            <h1 className="text-2xl font-bold mb-2">{childName}'s account is ready!</h1>
            <p className="text-sm text-muted-foreground mb-6">
              Write down or screenshot these login details to give to {childName}
            </p>

            <div className="rounded-xl bg-muted p-4 text-left mb-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Username</span>
                <span className="font-bold text-sm">{username.trim().toLowerCase()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Password</span>
                <span className="font-bold text-sm">{password}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Login at</span>
                <span className="font-bold text-sm text-primary">cyberhero.app/login</span>
              </div>
            </div>

            <Button variant="outline" className="w-full mb-3" onClick={copyCredentials}>
              {copied ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" /> Copy Login Details
                </>
              )}
            </Button>

            <Button variant="hero" className="w-full" onClick={() => navigate("/dashboard")}>
              Back to Dashboard
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  if (step === "hero") {
    return (
      <CyberHeroCreator
        onSave={handleSaveHero}
        saving={saving}
        childName={isKidMode ? (profile?.display_name || "Hero") : childName.trim()}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto max-w-md px-4">
        <Button variant="ghost" size="sm" className="mb-6" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border bg-card p-8 shadow-card"
        >
          <h1 className="mb-2 text-2xl font-bold">👶 Add a New Child</h1>
          <p className="mb-6 text-sm text-muted-foreground">
            Create a login for your child, then build their Cyber Hero!
          </p>

          <div className="space-y-4">
            <div>
              <Label htmlFor="child-name">Child's Name</Label>
              <Input
                id="child-name"
                placeholder="e.g. Sarah"
                maxLength={50}
                value={childName}
                onChange={(e) => {
                  setChildName(e.target.value);
                  setUsername(suggestUsername(e.target.value));
                  if (errors.name) setErrors((p) => ({ ...p, name: undefined }));
                }}
              />
              {errors.name && <p className="mt-1 text-sm text-destructive">{errors.name}</p>}
            </div>

            <div>
              <Label htmlFor="child-age">Age (5–17)</Label>
              <Input
                id="child-age"
                type="number"
                min={5}
                max={17}
                placeholder="e.g. 8"
                value={childAge}
                onChange={(e) => {
                  setChildAge(e.target.value);
                  if (errors.age) setErrors((p) => ({ ...p, age: undefined }));
                }}
              />
              {errors.age && <p className="mt-1 text-sm text-destructive">{errors.age}</p>}
            </div>

            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="e.g. sarah8"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value.toLowerCase().replace(/\s+/g, ""));
                  if (errors.username) setErrors((p) => ({ ...p, username: undefined }));
                }}
              />
              <p className="mt-1 text-xs text-muted-foreground">This is what your child types to log in</p>
              {errors.username && <p className="mt-1 text-sm text-destructive">{errors.username}</p>}
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Min 8 characters"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((p) => ({ ...p, password: undefined }));
                }}
              />
              {errors.password && <p className="mt-1 text-sm text-destructive">{errors.password}</p>}
            </div>

            <div>
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) setErrors((p) => ({ ...p, confirmPassword: undefined }));
                }}
              />
              {errors.confirmPassword && <p className="mt-1 text-sm text-destructive">{errors.confirmPassword}</p>}
            </div>

            <Button className="w-full" variant="hero" onClick={handleNext}>
              Next → Create Hero 🦸
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
