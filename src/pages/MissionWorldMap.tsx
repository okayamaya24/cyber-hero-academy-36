import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Star, Zap, Shield, MessageCircle, ChevronRight, Trophy, X, Globe, Radio } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import {
  MISSIONS,
  getTotalGames,
  getMissionLevels,
  LEARNING_MODE_CONFIG,
  MINI_GAME_META,
  type LearningMode,
} from "@/data/missions";
import { getLevelRank } from "@/data/levelTitles";
import HeroAvatar from "@/components/avatar/HeroAvatar";
import { Button } from "@/components/ui/button";

/* ─── City node definitions mapped to missions ─────────── */
const CITY_NODES = [
  {
    id: "password-safety",
    name: "Password Peak",
    city: "New York, USA",
    icon: "🔑",
    description: "Forge unbreakable passwords at the summit!",
    hue: 195,
    x: 22, y: 38,
  },
  {
    id: "scam-detection",
    name: "Phish Lagoon",
    city: "London, UK",
    icon: "🎣",
    description: "Catch phishy scams before they catch you!",
    hue: 30,
    x: 45, y: 22,
  },
  {
    id: "safe-websites",
    name: "Browse Bazaar",
    city: "Mumbai, India",
    icon: "🌐",
    description: "Navigate the web marketplace safely!",
    hue: 175,
    x: 70, y: 45,
  },
  {
    id: "personal-info",
    name: "Privacy Palace",
    city: "Dubai, UAE",
    icon: "🛡️",
    description: "Guard your secrets in the royal palace!",
    hue: 270,
    x: 62, y: 42,
  },
  {
    id: "malware-monsters",
    name: "Download Dungeon",
    city: "Berlin, Germany",
    icon: "⬇️",
    description: "Defeat malware lurking in the dungeon depths!",
    hue: 0,
    x: 52, y: 20,
  },
  {
    id: "smart-sharing",
    name: "Stranger Shore",
    city: "Lagos, Nigeria",
    icon: "🚷",
    description: "Learn who to trust on the mysterious shore!",
    hue: 45,
    x: 48, y: 58,
  },
  {
    id: "phishy-messages",
    name: "Kindness Kingdom",
    city: "São Paulo, Brazil",
    icon: "💖",
    description: "Spread kindness and fight cyberbullying!",
    hue: 330,
    x: 28, y: 68,
  },
  {
    id: "malware-maze",
    name: "Malware Maze",
    city: "Sydney, Australia",
    icon: "🦠",
    description: "Navigate the maze of malicious software!",
    hue: 120,
    x: 82, y: 72,
  },
  {
    id: "firewall-frontier",
    name: "Firewall Frontier",
    city: "Seoul, South Korea",
    icon: "🧱",
    description: "Build walls to keep threats out!",
    hue: 210,
    x: 80, y: 28,
  },
  {
    id: "dark-web-den",
    name: "Dark Web Den",
    city: "Cairo, Egypt",
    icon: "🕸️",
    description: "Shine light into the darkest corners!",
    hue: 280,
    x: 55, y: 48,
  },
  {
    id: "encrypt-enclave",
    name: "Encrypt Enclave",
    city: "Toronto, Canada",
    icon: "🔐",
    description: "Master the art of secret codes!",
    hue: 160,
    x: 18, y: 28,
  },
  {
    id: "cyberguard-academy",
    name: "Cyber Hero Command",
    city: "Global HQ",
    icon: "🏠",
    description: "Your home base — begin your mission here!",
    hue: 45,
    x: 12, y: 50,
    isHub: true,
  },
];

