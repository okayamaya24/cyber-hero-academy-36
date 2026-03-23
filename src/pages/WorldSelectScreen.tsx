import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Shield, Zap, Globe, MessageCircle, ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { CONTINENTS, type ContinentDef } from "@/data/continents";
import { getLevelRank } from "@/data/levelTitles";
import HeroAvatar from "@/components/avatar/HeroAvatar";
import VillainSprite from "@/components/world/VillainSprite";
import StarfieldBackground from "@/components/world/StarfieldBackground";
import { Progress } from "@/components/ui/progress";

/* ─── HUD Bar ────────────────────────────────────────────── */
function HUDBar({ playerName, level, points, worldsCompleted }: {
  playerName: string; level: number; points: number; worldsCompleted: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-[hsl(195_80%_50%/0.2)] bg-[hsl(210_40%_14%/0.8)] px-4 py-2.5 backdrop-blur-md shadow-lg"
    >
      <div className="flex items-center gap-3 text-xs">
        <span className="flex items-center gap-1.5 text-[hsl(195_80%_70%)] font-bold">
          <Globe className="h-3.5 w-3.5" />
          OPERATIVE: <span className="text-white">{playerName}</span>
        </span>
        <span className="hidden sm:inline text-[hsl(195_80%_50%/0.3)]">|</span>
        <span className="hidden sm:flex items-center gap-1 text-[hsl(160_70%_60%)]">
          <Zap className="h-3.5 w-3.5" />
          LVL {level} · {points} XP
        </span>
      </div>
      <div className="flex items-center gap-3 text-xs">
        <span className="flex items-center gap-1 text-[hsl(195_80%_70%)]">
          <Shield className="h-3.5 w-3.5" />
          WORLDS: <span className="font-bold text-white">{worldsCompleted}/7</span>
        </span>
      </div>
    </motion.div>
  );
}

