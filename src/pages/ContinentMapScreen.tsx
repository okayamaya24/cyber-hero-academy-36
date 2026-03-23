import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Star, ChevronLeft, X, MessageCircle, Trophy } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getContinentById, type ContinentDef, type ZoneDef } from "@/data/continents";
import HeroAvatar from "@/components/avatar/HeroAvatar";
import VillainSprite from "@/components/world/VillainSprite";
import StarfieldBackground from "@/components/world/StarfieldBackground";
import { Button } from "@/components/ui/button";

/* ─── Zone positions on a 100x100 viewBox per continent ──── */
function getZonePositions(continent: ContinentDef): { x: number; y: number }[] {
  const count = continent.zones.length;
  // Distribute zones along a curved path
  return continent.zones.map((_, i) => {
    const t = count > 1 ? i / (count - 1) : 0.5;
    // Slightly curved arc from top-left to bottom-right
    const x = 15 + t * 70;
    const y = 25 + Math.sin(t * Math.PI) * 20 + t * 25;
    return { x, y };
  });
}

/* ─── Progress Path SVG ──────────────────────────────────── */
function ProgressPaths({ positions, zoneStatuses }: {
  positions: { x: number; y: number }[];
  zoneStatuses: string[];
}) {
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
      <defs>
        <filter id="pathGlow">
          <feGaussianBlur stdDeviation="0.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {positions.slice(0, -1).map((from, i) => {
        const to = positions[i + 1];
        const fromStatus = zoneStatuses[i];
        const toStatus = zoneStatuses[i + 1];
        const bothDone = fromStatus === "completed" && toStatus === "completed";
        const available = fromStatus === "completed" && toStatus !== "locked";

        const mx = (from.x + to.x) / 2;
        const my = (from.y + to.y) / 2 - 5;

        let stroke: string;
        let dashArr: string;

        if (bothDone) {
          stroke = "hsl(195 85% 55% / 0.6)";
          dashArr = "none";
        } else if (available) {
          stroke = "hsl(195 85% 55% / 0.35)";
          dashArr = "1.5 1";
        } else {
          stroke = "hsl(200 15% 40% / 0.12)";
          dashArr = "1 0.8";
        }

        return (
          <path
            key={i}
            d={`M${from.x},${from.y} Q${mx},${my} ${to.x},${to.y}`}
            fill="none"
            stroke={stroke}
            strokeWidth={bothDone ? 0.6 : 0.35}
            strokeDasharray={dashArr}
            strokeLinecap="round"
            filter={bothDone ? "url(#pathGlow)" : undefined}
          />
        );
      })}
    </svg>
  );
}