// Path connections between nodes (pairs of indices)
const CONNECTIONS: [number, number][] = [
  [11, 0],  // HQ to Password Peak
  [11, 10], // HQ to Encrypt Enclave
  [11, 1],  // HQ to Phish Lagoon
  [0, 10],  // Password Peak to Encrypt Enclave
  [0, 6],   // Password Peak to Kindness Kingdom
  [1, 4],   // Phish Lagoon to Download Dungeon
  [1, 5],   // Phish Lagoon to Stranger Shore
  [3, 9],   // Privacy Palace to Dark Web Den
  [3, 2],   // Privacy Palace to Browse Bazaar
  [2, 8],   // Browse Bazaar to Firewall Frontier
  [2, 7],   // Browse Bazaar to Malware Maze
  [5, 6],   // Stranger Shore to Kindness Kingdom
];

type NodeStatus = "completed" | "unlocked" | "locked";

function getStars(score: number, maxScore: number): number {
  if (maxScore === 0) return 0;
  const r = score / maxScore;
  if (r >= 0.9) return 3;
  if (r >= 0.6) return 2;
  if (r > 0) return 1;
  return 0;
}

/* ─── SVG connection paths ───────────────────────────────── */
function MapConnections({ statuses }: { statuses: NodeStatus[] }) {
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
      <defs>
        <filter id="connGlow">
          <feGaussianBlur stdDeviation="0.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {CONNECTIONS.map(([a, b], i) => {
        const from = CITY_NODES[a];
        const to = CITY_NODES[b];
        const aStatus = from.isHub ? "unlocked" : statuses[a];
        const bStatus = to.isHub ? "unlocked" : statuses[b];
        const bothDone = aStatus === "completed" && bStatus === "completed";
        const anyUnlocked = aStatus !== "locked" && bStatus !== "locked";

        const stroke = bothDone
          ? "hsl(160 65% 55% / 0.6)"
          : anyUnlocked
            ? "hsl(195 85% 60% / 0.3)"
            : "hsl(200 15% 40% / 0.08)";

        // Curved path
        const mx = (from.x + to.x) / 2;
        const my = (from.y + to.y) / 2;
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        const off = len * 0.12;
        const cx = mx + (-dy / len) * off;
        const cy = my + (dx / len) * off;

        return (
          <path
            key={i}
            d={`M${from.x},${from.y} Q${cx},${cy} ${to.x},${to.y}`}
            fill="none"
            stroke={stroke}
            strokeWidth={bothDone ? 0.5 : 0.3}
            strokeDasharray={bothDone ? "none" : "1 0.8"}
            strokeLinecap="round"
            filter={bothDone ? "url(#connGlow)" : undefined}
          />
        );
      })}
    </svg>
  );
}

/* ─── HUD Bar ────────────────────────────────────────────── */
function HUDBar({
  playerName,
  level,
  points,
  zonesSecured,
  totalZones,
}: {
  playerName: string;
  level: number;
  points: number;
  zonesSecured: number;
  totalZones: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-[hsl(195_80%_50%/0.2)] bg-[hsl(210_40%_14%/0.8)] px-4 py-2.5 backdrop-blur-md shadow-lg"
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
          ZONES: <span className="font-bold text-white">{zonesSecured}/{totalZones}</span>
        </span>
        <span className="rounded-full bg-[hsl(45_90%_55%/0.15)] border border-[hsl(45_90%_55%/0.3)] px-2 py-0.5 text-[10px] font-bold text-[hsl(45_90%_65%)]">
          🛡️ GUARDIAN MODE
        </span>
      </div>
    </motion.div>
  );
}

/* ─── Guide messages ─────────────────────────────────── */
const GUIDE_MESSAGES = {
  idle: [
    "Hey Guardian! Ready to protect the digital world? 🚀",
    "Every zone has secrets to discover! 🔍",
    "You're doing amazing, keep it up! 💪",
    "Tap a zone to begin your mission! 🎯",
  ],
  worldSelected: "Let's explore this zone! 🌟",
  worldLocked: "Complete earlier zones to unlock this one! 🔒",
  hqGated: "Complete HQ Orientation to unlock zones! 🏠",
  progress: "Great job! Keep going, hero! 🎉",
  hqComplete: "Amazing work, Guardian! Your first zones are now open — choose your mission! 🌟",
};