/* ─── Globe Animation ────────────────────────────────────── */
function GlobeAnimation() {
  return (
    <div className="relative mx-auto mb-6 flex items-center justify-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 60, ease: "linear" }}
        className="relative h-48 w-48 md:h-64 md:w-64"
      >
        {/* Globe circles */}
        <div className="absolute inset-0 rounded-full border border-[hsl(195_80%_50%/0.15)]" />
        <div className="absolute inset-[15%] rounded-full border border-[hsl(195_80%_50%/0.1)]" />
        <div className="absolute inset-[30%] rounded-full border border-[hsl(195_80%_50%/0.08)]" />
        {/* Meridians */}
        <div className="absolute top-0 bottom-0 left-1/2 w-px bg-[hsl(195_80%_50%/0.08)]" />
        <div className="absolute left-0 right-0 top-1/2 h-px bg-[hsl(195_80%_50%/0.08)]" />
        {/* Tilted ellipse */}
        <div className="absolute inset-[5%] rounded-full border border-[hsl(195_80%_50%/0.06)]"
          style={{ transform: "rotateX(60deg)" }} />
        <div className="absolute inset-[5%] rounded-full border border-[hsl(195_80%_50%/0.06)]"
          style={{ transform: "rotateY(60deg)" }} />
      </motion.div>
      {/* Glow */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-32 w-32 md:h-44 md:w-44 rounded-full bg-[hsl(195_80%_50%/0.04)] blur-2xl" />
      </div>
    </div>
  );
}

/* ─── Continent Card ─────────────────────────────────────── */
function ContinentCard({ continent, status, zonesCompleted, bossDefeated, onClick }: {
  continent: ContinentDef;
  status: "locked" | "in_progress" | "completed";
  zonesCompleted: number;
  bossDefeated: boolean;
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
      whileHover={!isLocked ? { scale: 1.05, y: -4 } : {}}
      whileTap={!isLocked ? { scale: 0.97 } : {}}
      className={`relative flex flex-col items-center gap-2 rounded-2xl border p-4 w-full max-w-[180px] backdrop-blur-md transition-all duration-300 text-left ${
        isLocked
          ? "border-white/5 bg-[hsl(210_40%_14%/0.4)] opacity-50 cursor-not-allowed"
          : status === "completed"
            ? "border-[hsl(160_65%_50%/0.4)] bg-[hsl(160_65%_20%/0.2)] hover:shadow-[0_0_30px_hsl(160_65%_50%/0.2)]"
            : "border-[hsl(195_80%_50%/0.3)] bg-[hsl(210_40%_14%/0.6)] hover:shadow-[0_0_30px_hsl(195_80%_50%/0.2)] hover:border-[hsl(195_80%_50%/0.5)]"
      }`}
    >
      {/* Ice overlay for Antarctica */}
      {isAntarctica && isLocked && (
        <div className="absolute inset-0 rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-[hsl(200_40%_85%/0.05)]" />
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute bg-white/5"
              style={{
                width: Math.random() * 30 + 10,
                height: 1,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                transform: `rotate(${Math.random() * 180}deg)`,
              }}
            />
          ))}
        </div>
      )}

      {/* Emoji */}
      <span className="text-3xl">{continent.emoji}</span>

      {/* Name */}
      <h3 className="text-sm font-bold text-white text-center leading-tight">{continent.name}</h3>

      {/* Villain */}
      <div className="flex items-center gap-1.5">
        <VillainSprite villainName={continent.villain} size={28} />
        <span className="text-[9px] font-bold text-[hsl(0_80%_65%)]">⚠️ {continent.villain.toUpperCase()}</span>
      </div>

      {/* Zone count */}
      <p className="text-[10px] text-white/40">
        {totalZones} Zones + 1 Boss Battle
      </p>

      {/* Progress */}
      {!isLocked && (
        <div className="w-full">
          <Progress value={progress} className="h-1.5 bg-white/10" />
          <p className="mt-1 text-[9px] text-white/30 text-center">{zonesCompleted}/{totalZones} zones</p>
        </div>
      )}

      {/* Status badge */}
      <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
        status === "completed"
          ? "bg-[hsl(160_65%_50%/0.2)] text-[hsl(160_65%_60%)] border border-[hsl(160_65%_50%/0.3)]"
          : status === "in_progress"
            ? "bg-[hsl(195_80%_50%/0.15)] text-[hsl(195_80%_65%)] border border-[hsl(195_80%_50%/0.3)]"
            : "bg-white/5 text-white/30 border border-white/10"
      }`}>
        {status === "completed" ? "✅ COMPLETED" : status === "in_progress" ? "🔵 IN PROGRESS" : "🔒 LOCKED"}
      </span>

      {/* Antarctica lock text */}
      {isAntarctica && isLocked && (
        <p className="text-[8px] text-white/20 text-center leading-tight mt-1">
          🔒 FINAL WORLD — Defeat all 6 villains to unlock
        </p>
      )}

      {/* Arrow */}
      {!isLocked && (
        <ChevronRight className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
      )}
    </motion.button>
  );
}

/* ─── Guide Character ────────────────────────────────────── */
function GuideCharacter({ avatarConfig, message, onTap }: {
  avatarConfig: Record<string, any> | null;
  message: string;
  onTap: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
      className="fixed bottom-24 right-4 z-50 flex flex-col items-end gap-2 md:bottom-8 md:right-6"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={message}
          initial={{ opacity: 0, scale: 0.85, y: 6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 6 }}
          className="relative max-w-[200px] rounded-2xl rounded-br-sm border border-[hsl(195_80%_50%/0.25)] bg-[hsl(210_40%_14%/0.9)] px-3 py-2 shadow-lg backdrop-blur-md"
        >
          <p className="text-xs font-medium text-white leading-snug">{message}</p>
          <div className="absolute -bottom-1.5 right-4 h-3 w-3 rotate-45 bg-[hsl(210_40%_14%/0.9)] border-r border-b border-[hsl(195_80%_50%/0.25)]" />
        </motion.div>
      </AnimatePresence>
      <motion.button
        onClick={onTap}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="relative flex h-14 w-14 items-center justify-center rounded-full border-2 border-[hsl(195_80%_50%/0.5)] bg-[hsl(210_40%_14%/0.9)] shadow-[0_0_20px_hsl(195_85%_50%/0.3)]"
      >
        <motion.div animate={{ y: [0, -2, 0] }} transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}>
          <HeroAvatar avatarConfig={avatarConfig} size={36} fallbackEmoji="🦸" />
        </motion.div>
        <div className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[hsl(195_80%_55%)]">
          <MessageCircle className="h-3 w-3 text-white" />
        </div>
      </motion.button>
    </motion.div>
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

  const hqCompleted = !!(child as any)?.hq_completed;
  const level = child?.level ?? 1;
  const points = child?.points ?? 0;
  const avatarConfig = child?.avatar_config as Record<string, any> | null;
  const playerName = child?.name ?? "Guardian";

  // Derive continent statuses
  const continentStatuses = useMemo(() => {
    const map: Record<string, { status: "locked" | "in_progress" | "completed"; zonesCompleted: number; bossDefeated: boolean }> = {};

    for (const c of CONTINENTS) {
      const progress = continentProgress.find((p: any) => p.continent_id === c.id);

      if (c.unlockOrder === 0) {
        // North America always accessible
        map[c.id] = {
          status: progress?.status === "completed" ? "completed" : "in_progress",
          zonesCompleted: progress?.zones_completed ?? 0,
          bossDefeated: progress?.boss_defeated ?? false,
        };
      } else if (c.unlockOrder === 6) {
        // Antarctica: need all 6 bosses
        const allBossesDefeated = CONTINENTS
          .filter(cc => cc.unlockOrder >= 0 && cc.unlockOrder < 6)
          .every(cc => {
            const p = continentProgress.find((pr: any) => pr.continent_id === cc.id);
            return p?.boss_defeated === true;
          });
        map[c.id] = {
          status: allBossesDefeated ? (progress?.status === "completed" ? "completed" : "in_progress") : "locked",
          zonesCompleted: progress?.zones_completed ?? 0,
          bossDefeated: progress?.boss_defeated ?? false,
        };
      } else {
        // Sequential: previous continent boss must be defeated
        const prev = CONTINENTS.find(cc => cc.unlockOrder === c.unlockOrder - 1);
        const prevProgress = prev ? continentProgress.find((p: any) => p.continent_id === prev.id) : null;
        const unlocked = prevProgress?.boss_defeated === true;
        map[c.id] = {
          status: unlocked ? (progress?.status === "completed" ? "completed" : "in_progress") : "locked",
          zonesCompleted: progress?.zones_completed ?? 0,
          bossDefeated: progress?.boss_defeated ?? false,
        };
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
    "Each world has a villain to defeat! Are you ready? 💪",
    "Complete zones to face the boss battle! ⚔️",
    "You're an amazing cyber hero! Keep going! 🌟",
  ];

  const cycleIdle = useCallback(() => {
    const next = (idleIdx + 1) % IDLE_MSGS.length;
    setIdleIdx(next);
    setGuideMessage(IDLE_MSGS[next]);
  }, [idleIdx]);

  return (
    <div
      className="min-h-screen pb-24 pt-20 relative overflow-hidden"
      style={{ background: "#050a14" }}
    >
      <StarfieldBackground />

      {/* Scanline */}
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background: "repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(195 80% 60% / 0.015) 2px, hsl(195 80% 60% / 0.015) 4px)",
        }}
      />

      <div className="relative z-[2] mx-auto max-w-6xl px-4">
        <HUDBar playerName={playerName} level={level} points={points} worldsCompleted={worldsCompleted} />

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-xl md:text-2xl font-bold text-white mb-2 tracking-wide"
        >
          🌍 CYBER HERO ACADEMY — <span className="text-[hsl(195_80%_65%)]">SELECT YOUR WORLD</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center text-xs text-[hsl(45_90%_65%/0.7)] mb-6"
        >
          🏆 Complete all worlds to earn your Master Cyber Guardian Certificate!
        </motion.p>

        {/* Globe */}
        <GlobeAnimation />

        {/* Continent Cards Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 justify-items-center max-w-4xl mx-auto"
        >
          {CONTINENTS.map((continent, i) => {
            const s = continentStatuses[continent.id] || { status: "locked", zonesCompleted: 0, bossDefeated: false };
            return (
              <motion.div
                key={continent.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.08 }}
              >
                <ContinentCard
                  continent={continent}
                  status={s.status as any}
                  zonesCompleted={s.zonesCompleted}
                  bossDefeated={s.bossDefeated}
                  onClick={() => handleContinentClick(continent)}
                />
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      <GuideCharacter avatarConfig={avatarConfig} message={guideMessage} onTap={cycleIdle} />
    </div>
  );
}