/* ─── Zone Node Component ────────────────────────────────── */
function ZoneNode({ zone, position, status, onClick }: {
  zone: ZoneDef;
  position: { x: number; y: number };
  status: string;
  onClick: () => void;
}) {
  const isLocked = status === "locked";
  const isCompleted = status === "completed";
  const isAvailable = status === "available";
  const isBoss = zone.isBoss;
  const isHQ = zone.isHQ;

  const size = isBoss ? 1.5 : isHQ ? 1.3 : 1;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      className="absolute z-10"
      style={{ top: `${position.y}%`, left: `${position.x}%`, transform: "translate(-50%, -50%)" }}
    >
      <motion.button
        onClick={onClick}
        disabled={isLocked}
        whileHover={!isLocked ? { scale: 1.12 } : {}}
        whileTap={!isLocked ? { scale: 0.93 } : {}}
        className={`group relative flex flex-col items-center ${isLocked ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}`}
      >
        {/* Ping ring */}
        {isAvailable && (
          <motion.div
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className={`absolute rounded-full border ${isBoss ? "border-[hsl(0_80%_55%/0.5)] -inset-3" : "border-[hsl(195_80%_50%/0.5)] -inset-2"}`}
          />
        )}

        {/* Boss red pulse */}
        {isBoss && !isLocked && (
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="absolute -inset-2 rounded-full bg-[hsl(0_80%_55%/0.15)]"
          />
        )}

        {/* Node circle */}
        <div
          className={`relative flex items-center justify-center rounded-full border-2 transition-all ${
            isCompleted
              ? "border-[hsl(160_65%_50%/0.6)] shadow-[0_0_18px_hsl(160_65%_50%/0.35)]"
              : isBoss && !isLocked
                ? "border-[hsl(0_80%_55%/0.6)] shadow-[0_0_18px_hsl(0_80%_55%/0.3)]"
                : isAvailable
                  ? "border-[hsl(195_80%_50%/0.6)] shadow-[0_0_18px_hsl(195_80%_50%/0.25)]"
                  : isHQ
                    ? "border-[hsl(45_90%_55%/0.6)] shadow-[0_0_18px_hsl(45_90%_55%/0.3)]"
                    : "border-white/10"
          }`}
          style={{
            width: `${size * 3}rem`,
            height: `${size * 3}rem`,
            background: isLocked
              ? "hsl(220 30% 18%)"
              : isBoss
                ? "radial-gradient(circle, hsl(0 60% 35%), hsl(0 50% 18%))"
                : isHQ
                  ? "radial-gradient(circle, hsl(45 85% 45% / 0.3), hsl(35 50% 18% / 0.9))"
                  : isCompleted
                    ? "radial-gradient(circle, hsl(160 50% 30%), hsl(160 40% 16%))"
                    : "radial-gradient(circle, hsl(195 60% 35%), hsl(195 50% 20%))",
          }}
        >
          {isLocked ? (
            <Lock className="h-4 w-4 text-white/20" />
          ) : isCompleted ? (
            <span className="text-sm">✅</span>
          ) : (
            <span className={`drop-shadow-md ${isBoss ? "text-xl" : "text-lg"}`}>{zone.icon}</span>
          )}
        </div>

        {/* Label */}
        <div className={`mt-1.5 rounded-md px-2 py-0.5 backdrop-blur-sm max-w-[120px] ${
          isLocked ? "bg-white/[0.03]" : "bg-[hsl(210_40%_14%/0.8)]"
        }`}>
          <p className={`text-[8px] md:text-[10px] font-bold leading-tight text-center whitespace-nowrap ${
            isLocked ? "text-white/20" : isBoss ? "text-[hsl(0_80%_70%)]" : "text-white/80"
          }`}>
            {zone.name}
          </p>
          <p className={`text-[6px] md:text-[7px] text-center ${isLocked ? "text-white/10" : "text-white/30"}`}>
            {zone.city}
          </p>
        </div>

        {/* Play indicator */}
        {isAvailable && (
          <motion.span
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className={`mt-0.5 text-[8px] font-bold tracking-widest ${
              isBoss ? "text-[hsl(0_80%_60%)]" : "text-[hsl(195_80%_60%)]"
            }`}
          >
            {isBoss ? "⚔️ FIGHT" : "▶ DEPLOY"}
          </motion.span>
        )}
      </motion.button>
    </motion.div>
  );
}

