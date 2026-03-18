import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import CyberHeroCreator, { type CyberHeroConfig } from "@/components/avatar/CyberHeroCreator";

export default function EditAvatarPage() {
  const { user, activeChildId } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) navigate("/login");
    else if (!activeChildId) navigate("/select-child");
  }, [user, activeChildId, navigate]);

  const handleSave = async (config: CyberHeroConfig) => {
    if (!activeChildId) return;
    setSaving(true);

    const { error } = await supabase
      .from("child_profiles")
      .update({
        avatar: config.gender === "girl" ? "👧" : "👦",
        avatar_config: {
          gender: config.gender,
          skin: config.skin,
          suitKey: config.suitKey,
          accessory: config.accessory,
          heroName: config.name,
          heroSrc: config.heroSrc,
        } as any,
      })
      .eq("id", activeChildId);

    setSaving(false);

    if (error) {
      toast.error("Failed to update hero");
      return;
    }

    await queryClient.invalidateQueries({ queryKey: ["child", activeChildId] });
    toast.success("Hero updated! 🎉");
    navigate("/dashboard");
  };

  return <CyberHeroCreator onSave={handleSave} saving={saving} />;
}
