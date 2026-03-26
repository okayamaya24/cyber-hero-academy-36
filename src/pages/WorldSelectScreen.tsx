import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Shield, Zap, Globe, MessageCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { CONTINENTS, type ContinentDef } from "@/data/continents";
import HeroAvatar from "@/components/avatar/HeroAvatar";
import VillainSprite from "@/components/world/VillainSprite";
import StarfieldBackground from "@/components/world/StarfieldBackground";
import { Progress } from "@/components/ui/progress";

/* ─── HUD Bar ────────────────────────────────────────────── */
function HUDBar({
  playerName,
  level,
  points,
  worldsCompleted,
}: {
  playerName: string;
  level: number;
  points: number;
  worldsCompleted: number;
}) {
  return (
    <div className="shrink-0 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-[hsl(195_80%_50%/0.2)] bg-[hsl(210_40%_14%/0.8)] px-4 py-2 backdrop-blur-md shadow-lg">
      <div className="flex items-center gap-4 text-xs">
        <span className="flex items-center gap-1.5 text-[hsl(195_80%_70%)] font-bold">
          <Globe className="h-3.5 w-3.5" />
          <span className="text-white font-bold">{playerName}</span>
        </span>
        <span className="flex items-center gap-1.5 text-[hsl(160_70%_60%)]">
          <Zap className="h-3.5 w-3.5" />
          <span className="font-bold">LVL {level}</span>
          <span className="text-white/50">·</span>
          <span>{points.toLocaleString()} XP</span>
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1.5 text-xs text-[hsl(195_80%_70%)]">
          <Shield className="h-3.5 w-3.5" />
          WORLDS:
          <span className="font-bold text-white">{worldsCompleted}/7</span>
        </span>
        <span
          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
            worldsCompleted === 7
              ? "bg-[hsl(45_90%_60%/0.2)] border-[hsl(45_90%_60%/0.4)] text-[hsl(45_90%_70%)]"
              : "bg-[hsl(195_80%_50%/0.1)] border-[hsl(195_80%_50%/0.3)] text-[hsl(195_80%_65%)]"
          }`}
        >
          {worldsCompleted === 7 ? "🏆 MASTER" : "🛡️ GUARDIAN MODE"}
        </span>
      </div>
    </div>
  );
}

/* ─── Continent Card ─────────────────────────────────────── */
function ContinentCard({
  continent,
  status,
  zonesCompleted,
  onClick,
}: {
  continent: ContinentDef;
  status: "locked" | "in_progress" | "completed";
  zonesCompleted: number;
  onClick: () => void;
}) {
  const isAntarctica = continent.id === "antarctica";
  const isLocked = status === "locked";
  const totalZones = continent.zones.filter((z) => !z.isBoss && !z.isHQ).length;
  const progress = totalZones > 0 ? (zonesCompleted / totalZones) * 100 : 0;

  return (
    <motion.button
      onClick={onClick}
      disabled={isLocked}
      whileHover={!isLocked ? { scale: 1.03, y: -4 } : {}}
      whileTap={!isLocked ? { scale: 0.98 } : {}}
      className={`relative flex flex-col items-center gap-2 rounded-2xl border p-3 w-full backdrop-blur-md transition-all duration-300 min-h-[155px] justify-between text-left ${
        isLocked
          ? "border-white/5 bg-[hsl(210_40%_10%/0.5)] opacity-50 cursor-not-allowed"
          : status === "completed"
            ? "border-[hsl(160_65%_50%/0.5)] bg-[hsl(160_65%_15%/0.25)] hover:shadow-[0_0_24px_hsl(160_65%_50%/0.22)] cursor-pointer"
            : isAntarctica
              ? "border-[hsl(200_60%_70%/0.3)] bg-[hsl(200_40%_15%/0.3)] hover:shadow-[0_0_24px_hsl(200_60%_70%/0.18)] cursor-pointer"
              : "border-[hsl(195_80%_50%/0.3)] bg-[hsl(210_40%_14%/0.65)] hover:shadow-[0_0_24px_hsl(195_80%_50%/0.18)] hover:border-[hsl(195_80%_50%/0.55)] cursor-pointer"
      }`}
    >
      {!isLocked && (
        <div
          className={`absolute inset-0 rounded-2xl opacity-0 transition-opacity pointer-events-none ${
            status === "completed"
              ? "bg-[radial-gradient(ellipse_at_top,hsl(160_65%_50%/0.08),transparent_70%)]"
              : "bg-[radial-gradient(ellipse_at_top,hsl(195_80%_50%/0.08),transparent_70%)]"
          }`}
        />
      )}

      {isAntarctica && isLocked && (
        <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-[hsl(200_60%_90%/0.05)] to-transparent" />
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute top-0 w-px bg-[hsl(200_60%_90%/0.08)]"
              style={{ left: `${15 + i * 14}%`, height: `${30 + i * 8}%` }}
            />
          ))}
        </div>
      )}

      <div className="flex flex-col items-center gap-1 w-full">
        <motion.span
          className="text-3xl leading-none"
          animate={!isLocked ? { y: [0, -3, 0] } : {}}
          transition={{
            repeat: Infinity,
            duration: 3,
            ease: "easeInOut",
            delay: Math.random() * 2,
          }}
        >
          {continent.emoji}
        </motion.span>
        <h3 className="text-sm font-bold text-white text-center leading-tight">{continent.name}</h3>
      </div>

      <div className="flex items-center justify-center gap-1.5 w-full">
        <VillainSprite villainName={continent.villain} size={24} />
        <div className="flex flex-col">
          <span className="text-[8px] text-white/40 leading-none">VILLAIN</span>
          <span className="text-[9px] font-bold text-[hsl(0_80%_65%)] leading-tight max-w-[85px]">
            {continent.villain.toUpperCase()}
          </span>
        </div>
      </div>

      <p className="text-[9px] text-white/35 text-center">{totalZones} Zones + 1 Boss Battle</p>

      {!isLocked && (
        <div className="w-full space-y-0.5">
          <div className="flex justify-between text-[8px] text-white/35">
            <span>
              {zonesCompleted}/{totalZones} zones
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-1.5 bg-white/10" />
        </div>
      )}

      <span
        className={`rounded-full px-2.5 py-0.5 text-[8px] font-bold border w-full text-center ${
          status === "completed"
            ? "bg-[hsl(160_65%_50%/0.15)] border-[hsl(160_65%_50%/0.3)] text-[hsl(160_65%_65%)]"
            : status === "in_progress"
              ? "bg-[hsl(195_80%_50%/0.12)] border-[hsl(195_80%_50%/0.3)] text-[hsl(195_80%_65%)]"
              : "bg-white/5 border-white/10 text-white/30"
        }`}
      >
        {status === "completed"
          ? "✅ COMPLETED"
          : status === "in_progress"
            ? "🔵 IN PROGRESS"
            : isAntarctica
              ? "🔒 Defeat all 6 villains to unlock"
              : "🔒 LOCKED"}
      </span>
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
    const map: Record<
      string,
      {
        status: "locked" | "in_progress" | "completed";
        zonesCompleted: number;
        bossDefeated: boolean;
      }
    > = {};

    for (const c of CONTINENTS) {
      const progress = continentProgress.find((p: any) => p.continent_id === c.id);

      if (c.unlockOrder === 0) {
        map[c.id] = {
          status: progress?.status === "completed" ? "completed" : "in_progress",
          zonesCompleted: progress?.zones_completed ?? 0,
          bossDefeated: progress?.boss_defeated ?? false,
        };
      } else if (c.unlockOrder === 6) {
        const allBossesDefeated = CONTINENTS.filter((cc) => cc.unlockOrder >= 0 && cc.unlockOrder < 6).every(
          (cc) => continentProgress.find((pr: any) => pr.continent_id === cc.id)?.boss_defeated === true,
        );

        map[c.id] = {
          status: allBossesDefeated ? (progress?.status === "completed" ? "completed" : "in_progress") : "locked",
          zonesCompleted: progress?.zones_completed ?? 0,
          bossDefeated: progress?.boss_defeated ?? false,
        };
      } else {
        const prev = CONTINENTS.find((cc) => cc.unlockOrder === c.unlockOrder - 1);
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

  const worldsCompleted = Object.values(continentStatuses).filter((s) => s.status === "completed").length;

  const handleContinentClick = (continent: ContinentDef) => {
    const s = continentStatuses[continent.id];
    if (s?.status === "locked") {
      setGuideMessage("That world is still locked! Defeat the previous villain first. 🔒");
      return;
    }
    navigate(continent.route);
  };

  const IDLE_MSGS = [
    "Choose a world to begin your mission, Guardian! 🌍",
    "Each world has a villain to defeat! 💪",
    "Complete all zones to face the boss battle! ⚔️",
    "You're doing amazing, Cyber Hero! 🌟",
    "Defeat all 7 villains to earn your Master Certificate! 🏆",
    "Stay safe online — you've got this! 🛡️",
  ];

  const cycleIdle = useCallback(() => {
    const next = (idleIdx + 1) % IDLE_MSGS.length;
    setIdleIdx(next);
    setGuideMessage(IDLE_MSGS[next]);
  }, [idleIdx]);

  const topRow = CONTINENTS.slice(0, 4);
  const bottomRow = CONTINENTS.slice(4, 7);

  return (
    <div className="h-screen relative overflow-hidden flex flex-col" style={{ background: "#050a14" }}>
      <StarfieldBackground />

      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(195 80% 60% / 0.012) 2px, hsl(195 80% 60% / 0.012) 4px)",
        }}
      />

      <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden">
        <div className="absolute top-[-10%] left-[20%] w-[40%] h-[35%] bg-[hsl(195_80%_50%/0.04)] rounded-full blur-[80px]" />
        <div className="absolute bottom-[-5%] right-[10%] w-[30%] h-[30%] bg-[hsl(270_70%_50%/0.04)] rounded-full blur-[80px]" />
      </div>

      <div className="relative z-[2] flex flex-col h-full max-w-6xl mx-auto w-full px-5 pt-2 pb-2 overflow-hidden">
        <HUDBar playerName={playerName} level={level} points={points} worldsCompleted={worldsCompleted} />

        <div className="mt-2 mb-2 shrink-0">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-baseline gap-3"
          >
            <h1 className="text-2xl font-bold text-white tracking-wide">🌍 SELECT YOUR WORLD</h1>
            <span className="text-[10px] text-[hsl(195_80%_60%)] font-bold tracking-widest uppercase opacity-70">
              Cyber Hero Academy
            </span>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-[10px] text-[hsl(45_90%_65%/0.75)] mt-0.5"
          >
            🏆 Complete all 7 worlds to earn your Master Cyber Guardian Certificate!
          </motion.p>
        </div>

        <div className="flex flex-col items-center justify-center gap-3 flex-1 min-h-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="grid grid-cols-4 gap-3 w-full"
          >
            {topRow.map((continent, i) => {
              const s = continentStatuses[continent.id] || {
                status: "locked",
                zonesCompleted: 0,
                bossDefeated: false,
              };

              return (
                <motion.div
                  key={continent.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.07 }}
                >
                  <ContinentCard
                    continent={continent}
                    status={s.status as "locked" | "in_progress" | "completed"}
                    zonesCompleted={s.zonesCompleted}
                    onClick={() => handleContinentClick(continent)}
                  />
                </motion.div>
              );
            })}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="w-full flex justify-center shrink-0"
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "0.75rem",
                width: "100%",
              }}
            >
              <div style={{ gridColumn: "1 / 2", visibility: "hidden" }} />

              {bottomRow.map((continent, i) => {
                const s = continentStatuses[continent.id] || {
                  status: "locked",
                  zonesCompleted: 0,
                  bossDefeated: false,
                };

                return (
                  <motion.div
                    key={continent.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + i * 0.07 }}
                    style={{ gridColumn: `${i + 2} / ${i + 3}` }}
                  >
                    <ContinentCard
                      continent={continent}
                      status={s.status as "locked" | "in_progress" | "completed"}
                      zonesCompleted={s.zonesCompleted}
                      onClick={() => handleContinentClick(continent)}
                    />
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-2 flex items-center gap-2 shrink-0 pb-1"
        >
          <span className="text-[10px] text-white/40 whitespace-nowrap">MASTER CERTIFICATE</span>
          <div className="flex-1">
            <Progress value={(worldsCompleted / 7) * 100} className="h-1.5 bg-white/10" />
          </div>
          <span className="text-[10px] font-bold text-[hsl(45_90%_65%)]">{worldsCompleted}/7</span>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.85 }}
        className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={guideMessage}
            initial={{ opacity: 0, scale: 0.85, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 8 }}
            transition={{ duration: 0.2 }}
            className="relative max-w-[200px] rounded-2xl rounded-br-sm border border-[hsl(195_80%_50%/0.25)] bg-[hsl(210_40%_12%/0.95)] px-3 py-2 shadow-xl backdrop-blur-md"
          >
            <p className="text-[11px] font-medium text-white leading-snug">{guideMessage}</p>
            <div className="absolute -bottom-1.5 right-4 w-3 h-3 bg-[hsl(210_40%_12%/0.95)] border-r border-b border-[hsl(195_80%_50%/0.25)] rotate-45" />
          </motion.div>
        </AnimatePresence>

        <motion.button
          onClick={cycleIdle}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="relative flex h-14 w-14 items-center justify-center rounded-full border-2 border-[hsl(195_80%_50%/0.5)] bg-[hsl(210_40%_14%/0.95)] shadow-[0_0_20px_hsl(195_85%_50%/0.35)]"
        >
          <HeroAvatar avatarConfig={avatarConfig} size={36} fallbackEmoji="🦸" />
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2.5 }}
            className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[hsl(195_80%_55%)] border-2 border-[#050a14]"
          >
            <MessageCircle className="h-2.5 w-2.5 text-white" />
          </motion.div>
        </motion.button>
      </motion.div>
    </div>
  );
}
