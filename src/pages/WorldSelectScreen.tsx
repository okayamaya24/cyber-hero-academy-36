import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Shield, Zap, Globe, MessageCircle, ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { CONTINENTS, type ContinentDef } from "@/data/continents";
import HeroAvatar from "@/components/avatar/HeroAvatar";
import VillainSprite from "@/components/world/VillainSprite";
import StarfieldBackground from "@/components/world/StarfieldBackground";
import { Progress } from "@/components/ui/progress";

/* ─── HUD Bar ────────────────────────────────────────────── */
function HUDBar({ playerName, level, points, worldsCompleted }: {
  playerName: string; level: number; points: number; worldsCompleted: number;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-[hsl(195_80%_50%/0.2)] bg-[hsl(210_40%_14%/0.8)] px-3 py-1.5 backdrop-blur-md shadow-lg">
      <div className="flex items-center gap-3 text-[10px]">
        <span className="flex items-center gap-1 text-[hsl(195_80%_70%)] font-bold">
          <Globe className="h-3 w-3" />
          <span className="text-white">{playerName}</span>
        </span>
        <span className="hidden sm:flex items-center gap-1 text-[hsl(160_70%_60%)]">
          <Zap className="h-3 w-3" />
          LVL {level} · {points} XP
        </span>
      </div>
      <span className="flex items-center gap-1 text-[10px] text-[hsl(195_80%_70%)]">
        <Shield className="h-3 w-3" />
        WORLDS: <span className="font-bold text-white">{worldsCompleted}/7</span>
      </span>
    </div>
  );
}

/* ─── Globe Animation (compact) ──────────────────────────── */
function GlobeAnimation() {
  return (
    <div className="relative mx-auto flex items-center justify-center h-32 w-32 md:h-40 md:w-40">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 60, ease: "linear" }}
        className="relative h-full w-full"
      >
        <div className="absolute inset-0 rounded-full border border-[hsl(195_80%_50%/0.12)]" />
        <div className="absolute inset-[18%] rounded-full border border-[hsl(195_80%_50%/0.08)]" />
        <div className="absolute top-0 bottom-0 left-1/2 w-px bg-[hsl(195_80%_50%/0.06)]" />
        <div className="absolute left-0 right-0 top-1/2 h-px bg-[hsl(195_80%_50%/0.06)]" />
      </motion.div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-20 w-20 rounded-full bg-[hsl(195_80%_50%/0.03)] blur-2xl" />
      </div>
    </div>
  );
}

/* ─── Continent Card (compact) ───────────────────────────── */
function ContinentCard({ continent, status, zonesCompleted, onClick }: {
  continent: ContinentDef;
  status: "locked" | "in_progress" | "completed";
  zonesCompleted: number;
  onClick: () => void;
}) {
  const isAntarctica = continent.id === "antarctica";
  const isLocked = status === "locked";
  const totalZones = continent.zones.filter(z => !z.isBoss && !z.isHQ).length;
  const progress = totalZones > 0 ? (zonesCompleted / totalZones) * 100 : 0;

  return (
    <motion.button
      onClick={onClick}
      disabled={isLocked}
      whileHover={!isLocked ? { scale: 1.06, y: -3 } : {}}
      whileTap={!isLocked ? { scale: 0.97 } : {}}
      className={`relative flex flex-col items-center gap-1 rounded-xl border p-2.5 w-full backdrop-blur-md transition-all duration-300 ${
        isLocked
          ? "border-white/5 bg-[hsl(210_40%_14%/0.4)] opacity-50 cursor-not-allowed"
          : status === "completed"
            ? "border-[hsl(160_65%_50%/0.4)] bg-[hsl(160_65%_20%/0.2)] hover:shadow-[0_0_20px_hsl(160_65%_50%/0.2)]"
            : "border-[hsl(195_80%_50%/0.3)] bg-[hsl(210_40%_14%/0.6)] hover:shadow-[0_0_20px_hsl(195_80%_50%/0.2)] hover:border-[hsl(195_80%_50%/0.5)]"
      }`}
    >
      {/* Ice overlay for Antarctica */}
      {isAntarctica && isLocked && (
        <div className="absolute inset-0 rounded-xl overflow-hidden">
          <div className="absolute inset-0 bg-[hsl(200_40%_85%/0.04)]" />
        </div>
      )}

      <span className="text-2xl leading-none">{continent.emoji}</span>
      <h3 className="text-[10px] font-bold text-white text-center leading-tight">{continent.name}</h3>

      <div className="flex items-center gap-1">
        <VillainSprite villainName={continent.villain} size={20} />
        <span className="text-[7px] font-bold text-[hsl(0_80%_65%)] leading-tight max-w-[80px] truncate">
          {continent.villain.toUpperCase()}
        </span>
      </div>

      <p className="text-[8px] text-white/30">{totalZones} Zones + Boss</p>

      {!isLocked && (
        <div className="w-full">
          <Progress value={progress} className="h-1 bg-white/10" />
        </div>
      )}

      <span className={`rounded-full px-1.5 py-0.5 text-[7px] font-bold ${
        status === "completed"
          ? "bg-[hsl(160_65%_50%/0.2)] text-[hsl(160_65%_60%)]"
          : status === "in_progress"
            ? "bg-[hsl(195_80%_50%/0.15)] text-[hsl(195_80%_65%)]"
            : "bg-white/5 text-white/30"
      }`}>
        {status === "completed" ? "✅ DONE" : status === "in_progress" ? "🔵 ACTIVE" : "🔒"}
      </span>

      {isAntarctica && isLocked && (
        <p className="text-[6px] text-white/20 text-center leading-tight">
          Defeat all 6 villains
        </p>
      )}
    </motion.button>
  );
}

