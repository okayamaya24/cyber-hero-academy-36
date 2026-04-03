import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { WORLDS, getDifficultyTier } from "@/data/adventureZones";
import ByteSidekick from "@/components/adventure/ByteSidekick";

export default function AdventureMapPage() {
  const navigate = useNavigate();
  const { activeChildId } = useAuth();
  const [byteMessage, setByteMessage] = useState<string | null>(null);
  const [pendingWorld, setPendingWorld] = useState<string | null>(null);

  const { data: child } = useQuery({
    queryKey: ["child", activeChildId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("child_profiles")
        .select("age")
        .eq("id", activeChildId!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!activeChildId,
  });

  const tier = child ? getDifficultyTier(child.age) : "hero";

  const handleWorldClick = (worldId: string) => {
    const world = WORLDS.find((w) => w.id === worldId);
    if (!world) return;
    setByteMessage(world.byteIntro[tier]);
    setPendingWorld(worldId);
  };

  const handleByteDismiss = () => {
    if (pendingWorld) {
      navigate(`/adventure/${pendingWorld}`);
    }
    setByteMessage(null);
    setPendingWorld(null);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="gradient-hero py-6">
        <div className="container mx-auto flex items-center gap-3 px-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")} className="text-primary-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-primary-foreground">Adventure Zone</h1>
            <p className="text-sm text-primary-foreground/80">Choose a world to explore</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto mt-8 grid gap-6 px-4 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence>
          {WORLDS.map((world, i) => (
            <motion.button
              key={world.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleWorldClick(world.id)}
              className={`group relative overflow-hidden rounded-3xl border-2 border-primary/20 bg-gradient-to-br ${world.color} p-6 text-left text-primary-foreground shadow-playful transition-shadow hover:shadow-glow`}
            >
              <span className="text-5xl">{world.emoji}</span>
              <h3 className="mt-3 text-xl font-bold">{world.name}</h3>
              <p className="mt-1 text-sm opacity-90">Villain: {world.villain}</p>
              <div className="mt-3 flex items-center gap-1 text-xs opacity-75">
                <MapPin className="h-3 w-3" />
                {world.zones.length} zone{world.zones.length !== 1 && "s"}
              </div>
              <div className="absolute -bottom-4 -right-4 text-8xl opacity-10 transition-transform group-hover:scale-110">
                {world.emoji}
              </div>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      <ByteSidekick
        visible={!!byteMessage}
        message={byteMessage ?? undefined}
        onDismiss={handleByteDismiss}
      />
    </div>
  );
}
