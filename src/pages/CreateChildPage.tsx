import { useState } from "react";
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
import { ArrowLeft } from "lucide-react";

function getDifficultyFromAge(age: number): string {
  if (age <= 7) return "easy";
  if (age <= 10) return "medium";
  return "hard";
}

export default function CreateChildPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [step, setStep] = useState<"info" | "hero">("info");
  const [childName, setChildName] = useState("");
  const [childAge, setChildAge] = useState("");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; age?: string }>({});

  const validate = (): boolean => {
    const newErrors: { name?: string; age?: string } = {};
    const trimmed = childName.trim();
    if (!trimmed) newErrors.name = "Name is required";
    else if (trimmed.length > 50) newErrors.name = "Name must be less than 50 characters";

    const ageNum = parseInt(childAge, 10);
    if (!childAge) newErrors.age = "Age is required";
    else if (isNaN(ageNum) || ageNum < 5 || ageNum > 12) newErrors.age = "Age must be between 5 and 12";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      setStep("hero");
    }
  };

  const handleSaveHero = async (config: CyberHeroConfig) => {
    if (!user) return;
    setSaving(true);

    const age = parseInt(childAge, 10);
    const difficulty = getDifficultyFromAge(age);

    const { error } = await supabase.from("child_profiles").insert({
      parent_id: user.id,
      name: childName.trim(),
      age,
      learning_mode: difficulty,
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

    setSaving(false);

    if (error) {
      toast.error("Failed to create child profile");
      return;
    }

    await queryClient.invalidateQueries({ queryKey: ["children", user.id] });
    toast.success(`${childName.trim()}'s hero has been created! 🎉`);
    navigate("/parent-dashboard");
  };

  if (step === "hero") {
    return <CyberHeroCreator onSave={handleSaveHero} saving={saving} childName={childName.trim()} />;
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto max-w-md px-4">
        <Button variant="ghost" size="sm" className="mb-6" onClick={() => navigate("/parent-dashboard")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border bg-card p-8 shadow-card"
        >
          <h1 className="mb-2 text-2xl font-bold">👶 Add a New Child</h1>
          <p className="mb-6 text-sm text-muted-foreground">
            Enter your child's details, then create their Cyber Hero!
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
                  if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                }}
              />
              {errors.name && <p className="mt-1 text-sm text-destructive">{errors.name}</p>}
            </div>

            <div>
              <Label htmlFor="child-age">Age (5–12)</Label>
              <Input
                id="child-age"
                type="number"
                min={5}
                max={12}
                placeholder="e.g. 8"
                value={childAge}
                onChange={(e) => {
                  setChildAge(e.target.value);
                  if (errors.age) setErrors((prev) => ({ ...prev, age: undefined }));
                }}
              />
              {errors.age && <p className="mt-1 text-sm text-destructive">{errors.age}</p>}
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
