import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Calendar, ArrowRight, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import AvatarCreator from "@/components/avatar/AvatarCreator";
import { type AvatarConfig, DEFAULT_AVATAR } from "@/components/avatar/avatarConfig";
import heroCharacter from "@/assets/hero-character.png";
import wiseOwl from "@/assets/wise-owl.png";

export default function CreateChildPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<"info" | "avatar">("info");
  const [form, setForm] = useState({ name: "", age: "" });
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig>(DEFAULT_AVATAR);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  const handleInfoNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Please enter your child's name.");
      return;
    }
    const age = parseInt(form.age);
    if (!form.age || isNaN(age) || age < 3 || age > 15) {
      toast.error("Please enter a valid age (3–15).");
      return;
    }
    setStep("avatar");
  };

  const handleSaveAvatar = async (config: AvatarConfig) => {
    setAvatarConfig(config);
    setCreating(true);
    const age = parseInt(form.age);

    const { error } = await supabase.from("child_profiles").insert({
      parent_id: user!.id,
      name: form.name.trim(),
      age,
      avatar: config.characterType === "robot" ? "🤖" : config.characterType === "girl" ? "🦸‍♀️" : "🦸",
      avatar_config: config as any,
    });

    setCreating(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(`${form.name}'s Cyber Hero is ready! 🎉`);
      queryClient.invalidateQueries({ queryKey: ["children"] });
      navigate("/parents");
    }
  };

  if (step === "avatar") {
    return (
      <div className="min-h-screen bg-background px-4 py-8">
        <div className="mx-auto max-w-lg">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Button variant="ghost" className="mb-4" onClick={() => setStep("info")}>
              <ArrowLeft className="mr-1 h-4 w-4" /> Back
            </Button>

            <div className="mb-6 text-center">
              <h1 className="text-2xl font-bold">Create {form.name}'s Hero!</h1>
              <p className="mt-1 text-muted-foreground">Customize your Cyber Hero avatar</p>
            </div>

            <AvatarCreator
              initialConfig={avatarConfig}
              onSave={handleSaveAvatar}
              saving={creating}
            />
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <div className="relative mx-auto mb-4 flex justify-center">
            <motion.img src={heroCharacter} alt="Cyber Hero" className="h-24 w-24 object-contain" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 }} />
            <motion.img src={wiseOwl} alt="Professor Hoot" className="h-24 w-24 object-contain -ml-4" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }} />
          </div>
          <h1 className="text-3xl font-bold">Create Your Cyber Hero!</h1>
          <p className="mt-2 text-muted-foreground">Set up your child's hero profile to start learning</p>
        </div>

        <form onSubmit={handleInfoNext} className="space-y-6 rounded-2xl border bg-card p-6 shadow-card">
          <div>
            <Label htmlFor="childName" className="flex items-center gap-2 text-sm font-semibold">
              <User className="h-4 w-4 text-primary" /> Child's Name
            </Label>
            <Input
              id="childName"
              placeholder="Enter your child's name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="childAge" className="flex items-center gap-2 text-sm font-semibold">
              <Calendar className="h-4 w-4 text-primary" /> Age
            </Label>
            <Input
              id="childAge"
              type="number"
              min={3}
              max={15}
              placeholder="5–12 years old"
              value={form.age}
              onChange={(e) => setForm({ ...form, age: e.target.value })}
              className="mt-1.5"
            />
          </div>

          <Button type="submit" variant="hero" size="lg" className="w-full">
            Next: Create Avatar <ArrowRight className="ml-2 h-5 w-5" />
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            You can add more children later from the Parent Dashboard
          </p>
        </form>
      </motion.div>
    </div>
  );
}