/* ─── Guide Character Component ──────────────────────── */
function GuideCharacter({
  avatarConfig,
  message,
  onTap,
}: {
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
          transition={{ duration: 0.25 }}
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
        className="relative flex h-14 w-14 items-center justify-center rounded-full border-2 border-[hsl(195_80%_50%/0.5)] bg-[hsl(210_40%_14%/0.9)] shadow-[0_0_20px_hsl(195_85%_50%/0.3)] transition-shadow hover:shadow-[0_0_28px_hsl(195_85%_50%/0.45)]"
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

/* ─── World Detail Panel (preserved) ─────────────────── */
function WorldDetailPanel({
  world,
  mission,
  missionProgress,
  learningMode,
  age,
  onClose,
  onStartLevel,
}: {
  world: (typeof CITY_NODES)[number];
  mission: (typeof MISSIONS)[number] | undefined;
  missionProgress: any[];
  learningMode: LearningMode;
  age: number;
  onClose: () => void;
  onStartLevel: (missionId: string, levelIndex: number) => void;
}) {
  // HQ special panel
  if (world.isHub) {
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
          className="w-full max-w-lg rounded-t-3xl border-t border-[hsl(45_90%_55%/0.25)] bg-[hsl(210_40%_12%)] p-6 pb-10 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl bg-[hsl(45_80%_30%)]">
              🏠
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-white">CYBER HERO COMMAND // GLOBAL HQ</h2>
              <p className="text-xs text-[hsl(45_90%_65%)]">Your home base and training ground</p>
            </div>
            <button onClick={onClose} className="rounded-full p-1.5 hover:bg-white/10 transition-colors">
              <X className="h-5 w-5 text-white/50" />
            </button>
          </div>

          <p className="mb-5 text-sm text-white/70 leading-relaxed">
            Welcome, Guardian! This is your home base. Complete your orientation mission to unlock your first zone and begin protecting the digital world.
          </p>

          <div className="mb-5 flex items-center gap-3 rounded-xl border-2 border-[hsl(45_90%_55%/0.3)] bg-[hsl(45_90%_55%/0.08)] p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[hsl(45_80%_45%/0.2)] text-lg">
              🎯
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white">OP: GUARDIAN ORIENTATION</p>
              <p className="text-[10px] text-white/40">Difficulty: ◆◇◇◇◇ · TUTORIAL</p>
              <p className="text-[10px] text-[hsl(45_90%_65%)]">+100 XP · Unlocks: Password Peak + Encrypt Enclave</p>
            </div>
          </div>

          <Button
            className="w-full text-sm font-bold bg-[hsl(45_90%_50%)] hover:bg-[hsl(45_90%_45%)] text-[hsl(210_40%_10%)] border-0 shadow-[0_0_20px_hsl(45_90%_50%/0.3)]"
            onClick={() => onStartLevel("password-safety", 0)}
          >
            🚀 BEGIN ORIENTATION
          </Button>
        </motion.div>
      </motion.div>
    );
  }

  if (!mission) return null;

  const totalGames = getTotalGames(learningMode);
  const modeConfig = LEARNING_MODE_CONFIG[learningMode];
  const progressRow = missionProgress.find((p: any) => p.mission_id === mission.id);
  const completedGames = progressRow?.status === "completed" ? totalGames : (progressRow?.current_question ?? 0);
  const levels = getMissionLevels(mission, age, learningMode, completedGames);

  const STEP_LABELS = ["Mission 1", "Mission 2", "Boss Battle"];
  const STEP_ICONS = ["🎯", "⚔️", "🐉"];

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
          <div className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl" style={{ background: `hsl(${world.hue} 70% 30%)` }}>
            {world.icon}
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-white">{world.name}</h2>
            <p className="text-xs text-[hsl(195_60%_60%)]">{world.city} · {world.description}</p>
          </div>
          <button onClick={onClose} className="rounded-full p-1.5 hover:bg-white/10 transition-colors">
            <X className="h-5 w-5 text-white/50" />
          </button>
        </div>

        <div className="mb-5 flex items-center gap-3 rounded-xl bg-white/5 p-3">
          <img src={mission.guide.image} alt={mission.guide.name} className="h-10 w-10 object-contain" />
          <div>
            <p className="text-xs font-bold text-white">{mission.guide.name}</p>
            <p className="text-[10px] text-white/50">Your guide for this zone</p>
          </div>
        </div>

        <div className="space-y-3">
          {levels.map((level, i) => {
            const levelStart = i * modeConfig.gamesPerLevel;
            const levelEnd = levelStart + modeConfig.gamesPerLevel;
            const levelCompleted = Math.min(Math.max(completedGames - levelStart, 0), modeConfig.gamesPerLevel);
            const levelDone = levelCompleted >= modeConfig.gamesPerLevel;
            const levelActive = completedGames >= levelStart && completedGames < levelEnd;
            const isLocked = level.locked;
            const isBoss = i === levels.length - 1;

            return (
              <motion.div
                key={level.level}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`flex items-center gap-3 rounded-xl border-2 p-3 transition-all ${
                  levelDone
                    ? "border-[hsl(160_65%_50%/0.4)] bg-[hsl(160_65%_50%/0.1)]"
                    : levelActive
                      ? "border-[hsl(195_80%_50%/0.4)] bg-[hsl(195_80%_50%/0.1)]"
                      : isLocked
                        ? "border-white/5 bg-white/[0.03] opacity-50"
                        : "border-white/5 bg-white/[0.03]"
                }`}
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-lg ${
                  levelDone ? "bg-[hsl(160_65%_50%/0.2)]" : levelActive ? "bg-[hsl(195_80%_50%/0.2)]" : "bg-white/5"
                }`}>
                  {isLocked ? <Lock className="h-4 w-4 text-white/30" /> : <span>{STEP_ICONS[i]}</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-white">{STEP_LABELS[i]}</p>
                    {isBoss && !isLocked && (
                      <span className="rounded-full bg-[hsl(0_80%_60%/0.2)] px-2 py-0.5 text-[9px] font-bold text-[hsl(0_80%_70%)]">
                        BOSS
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-white/40">
                    {level.name} · {levelCompleted}/{modeConfig.gamesPerLevel} games
                  </p>
                  <div className="mt-1 flex gap-1">
                    {level.miniGameTypes.slice(0, 3).map((type, j) => (
                      <span key={j} className="text-[10px]" title={MINI_GAME_META[type].label}>
                        {MINI_GAME_META[type].emoji}
                      </span>
                    ))}
                  </div>
                </div>
                {levelDone ? (
                  <div className="flex items-center gap-1 text-[hsl(160_65%_55%)]">
                    <Trophy className="h-4 w-4" />
                    <span className="text-xs font-bold">Done</span>
                  </div>
                ) : levelActive ? (
                  <Button size="sm" className="text-xs bg-[hsl(195_80%_50%)] hover:bg-[hsl(195_80%_45%)] text-white border-0" onClick={() => onStartLevel(mission.id, i)}>
                    {completedGames > 0 ? "Continue" : isBoss ? "Fight!" : "Deploy"}{" "}
                    <ChevronRight className="ml-1 h-3 w-3" />
                  </Button>
                ) : isLocked ? (
                  <Lock className="h-4 w-4 text-white/20" />
                ) : null}
              </motion.div>
            );
          })}
        </div>

        <div className="mt-4 flex items-center justify-between text-xs text-white/40">
          <span>{completedGames}/{totalGames} games completed</span>
          {progressRow?.status === "completed" && (
            <span className="flex items-center gap-1 font-bold text-[hsl(160_65%_55%)]">
              <Trophy className="h-3.5 w-3.5" /> Zone Secured!
            </span>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Main Component ─────────────────────────────────── */
export default function MissionWorldMap() {
  const { user, activeChildId } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [guideMessage, setGuideMessage] = useState(GUIDE_MESSAGES.idle[0]);
  const [idleIndex, setIdleIndex] = useState(0);
  const [selectedWorld, setSelectedWorld] = useState<(typeof CITY_NODES)[number] | null>(null);
  const [hasClickedHQ, setHasClickedHQ] = useState(() => {
    return localStorage.getItem("cyber_hero_hq_clicked") === "true";
  });

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

  const { data: missionProgress = [] } = useQuery({
    queryKey: ["mission_progress", activeChildId],
    queryFn: async () => {
      const { data, error } = await supabase.from("mission_progress").select("*").eq("child_id", activeChildId!);
      if (error) throw error;
      return data;
    },
    enabled: !!activeChildId,
  });

  const hqCompleted = !!(child as any)?.hq_completed;

  const learningMode = ((child as any)?.learning_mode as LearningMode) || "standard";
  const level = child?.level ?? 1;
  const points = child?.points ?? 0;
  const rank = getLevelRank(level);
  const avatarConfig = child?.avatar_config as Record<string, any> | null;
  const hasAvatar = !!avatarConfig?.heroSrc;
  const age = child?.age ?? 7;
  const playerName = child?.name ?? "Guardian";

  useEffect(() => {
    if (child && !hasAvatar) navigate("/edit-avatar");
  }, [child, hasAvatar, navigate]);

  // Map mission IDs that actually exist
  const missionIds = new Set(MISSIONS.map((m) => m.id));

  const nodeStatuses = useMemo(() => {
    const expectedTotal = getTotalGames(learningMode);
    // Original 7 missions in sequential order
    const sequentialIds = [
      "password-safety", "scam-detection", "safe-websites",
      "personal-info", "malware-monsters", "smart-sharing", "phishy-messages",
    ];

    return CITY_NODES.map((node) => {
      if (node.isHub) return { status: "unlocked" as const, stars: 0 };

      // If HQ not completed, gate everything
      if (!hqCompleted) {
        // Show Password Peak and Encrypt Enclave as "gated" (amber hint)
        if (node.id === "password-safety" || node.id === "encrypt-enclave") {
          return { status: "gated" as const, stars: 0 };
        }
        return { status: "locked" as const, stars: 0 };
      }

      if (!missionIds.has(node.id) && !node.isHub) return { status: "locked" as const, stars: 0 };

      const seqIndex = sequentialIds.indexOf(node.id);
      const progress = missionProgress.find(
        (p: any) => p.mission_id === node.id && (p.max_score ?? expectedTotal) === expectedTotal,
      );

      if (progress?.status === "completed") {
        return { status: "completed" as const, stars: getStars(progress.score, progress.max_score) };
      }

      // First mission always unlocked after HQ
      if (seqIndex === 0) return { status: "unlocked" as const, stars: 0 };

      // Sequential unlock
      if (seqIndex > 0) {
        const prevId = sequentialIds[seqIndex - 1];
        const prevDone = missionProgress.find((p: any) => p.mission_id === prevId && p.status === "completed");
        return { status: prevDone ? ("unlocked" as const) : ("locked" as const), stars: 0 };
      }

      return { status: "locked" as const, stars: 0 };
    });
  }, [missionProgress, learningMode, hqCompleted]);

  const completedCount = nodeStatuses.filter((n) => n.status === "completed").length;
  const totalPlayable = CITY_NODES.filter((n) => missionIds.has(n.id)).length;

  useEffect(() => {
    if (hqCompleted && completedCount > 0 && completedCount < totalPlayable) {
      setGuideMessage(GUIDE_MESSAGES.progress);
    } else if (!hqCompleted) {
      setGuideMessage("Hey Guardian! Start at HQ to begin your journey! 🏠");
    }
  }, [completedCount, totalPlayable, hqCompleted]);

  const cycleIdleMessage = useCallback(() => {
    const next = (idleIndex + 1) % GUIDE_MESSAGES.idle.length;
    setIdleIndex(next);
    setGuideMessage(GUIDE_MESSAGES.idle[next]);
  }, [idleIndex]);

  const handleNodeClick = (node: (typeof CITY_NODES)[number], index: number) => {
    if (node.isHub) {
      if (!hasClickedHQ) {
        setHasClickedHQ(true);
        localStorage.setItem("cyber_hero_hq_clicked", "true");
      }
      setGuideMessage("Welcome to HQ, Guardian! 🏠");
      setSelectedWorld(node);
      return;
    }
    const { status } = nodeStatuses[index];
    if (status === "gated") {
      setGuideMessage(GUIDE_MESSAGES.hqGated);
      return;
    }
    if (status === "locked") {
      setGuideMessage(GUIDE_MESSAGES.worldLocked);
      return;
    }
    setGuideMessage(GUIDE_MESSAGES.worldSelected);
    setSelectedWorld(node);
  };

  const handleHQComplete = async () => {
    if (!activeChildId) return;
    // Mark HQ as completed
    await supabase
      .from("child_profiles")
      .update({ hq_completed: true } as any)
      .eq("id", activeChildId);
    // Refresh child data
    queryClient.invalidateQueries({ queryKey: ["child", activeChildId] });
    setSelectedWorld(null);
    setGuideMessage(GUIDE_MESSAGES.hqComplete);
  };

  const handleStartLevel = (missionId: string, _levelIndex: number) => {
    // If starting from HQ orientation, mark HQ as completed first
    if (selectedWorld?.isHub) {
      handleHQComplete();
      navigate(`/missions?mission=${missionId}`);
      return;
    }
    setSelectedWorld(null);
    navigate(`/missions?mission=${missionId}`);
  };

  const selectedMission = selectedWorld ? MISSIONS.find((m) => m.id === selectedWorld.id) : undefined;

  return (
    <div
      className="min-h-screen pb-24 pt-20 relative overflow-hidden"
      style={{ background: "linear-gradient(160deg, hsl(220 45% 10%), hsl(210 50% 14%), hsl(200 40% 12%))" }}
    >
      {/* Starfield */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {Array.from({ length: 50 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 2.5 + 0.5,
              height: Math.random() * 2.5 + 0.5,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.5 + 0.05,
            }}
            animate={{ opacity: [0.05, 0.4, 0.05] }}
            transition={{ repeat: Infinity, duration: Math.random() * 4 + 2, delay: Math.random() * 3 }}
          />
        ))}
      </div>

      {/* Scanline overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background: "repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(195 80% 60% / 0.015) 2px, hsl(195 80% 60% / 0.015) 4px)",
        }}
      />

      <div className="relative z-[2] mx-auto max-w-6xl px-4">
        {/* HUD Bar */}
        <HUDBar
          playerName={playerName}
          level={level}
          points={points}
          zonesSecured={completedCount}
          totalZones={totalPlayable}
        />

        {/* Certificate banner */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mb-3 text-center"
        >
          <p className="text-xs text-[hsl(45_90%_65%/0.7)] font-medium">
            🏆 Secure all zones to earn your Cyber Guardian Certificate!
          </p>
        </motion.div>

        {/* ─── THE MAP ─────────────────────────────────── */}
        <div className="relative mx-auto w-full" style={{ aspectRatio: "16/10", maxWidth: "900px" }}>
          <div
            className="absolute inset-0 rounded-2xl border border-[hsl(195_80%_50%/0.15)] overflow-hidden shadow-2xl"
            style={{
              background: "radial-gradient(ellipse at 50% 45%, hsl(210 50% 16% / 0.95), hsl(220 45% 10%))",
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

            {/* Soft globe hint */}
            <div className="absolute inset-[10%] rounded-full border border-[hsl(195_80%_50%/0.06)]" />
            <div className="absolute inset-[20%] rounded-full border border-[hsl(195_80%_50%/0.04)]" />
            <div className="absolute top-[45%] left-0 right-0 h-px bg-[hsl(195_80%_50%/0.04)]" />
            <div className="absolute top-0 bottom-0 left-[50%] w-px bg-[hsl(195_80%_50%/0.04)]" />
          </div>

          <MapConnections statuses={nodeStatuses.map((n) => n.status)} />

          {/* City Nodes */}
          {CITY_NODES.map((node, index) => {
            if (node.isHub) {
              // Central HQ node — larger, gold glow, always clickable
              return (
                <motion.div
                  key={node.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="absolute z-20"
                  style={{ top: `${node.y}%`, left: `${node.x}%`, transform: "translate(-50%, -50%)" }}
                >
                  <motion.button
                    onClick={() => handleNodeClick(node, index)}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.94 }}
                    className="flex flex-col items-center cursor-pointer"
                  >
                    {/* Outer gold pulse ring */}
                    <motion.div
                      animate={{ scale: [1, 1.6, 1], opacity: [0.4, 0, 0.4] }}
                      transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
                      className="absolute -inset-3 md:-inset-4 rounded-full border-2 border-[hsl(45_90%_55%/0.5)]"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.3, 1], opacity: [0.25, 0, 0.25] }}
                      transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut", delay: 0.5 }}
                      className="absolute -inset-1.5 md:-inset-2 rounded-full border border-[hsl(45_90%_55%/0.3)]"
                    />

                    {/* Node circle — 1.4x larger than regular nodes */}
                    <div
                      className="relative flex h-14 w-14 md:h-[68px] md:w-[68px] items-center justify-center rounded-full border-2 border-[hsl(45_90%_55%/0.6)] shadow-[0_0_30px_hsl(45_90%_55%/0.35)] backdrop-blur-md"
                      style={{ background: "radial-gradient(circle, hsl(45 85% 45% / 0.3), hsl(35 50% 18% / 0.9))" }}
                    >
                      <span className="text-2xl md:text-3xl drop-shadow-md">🏠</span>
                    </div>

                    {/* Label */}
                    <div className="mt-1.5 rounded-full bg-[hsl(45_90%_55%/0.15)] px-2.5 py-0.5 border border-[hsl(45_90%_55%/0.25)]">
                      <p className="text-[8px] md:text-[10px] font-bold text-[hsl(45_90%_70%)] whitespace-nowrap tracking-wide">
                        HQ — Cyber Hero Command
                      </p>
                    </div>
                    <p className="mt-0.5 text-[6px] md:text-[7px] text-[hsl(45_90%_60%/0.6)] whitespace-nowrap">
                      Begin your mission here
                    </p>
                  </motion.button>
                </motion.div>
              );
            }

            const { status, stars } = nodeStatuses[index];
            const isClickable = status !== "locked";
            const hasMission = missionIds.has(node.id);
            const isCurrentTarget = status === "unlocked" && hasMission;

            return (
              <motion.div
                key={node.id}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.06, type: "spring", stiffness: 180 }}
                className="absolute z-10"
                style={{ top: `${node.y}%`, left: `${node.x}%`, transform: "translate(-50%, -50%)" }}
              >
                <motion.button
                  onClick={() => handleNodeClick(node, index)}
                  disabled={!isClickable}
                  whileHover={isClickable ? { scale: 1.12 } : {}}
                  whileTap={isClickable ? { scale: 0.93 } : {}}
                  className={`group relative flex flex-col items-center transition-all ${
                    status === "locked" ? "opacity-40 cursor-not-allowed" : "cursor-pointer"
                  }`}
                >
                  {/* Ping ring for current target */}
                  {isCurrentTarget && (
                    <motion.div
                      animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="absolute -inset-2 rounded-full border border-[hsl(195_80%_50%/0.5)]"
                    />
                  )}

                  {/* Node circle */}
                  <div
                    className={`relative flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full border-2 text-lg md:text-xl transition-all duration-200 ${
                      status === "completed"
                        ? `border-[hsl(160_65%_50%/0.6)] shadow-[0_0_18px_hsl(160_65%_50%/0.35)]`
                        : status === "unlocked"
                          ? `border-[hsl(${node.hue}_70%_55%/0.6)] shadow-[0_0_18px_hsl(${node.hue}_70%_55%/0.25)] hover:shadow-[0_0_25px_hsl(${node.hue}_70%_55%/0.4)]`
                          : "border-white/10 shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
                    }`}
                    style={{
                      background: status === "locked"
                        ? "hsl(220 30% 18%)"
                        : `radial-gradient(circle, hsl(${node.hue} 60% 35%), hsl(${node.hue} 50% 20%))`,
                    }}
                  >
                    {status === "locked" ? (
                      <Lock className="h-4 w-4 text-white/20" />
                    ) : status === "completed" ? (
                      <span className="text-sm">✅</span>
                    ) : (
                      <span className="drop-shadow-md">{node.icon}</span>
                    )}
                  </div>

                  {/* Stars */}
                  {status === "completed" && stars > 0 && (
                    <div className="mt-0.5 flex gap-0.5">
                      {[1, 2, 3].map((s) => (
                        <Star
                          key={s}
                          className={`h-2.5 w-2.5 ${s <= stars ? "text-[hsl(45_90%_60%)] fill-[hsl(45_90%_60%)]" : "text-white/15"}`}
                        />
                      ))}
                    </div>
                  )}

                  {/* Label */}
                  <div className={`mt-1 rounded-md px-1.5 py-0.5 backdrop-blur-sm ${
                    status === "locked" ? "bg-white/[0.03]" : "bg-[hsl(210_40%_14%/0.8)]"
                  }`}>
                    <p className={`text-[7px] md:text-[9px] font-bold leading-tight whitespace-nowrap tracking-wide ${
                      status === "locked" ? "text-white/20" : "text-white/80"
                    }`}>
                      {node.name}
                    </p>
                    <p className={`text-[6px] md:text-[7px] leading-tight whitespace-nowrap ${
                      status === "locked" ? "text-white/10" : "text-white/30"
                    }`}>
                      {node.city}
                    </p>
                  </div>

                  {/* Play indicator */}
                  {isCurrentTarget && (
                    <motion.span
                      animate={{ opacity: [0.6, 1, 0.6] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="mt-0.5 text-[7px] md:text-[9px] font-bold text-[hsl(195_80%_60%)] tracking-widest"
                    >
                      ▶ DEPLOY
                    </motion.span>
                  )}
                </motion.button>
              </motion.div>
            );
          })}
        </div>

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-white/40"
        >
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[hsl(45_90%_55%)] shadow-[0_0_6px_hsl(45_90%_55%/0.5)]" /> HQ
          </span>
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
            <Radio className="h-3 w-3 text-[hsl(45_90%_60%)]" /> Coming Soon
          </span>
        </motion.div>
      </div>

      {/* Guide Character */}
      <GuideCharacter avatarConfig={avatarConfig} message={guideMessage} onTap={cycleIdleMessage} />

      {/* World Detail Panel */}
      <AnimatePresence>
        {selectedWorld && (
          <WorldDetailPanel
            world={selectedWorld}
            mission={selectedMission}
            missionProgress={missionProgress}
            learningMode={learningMode}
            age={age}
            onClose={() => setSelectedWorld(null)}
            onStartLevel={handleStartLevel}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
