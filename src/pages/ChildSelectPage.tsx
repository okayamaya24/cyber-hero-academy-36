import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Shield, Gamepad2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import type { Tables } from "@/integrations/supabase/types";
import AvatarRenderer from "@/components/avatar/AvatarRenderer";
import type { AvatarConfig } from "@/components/avatar/avatarConfig";

type ChildProfile = Tables<"child_profiles">;

export default function ChildSelectPage() {
  const { user, setActiveChildId } = useAuth();
  const navigate = useNavigate();

  const { data: children = [], isLoading } = useQuery({
    queryKey: ["children", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("child_profiles")
        .select("*")
        .eq("parent_id", user!.id)
        .order("created_at");
      if (error) throw error;
      return data as ChildProfile[];
    },
    enabled: !!user,
  });

  const selectChild = (child: ChildProfile) => {
    setActiveChildId(child.id);
    navigate("/dashboard");
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md text-center"
        >
          <Gamepad2 className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
          <h1 className="text-2xl font-bold">No Heroes Yet!</h1>
          <p className="mt-2 text-muted-foreground">
            Ask your parent to create your hero profile from the Parent Dashboard.
          </p>
          <Button variant="outline" className="mt-4" onClick={() => navigate("/parent-dashboard")}>
            Go to Parent Dashboard
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg text-center"
      >
        <Shield className="mx-auto mb-4 h-12 w-12 text-primary" />
        <h1 className="text-3xl font-bold">Who's Playing?</h1>
        <p className="mt-2 mb-8 text-muted-foreground">
          Choose your Cyber Hero profile
        </p>

        <div className="grid grid-cols-2 gap-4">
          {children.map((child) => (
            <motion.button
              key={child.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => selectChild(child)}
              className="flex flex-col items-center gap-2 rounded-2xl border-2 bg-card p-6 shadow-card transition-colors hover:border-primary hover:shadow-playful"
            >
              <AvatarRenderer
                config={(child as any).avatar_config as AvatarConfig | null}
                size={80}
                fallbackEmoji={child.avatar}
              />
              <span className="text-lg font-bold">{child.name}</span>
              <span className="text-xs text-muted-foreground">
                Level {child.level} · {child.points} pts
              </span>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