/* ─── Zone Mission Panel (placeholder) ───────────────────── */
function ZoneMissionPanel({ zone, continent, onClose }: {
  zone: ZoneDef;
  continent: ContinentDef;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="w-full max-w-lg rounded-t-3xl border-t border-[hsl(195_80%_50%/0.2)] bg-[hsl(210_40%_12%)] p-6 pb-10 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl bg-[hsl(210_40%_20%)]">
            {zone.icon}
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-white">{zone.name.toUpperCase()}</h2>
            <p className="text-xs text-[hsl(195_60%_60%)]">{zone.city} · {continent.name}</p>
          </div>
          <button onClick={onClose} className="rounded-full p-1.5 hover:bg-white/10 transition-colors">
            <X className="h-5 w-5 text-white/50" />
          </button>
        </div>

        {zone.isBoss ? (
          <div className="text-center py-8">
            <span className="text-4xl mb-3 block">⚔️</span>
            <p className="text-sm text-white/70 mb-2">Boss Battle unlocks after completing all zones in this continent</p>
            <p className="text-xs text-[hsl(0_80%_65%)]">Defeat {continent.villain} to unlock the next world!</p>
          </div>
        ) : zone.isHQ ? (
          <div className="text-center py-6">
            <span className="text-4xl mb-3 block">🏠</span>
            <p className="text-sm text-white/70 mb-4">Welcome, Guardian! This is your home base. Complete your orientation mission to unlock your first zone!</p>
            <Button className="bg-[hsl(45_90%_50%)] hover:bg-[hsl(45_90%_45%)] text-[hsl(210_40%_10%)] font-bold">
              🚀 BEGIN ORIENTATION
            </Button>
          </div>
        ) : (
          <div className="text-center py-8">
            <span className="text-4xl mb-3 block">🚧</span>
            <p className="text-sm text-white/70 mb-1">Mission content coming soon</p>
            <p className="text-xs text-white/40">Zone: {zone.name}</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ─── Main Continent Map Screen ──────────────────────────── */
export default function ContinentMapScreen() {
  const { continentId } = useParams<{ continentId: string }>();
  const { user, activeChildId } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedZone, setSelectedZone] = useState<ZoneDef | null>(null);
  const [guideMessage, setGuideMessage] = useState("");

  const continent = getContinentById(continentId || "");

  useEffect(() => {
    if (!user) navigate("/login");
    else if (!activeChildId) navigate("/select-child");
    else if (!continent) navigate("/world-map");
  }, [user, activeChildId, continent, navigate]);

  useEffect(() => {
    if (continent) {
      setGuideMessage(`Welcome to ${continent.name}! Defeat ${continent.villain}! 💪`);
    }
  }, [continent]);

  const { data: child } = useQuery({
    queryKey: ["child", activeChildId],
    queryFn: async () => {
      const { data, error } = await supabase.from("child_profiles").select("*").eq("id", activeChildId!).single();
      if (error) throw error;
      return data;
    },
    enabled: !!activeChildId,
  });

  const { data: zoneProgress = [] } = useQuery({
    queryKey: ["zone_progress", activeChildId, continentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("zone_progress")
        .select("*")
        .eq("child_id", activeChildId!)
        .eq("continent_id", continentId!);
      if (error) throw error;
      return data;
    },
    enabled: !!activeChildId && !!continentId,
  });

  const avatarConfig = child?.avatar_config as Record<string, any> | null;
  const isAntarctica = continent?.id === "antarctica";

  // Derive zone statuses — sequential unlock
  const zoneStatuses = useMemo(() => {
    if (!continent) return [];
    return continent.zones.map((zone, i) => {
      const progress = zoneProgress.find((p: any) => p.zone_id === zone.id);
      if (progress?.status === "completed") return "completed";

      // First zone (HQ or first regular) is available
      if (i === 0) return "available";

      // Available only if previous zone is completed
      const prevZone = continent.zones[i - 1];
      const prevProgress = zoneProgress.find((p: any) => p.zone_id === prevZone.id);
      if (prevProgress?.status === "completed") return "available";

      return "locked";
    });
  }, [continent, zoneProgress]);

  const positions = useMemo(() => continent ? getZonePositions(continent) : [], [continent]);

  const handleZoneClick = (zone: ZoneDef, index: number) => {
    const status = zoneStatuses[index];
    if (status === "locked") {
      setGuideMessage("Complete the previous zone first! 🔒");
      return;
    }
    setSelectedZone(zone);
  };

  if (!continent) return null;

  return (
    <div
      className="min-h-screen pb-24 pt-20 relative overflow-hidden"
      style={{
        background: isAntarctica
          ? "linear-gradient(160deg, #050a14, #0a1f3a, #081525)"
          : "#050a14",
      }}
    >
      <StarfieldBackground variant={isAntarctica ? "snow" : "default"} />

      {/* Scanline */}
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background: "repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(195 80% 60% / 0.015) 2px, hsl(195 80% 60% / 0.015) 4px)",
        }}
      />

      <div className="relative z-[2] mx-auto max-w-6xl px-4">
        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate("/world-map")}
          className="mb-4 flex items-center gap-2 rounded-xl border border-[hsl(195_80%_50%/0.2)] bg-[hsl(210_40%_14%/0.8)] px-4 py-2 text-sm font-bold text-[hsl(195_80%_70%)] backdrop-blur-md hover:bg-[hsl(210_40%_14%)] transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          BACK TO WORLD SELECT
        </motion.button>

        {/* Continent Header */}
        <div className="mb-4 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-wide">
              {continent.emoji} {continent.name.toUpperCase()} — <span className="text-[hsl(0_80%_65%)]">{continent.villain.toUpperCase()}'S DOMAIN</span>
            </h1>
          </motion.div>

          {/* Villain sprite */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col items-center"
          >
            <VillainSprite villainName={continent.villain} size={64} menacing />
            {/* Speech bubble */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 }}
              className="relative mt-2 max-w-[200px] rounded-xl rounded-tr-sm border border-[hsl(0_80%_55%/0.2)] bg-[hsl(0_40%_14%/0.8)] px-3 py-2 backdrop-blur-md"
            >
              <p className="text-[10px] text-[hsl(0_80%_70%)] italic leading-snug">"{continent.villainTaunt}"</p>
              <div className="absolute -top-1.5 right-6 h-3 w-3 rotate-45 bg-[hsl(0_40%_14%/0.8)] border-l border-t border-[hsl(0_80%_55%/0.2)]" />
            </motion.div>
          </motion.div>
        </div>

        {/* ─── THE CONTINENT MAP ─────────────────────── */}
        <div className="relative mx-auto w-full" style={{ aspectRatio: "16/10", maxWidth: "900px" }}>
          <div
            className="absolute inset-0 rounded-2xl border border-[hsl(195_80%_50%/0.15)] overflow-hidden shadow-2xl"
            style={{
              background: isAntarctica
                ? "radial-gradient(ellipse at 50% 45%, hsl(200 30% 14%), hsl(210 40% 8%))"
                : "radial-gradient(ellipse at 50% 45%, hsl(210 50% 16% / 0.95), hsl(220 45% 10%))",
            }}
          >
            {/* Grid */}
            <div
              className="absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage: "radial-gradient(circle, hsl(195 80% 60%) 0.5px, transparent 0.5px)",
                backgroundSize: "24px 24px",
              }}
            />

            {/* Continent silhouette */}
            <svg className="absolute inset-0 w-full h-full opacity-[0.08]" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path
                d={continent.silhouettePath}
                fill={isAntarctica ? "hsl(200 40% 80%)" : "hsl(195 50% 40%)"}
                stroke={isAntarctica ? "hsl(200 40% 60% / 0.3)" : "hsl(195 80% 50% / 0.15)"}
                strokeWidth="0.5"
              />
            </svg>

            {/* Antarctica frost edges */}
            {isAntarctica && (
              <div className="absolute inset-0 border-4 border-white/[0.03] rounded-2xl" />
            )}
          </div>

          {/* Progress paths */}
          <ProgressPaths positions={positions} zoneStatuses={zoneStatuses} />

          {/* Zone Nodes */}
          {continent.zones.map((zone, i) => (
            <ZoneNode
              key={zone.id}
              zone={zone}
              position={positions[i]}
              status={zoneStatuses[i] || "locked"}
              onClick={() => handleZoneClick(zone, i)}
            />
          ))}
        </div>

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-white/40"
        >
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[hsl(195_80%_50%)] animate-pulse" /> Available
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[hsl(160_65%_50%)]" /> Secured
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-white/10 border border-white/10" /> Locked
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[hsl(0_80%_50%)]" /> ⚔️ Boss
          </span>
        </motion.div>
      </div>

      {/* Guide */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="fixed bottom-24 right-4 z-50 flex flex-col items-end gap-2 md:bottom-8 md:right-6"
      >
        <motion.div
          className="relative max-w-[200px] rounded-2xl rounded-br-sm border border-[hsl(195_80%_50%/0.25)] bg-[hsl(210_40%_14%/0.9)] px-3 py-2 shadow-lg backdrop-blur-md"
        >
          <p className="text-xs font-medium text-white leading-snug">{guideMessage}</p>
        </motion.div>
        <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-[hsl(195_80%_50%/0.5)] bg-[hsl(210_40%_14%/0.9)] shadow-[0_0_20px_hsl(195_85%_50%/0.3)]">
          <HeroAvatar avatarConfig={avatarConfig} size={36} fallbackEmoji="🦸" />
        </div>
      </motion.div>

      {/* Zone Panel */}
      <AnimatePresence>
        {selectedZone && continent && (
          <ZoneMissionPanel
            zone={selectedZone}
            continent={continent}
            onClose={() => setSelectedZone(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
