import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ChevronRight, Lock, CheckCircle2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WORLDS, getDifficultyTier } from "@/data/adventureZones";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ByteSidekick from "@/components/adventure/ByteSidekick";
import VillainIntro from "@/components/adventure/VillainIntro";

export default function WorldZonesPage() {
  const { worldId } = useParams<{ worldId: string }>();
  const navigate = useNavigate();
  const { activeChildId } = useAuth();

  const [byteMessage, setByteMessage] = useState<string | null>(null);
  const [byteIntroShown, setByteIntroShown] = useState(false);
  const [villainIntroDone, setVillainIntroDone] = useState(false);
  const showVillainIntro = worldId === "north-america" && !villainIntroDone;

  const world = WORLDS.find((w) => w.id === worldId);

  const { data: child } = useQuery({
    queryKey: ["child", activeChildId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("child_profiles")
        .select("*")
        .eq("id", activeChildId!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!activeChildId,
  });

  const { data: zoneProgress = [] } = useQuery({
    queryKey: ["zone_progress", activeChildId, worldId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("zone_progress")
        .select("*")
        .eq("child_id", activeChildId!)
        .eq("continent_id", worldId!);
      if (error) throw error;
      return data;
    },
    enabled: !!activeChildId && !!worldId,
  });

  const tier = child ? getDifficultyTier(child.age) : "hero";

  // Show Byte intro when page loads (after villain intro if applicable)
  useEffect(() => {
    if (world && !byteIntroShown && villainIntroDone) {
      const timer = setTimeout(() => {
        setByteMessage(world.byteIntro[tier]);
        setByteIntroShown(true);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [world, tier, byteIntroShown, villainIntroDone]);

  // Auto-skip villain intro for non-NA worlds
  useEffect(() => {
    if (worldId !== "north-america") setVillainIntroDone(true);
  }, [worldId]);

  const handleByteDismiss = () => {
    setByteMessage(null);
  };

  if (!world) {
  };

  if (!world) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[hsl(220,30%,8%)]">
        <p className="text-white/60">World not found.</p>
      </div>
    );
  }

  // Determine zone lock status: zone is unlocked if it's the first, or the previous zone is completed
  const getZoneStatus = (zoneIndex: number, zoneId: string) => {
    const progress = zoneProgress.find((zp) => zp.zone_id === zoneId);
    if (progress?.status === "completed") return "completed" as const;
    if (zoneIndex === 0) return "unlocked" as const;
    // Check if previous zone is completed
    const prevZone = world.zones[zoneIndex - 1];
    if (prevZone) {
      const prevProgress = zoneProgress.find((zp) => zp.zone_id === prevZone.id);
      if (prevProgress?.status === "completed") return "unlocked" as const;
    }
    return "locked" as const;
  };

  return (
    <>
      {showVillainIntro && (
        <VillainIntro onComplete={() => setVillainIntroDone(true)} />
      )}
    <div className="relative min-h-screen bg-[hsl(220,30%,8%)] text-white overflow-hidden pb-32">
      {/* Header */}
      <div className={`relative bg-gradient-to-br ${world.color} py-8`}>
        <div className="container mx-auto flex items-center gap-4 px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/adventure")}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              {world.emoji} {world.name}
            </h1>
            <p className="mt-1 text-sm font-semibold text-white/70">
              Defeat {world.villainEmoji} {world.villain}
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-bold backdrop-blur">
            {world.totalZones} Zones + Boss
          </div>
        </div>
      </div>

      {/* Zone list */}
      <div className="container mx-auto mt-8 max-w-2xl space-y-4 px-4">
        {world.zones.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
            <p className="text-lg font-bold text-white/60">🚧 Zones coming soon!</p>
            <p className="mt-2 text-sm text-white/40">
              This world's missions are being prepared.
            </p>
          </div>
        )}

        {world.zones.map((zone, i) => {
          const status = getZoneStatus(i, zone.id);
          const progress = zoneProgress.find((zp) => zp.zone_id === zone.id);
          const stars = progress?.stars_earned ?? 0;
          const isLocked = status === "locked";
          const isCompleted = status === "completed";

          return (
            <motion.button
              key={zone.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={!isLocked ? { scale: 1.02, x: 4 } : {}}
              whileTap={!isLocked ? { scale: 0.98 } : {}}
              onClick={() => {
                if (!isLocked) navigate(`/adventure/${worldId}/${zone.id}`);
              }}
              disabled={isLocked}
              className={`group relative flex w-full items-center gap-4 rounded-2xl border p-5 text-left transition-all ${
                isLocked
                  ? "cursor-not-allowed border-white/5 bg-white/[0.02] opacity-50"
                  : isCompleted
                  ? "border-emerald-400/30 bg-emerald-400/5 hover:shadow-[0_0_20px_hsla(160,80%,48%,0.15)]"
                  : "border-cyan-400/20 bg-white/5 hover:border-cyan-400/40 hover:shadow-[0_0_20px_hsla(185,80%,48%,0.15)]"
              }`}
            >
              {/* Zone number / status icon */}
              <div
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl ${
                  isLocked
                    ? "bg-white/5 text-white/20"
                    : isCompleted
                    ? "bg-emerald-400/15 text-emerald-400"
                    : "bg-cyan-400/10 text-cyan-300"
                }`}
              >
                {isLocked ? (
                  <Lock className="h-6 w-6" />
                ) : isCompleted ? (
                  <CheckCircle2 className="h-7 w-7" />
                ) : (
                  zone.emoji
                )}
              </div>

              {/* Zone info */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white/30">
                    Zone {i + 1}
                  </span>
                  {isCompleted && (
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3].map((s) => (
                        <Star
                          key={s}
                          className={`h-3 w-3 ${
                            s <= stars ? "fill-amber-400 text-amber-400" : "text-white/20"
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
                <h3 className={`mt-0.5 font-bold ${isLocked ? "text-white/30" : "text-white"}`}>
                  {zone.name}
                </h3>
                <p className={`text-sm ${isLocked ? "text-white/15" : "text-white/50"}`}>
                  {zone.description}
                </p>
              </div>

              {/* Arrow */}
              {!isLocked && (
                <ChevronRight className="h-5 w-5 shrink-0 text-white/30 transition-colors group-hover:text-cyan-400" />
              )}
            </motion.button>
          );
        })}

        {/* Boss Battle placeholder */}
        {world.zones.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: world.zones.length * 0.1 }}
            className="flex w-full items-center gap-4 rounded-2xl border border-white/5 bg-white/[0.02] p-5 opacity-40"
          >
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/5 text-2xl text-white/20">
              <Lock className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/30">
                Boss Battle
              </span>
              <h3 className="mt-0.5 font-bold text-white/30">
                {world.villainEmoji} {world.villain}
              </h3>
              <p className="text-sm text-white/15">Complete all zones to unlock</p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Byte sidekick */}
      <ByteSidekick
        visible
        message={byteMessage ?? undefined}
        onDismiss={byteMessage ? handleByteDismiss : undefined}
        size={90}
      />
    </div>
    </>
  );
}