/* ─── Main World Select Screen ───────────────────────────── */
export default function WorldSelectScreen() {
  const { user, activeChildId } = useAuth();
  const navigate = useNavigate();
  const [guideMessage, setGuideMessage] = useState("Choose a world to begin your mission, Guardian! 🌍");
  const [idleIdx, setIdleIdx] = useState(0);

  useEffect(() => {
    if (!user) navigate("/login");
    else if (!activeChildId) navigate("/select-child");
  }, [user, activeChildId, navigate]);

  const { data: child } = useQuery({
    queryKey: ["child", activeChildId],
    queryFn: async () => {
      const { data, error } = await supabase.from("child_profiles").select("*").eq("id", activeChildId!).single();
      if (error) throw error;
      return data;
    },
    enabled: !!activeChildId,
  });

  const { data: continentProgress = [] } = useQuery({
    queryKey: ["continent_progress", activeChildId],
    queryFn: async () => {
      const { data, error } = await supabase.from("continent_progress").select("*").eq("child_id", activeChildId!);
      if (error) throw error;
      return data;
    },
    enabled: !!activeChildId,
  });

  const level = child?.level ?? 1;
  const points = child?.points ?? 0;
  const avatarConfig = child?.avatar_config as Record<string, any> | null;
  const playerName = child?.name ?? "Guardian";

  const continentStatuses = useMemo(() => {
    const map: Record<string, { status: "locked" | "in_progress" | "completed"; zonesCompleted: number; bossDefeated: boolean }> = {};
    for (const c of CONTINENTS) {
      const progress = continentProgress.find((p: any) => p.continent_id === c.id);
      if (c.unlockOrder === 0) {
        map[c.id] = { status: progress?.status === "completed" ? "completed" : "in_progress", zonesCompleted: progress?.zones_completed ?? 0, bossDefeated: progress?.boss_defeated ?? false };
      } else if (c.unlockOrder === 6) {
        const allBossesDefeated = CONTINENTS.filter(cc => cc.unlockOrder >= 0 && cc.unlockOrder < 6).every(cc => continentProgress.find((pr: any) => pr.continent_id === cc.id)?.boss_defeated === true);
        map[c.id] = { status: allBossesDefeated ? (progress?.status === "completed" ? "completed" : "in_progress") : "locked", zonesCompleted: progress?.zones_completed ?? 0, bossDefeated: progress?.boss_defeated ?? false };
      } else {
        const prev = CONTINENTS.find(cc => cc.unlockOrder === c.unlockOrder - 1);
        const prevProgress = prev ? continentProgress.find((p: any) => p.continent_id === prev.id) : null;
        const unlocked = prevProgress?.boss_defeated === true;
        map[c.id] = { status: unlocked ? (progress?.status === "completed" ? "completed" : "in_progress") : "locked", zonesCompleted: progress?.zones_completed ?? 0, bossDefeated: progress?.boss_defeated ?? false };
      }
    }
    return map;
  }, [continentProgress]);

  const worldsCompleted = Object.values(continentStatuses).filter(s => s.status === "completed").length;

  const handleContinentClick = (continent: ContinentDef) => {
    const s = continentStatuses[continent.id];
    if (s?.status === "locked") {
      setGuideMessage("That world is still locked! Complete the previous world first. 🔒");
      return;
    }
    navigate(continent.route);
  };

  const IDLE_MSGS = [
    "Choose a world to begin your mission, Guardian! 🌍",
    "Each world has a villain to defeat! 💪",
    "Complete zones to face the boss battle! ⚔️",
    "You're an amazing cyber hero! 🌟",
  ];

  const cycleIdle = useCallback(() => {
    const next = (idleIdx + 1) % IDLE_MSGS.length;
    setIdleIdx(next);
    setGuideMessage(IDLE_MSGS[next]);
  }, [idleIdx]);

  // Split into rows: 4 top, 3 bottom
  const topRow = CONTINENTS.slice(0, 4);
  const bottomRow = CONTINENTS.slice(4, 7);

  return (
    <div className="h-screen relative overflow-hidden flex flex-col" style={{ background: "#050a14" }}>
      <StarfieldBackground />
      <div className="pointer-events-none absolute inset-0 z-[1]" style={{
        background: "repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(195 80% 60% / 0.015) 2px, hsl(195 80% 60% / 0.015) 4px)",
      }} />

      <div className="relative z-[2] flex flex-col flex-1 mx-auto max-w-6xl px-4 py-3 overflow-hidden">
        <HUDBar playerName={playerName} level={level} points={points} worldsCompleted={worldsCompleted} />

        {/* Title + Globe row */}
        <div className="flex items-center justify-center gap-4 my-2">
          <GlobeAnimation />
          <div>
            <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-lg md:text-xl font-bold text-white tracking-wide">
              🌍 CYBER HERO ACADEMY
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
              className="text-[10px] text-[hsl(195_80%_65%)] font-bold">
              SELECT YOUR WORLD
            </motion.p>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
              className="text-[9px] text-[hsl(45_90%_65%/0.7)] mt-0.5">
              🏆 Complete all worlds for the Master Certificate!
            </motion.p>
          </div>
        </div>

        {/* Continent Cards — 4 top + 3 bottom centered */}
        <div className="flex-1 flex flex-col justify-center gap-3 max-w-4xl mx-auto w-full">
          {/* Top row: 4 cards */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="grid grid-cols-4 gap-3">
            {topRow.map((continent, i) => {
              const s = continentStatuses[continent.id] || { status: "locked", zonesCompleted: 0, bossDefeated: false };
              return (
                <motion.div key={continent.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.06 }}>
                  <ContinentCard continent={continent} status={s.status as any} zonesCompleted={s.zonesCompleted} onClick={() => handleContinentClick(continent)} />
                </motion.div>
              );
            })}
          </motion.div>

          {/* Bottom row: 3 cards centered */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
            className="flex justify-center gap-3">
            {bottomRow.map((continent, i) => {
              const s = continentStatuses[continent.id] || { status: "locked", zonesCompleted: 0, bossDefeated: false };
              return (
                <motion.div key={continent.id} className="w-full max-w-[25%]" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 + i * 0.06 }}>
                  <ContinentCard continent={continent} status={s.status as any} zonesCompleted={s.zonesCompleted} onClick={() => handleContinentClick(continent)} />
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>

      {/* Guide Character */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-1.5"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={guideMessage}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            className="relative max-w-[180px] rounded-xl rounded-br-sm border border-[hsl(195_80%_50%/0.25)] bg-[hsl(210_40%_14%/0.9)] px-2.5 py-1.5 shadow-lg backdrop-blur-md"
          >
            <p className="text-[10px] font-medium text-white leading-snug">{guideMessage}</p>
          </motion.div>
        </AnimatePresence>
        <motion.button onClick={cycleIdle} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
          className="relative flex h-11 w-11 items-center justify-center rounded-full border-2 border-[hsl(195_80%_50%/0.5)] bg-[hsl(210_40%_14%/0.9)] shadow-[0_0_15px_hsl(195_85%_50%/0.3)]">
          <HeroAvatar avatarConfig={avatarConfig} size={28} fallbackEmoji="🦸" />
          <div className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[hsl(195_80%_55%)]">
            <MessageCircle className="h-2.5 w-2.5 text-white" />
          </div>
        </motion.button>
      </motion.div>
    </div>
  );
}
