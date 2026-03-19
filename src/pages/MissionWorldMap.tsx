import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Star, Zap, Shield, MessageCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { getTotalGames, type LearningMode } from "@/data/missions";
import { getLevelRank } from "@/data/levelTitles";
import HeroAvatar from "@/components/avatar/HeroAvatar";

/* ─── World definitions ─────────────────────────────────── */
const WORLDS = [
  {
    id: "password-safety",
    name: "Password Peak",
    emoji: "🏔️",
    icon: "🔑",
    description: "Forge unbreakable passwords at the summit!",
    color: "from-[hsl(195,85%,50%)] to-[hsl(195,85%,35%)]",
    bgTile: "bg-[hsl(195,85%,50%/0.12)]",
    borderColor: "border-[hsl(195,85%,50%)]",
    glowHsl: "195 85% 50%",
    pos: { top: "6%", left: "50%", tx: "-50%" },
    pathFrom: "hub",
  },
  {
    id: "scam-detection",
    name: "Phish Lagoon",
    emoji: "🐟",
    icon: "🎣",
    description: "Catch phishy scams before they catch you!",
    color: "from-[hsl(30,95%,55%)] to-[hsl(30,95%,40%)]",
    bgTile: "bg-[hsl(30,95%,55%/0.12)]",
    borderColor: "border-[hsl(30,95%,55%)]",
    glowHsl: "30 95% 55%",
    pos: { top: "18%", left: "82%", tx: "-50%" },
    pathFrom: "password-safety",
  },
  {
    id: "safe-websites",
    name: "Browse Bazaar",
    emoji: "🏪",
    icon: "🌐",
    description: "Navigate the web marketplace safely!",
    color: "from-[hsl(175,70%,42%)] to-[hsl(175,70%,30%)]",
    bgTile: "bg-[hsl(175,70%,42%/0.12)]",
    borderColor: "border-[hsl(175,70%,42%)]",
    glowHsl: "175 70% 42%",
    pos: { top: "50%", left: "88%", tx: "-50%" },
    pathFrom: "scam-detection",
  },
  {
    id: "personal-info",
    name: "Privacy Palace",
    emoji: "🏰",
    icon: "🛡️",
    description: "Guard your secrets in the royal palace!",
    color: "from-[hsl(270,60%,55%)] to-[hsl(270,60%,40%)]",
    bgTile: "bg-[hsl(270,60%,55%/0.12)]",
    borderColor: "border-[hsl(270,60%,55%)]",
    glowHsl: "270 60% 55%",
    pos: { top: "78%", left: "75%", tx: "-50%" },
    pathFrom: "safe-websites",
  },
  {
    id: "malware-monsters",
    name: "Download Dungeon",
    emoji: "🕳️",
    icon: "⬇️",
    description: "Defeat malware lurking in the dungeon depths!",
    color: "from-[hsl(0,84%,60%)] to-[hsl(0,84%,45%)]",
    bgTile: "bg-[hsl(0,84%,60%/0.12)]",
    borderColor: "border-[hsl(0,84%,60%)]",
    glowHsl: "0 84% 60%",
    pos: { top: "78%", left: "25%", tx: "-50%" },
    pathFrom: "personal-info",
  },
  {
    id: "smart-sharing",
    name: "Stranger Shore",
    emoji: "🏝️",
    icon: "🚷",
    description: "Learn who to trust on the mysterious shore!",
    color: "from-[hsl(185,80%,48%)] to-[hsl(185,80%,34%)]",
    bgTile: "bg-[hsl(185,80%,48%/0.12)]",
    borderColor: "border-[hsl(185,80%,48%)]",
    glowHsl: "185 80% 48%",
    pos: { top: "50%", left: "12%", tx: "-50%" },
    pathFrom: "malware-monsters",
  },
  {
    id: "phishy-messages",
    name: "Kindness Kingdom",
    emoji: "👑",
    icon: "💖",
    description: "Spread kindness and fight cyberbullying!",
    color: "from-[hsl(330,70%,55%)] to-[hsl(330,70%,40%)]",
    bgTile: "bg-[hsl(330,70%,55%/0.12)]",
    borderColor: "border-[hsl(330,70%,55%)]",
    glowHsl: "330 70% 55%",
    pos: { top: "18%", left: "18%", tx: "-50%" },
    pathFrom: "smart-sharing",
  },
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

/* ─── SVG path lines between positioned worlds ───────── */
const PATH_COORDS: [number, number][] = [
  [50, 14],
  [82, 26],
  [88, 54],
  [75, 82],
  [25, 82],
  [12, 54],
  [18, 26],
];

const HUB: [number, number] = [50, 48];

function MapPaths({ statuses }: { statuses: NodeStatus[] }) {
  const pts = PATH_COORDS;

  function curvedLine(
    from: [number, number],
    to: [number, number],
    status: "completed" | "active" | "locked",
    key: string,
  ) {
    const mx = (from[0] + to[0]) / 2;
    const my = (from[1] + to[1]) / 2;
    // offset control point perpendicular to line for a gentle curve
    const dx = to[0] - from[0];
    const dy = to[1] - from[1];
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const off = len * 0.18;
    const cx = mx + (-dy / len) * off;
    const cy = my + (dx / len) * off;
    const d = `M${from[0]},${from[1]} Q${cx},${cy} ${to[0]},${to[1]}`;

    const stroke =
      status === "completed"
        ? "hsl(160 65% 48% / 0.7)"
        : status === "active"
        ? "hsl(195 85% 55% / 0.4)"
        : "hsl(200 15% 50% / 0.1)";
    const width = status === "completed" ? 0.7 : 0.45;
    return (
      <path
        key={key}
        d={d}
        fill="none"
        stroke={stroke}
        strokeWidth={width}
        strokeDasharray={status === "completed" ? "none" : "1.5 1"}
        strokeLinecap="round"
        filter={status === "completed" ? "url(#pathGlow)" : undefined}
      />
    );
  }

  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <defs>
        <filter id="pathGlow">
          <feGaussianBlur stdDeviation="0.7" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Hub to first world */}
      {curvedLine(HUB, pts[0], statuses[0] === "locked" ? "locked" : "active", "hub-0")}
      {/* World-to-world */}
      {pts.map((p, i) => {
        if (i === pts.length - 1) return null;
        const s = statuses[i] === "completed" ? "completed" : statuses[i + 1] !== "locked" ? "active" : "locked";
        return curvedLine(p, pts[i + 1], s, `seg-${i}`);
      })}
      {/* Last back to hub */}
      {curvedLine(pts[6], HUB, "locked", "loop")}
    </svg>
  );
}

/* ─── Guide messages ─────────────────────────────────── */
const GUIDE_MESSAGES = {
  idle: [
    "Hey Guardian! Ready to start your journey? 🚀",
    "Every world has secrets to discover! 🔍",
    "You're doing amazing, keep it up! 💪",
    "Tap a world to begin your mission! 🎯",
  ],
  worldSelected: "Let's explore this world! 🌟",
  worldLocked: "Finish the previous world to unlock this one! 🔒",
  progress: "Great job! Keep going, hero! 🎉",
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
      {/* Speech bubble */}
      <AnimatePresence mode="wait">
        <motion.div
          key={message}
          initial={{ opacity: 0, scale: 0.85, y: 6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 6 }}
          transition={{ duration: 0.25 }}
          className="relative max-w-[200px] rounded-2xl rounded-br-sm bg-card border border-border px-3 py-2 shadow-lg"
        >
          <p className="text-xs font-medium text-foreground leading-snug">{message}</p>
          {/* Bubble tail */}
          <div className="absolute -bottom-1.5 right-4 h-3 w-3 rotate-45 bg-card border-r border-b border-border" />
        </motion.div>
      </AnimatePresence>

      {/* Avatar button */}
      <motion.button
        onClick={onTap}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="relative flex h-14 w-14 items-center justify-center rounded-full border-2 border-primary bg-card shadow-[0_0_20px_hsl(195_85%_50%/0.3)] transition-shadow hover:shadow-[0_0_28px_hsl(195_85%_50%/0.45)]"
      >
        <motion.div
          animate={{ y: [0, -2, 0] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
        >
          <HeroAvatar avatarConfig={avatarConfig} size={36} fallbackEmoji="🦸" />
        </motion.div>
        <div className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
          <MessageCircle className="h-3 w-3 text-primary-foreground" />
        </div>
      </motion.button>
    </motion.div>
  );
}

/* ─── Main Component ─────────────────────────────────── */
export default function MissionWorldMap() {
  const { user, activeChildId } = useAuth();
  const navigate = useNavigate();
  const [guideMessage, setGuideMessage] = useState(GUIDE_MESSAGES.idle[0]);
  const [idleIndex, setIdleIndex] = useState(0);

  useEffect(() => {
    if (!user) navigate("/login");
    else if (!activeChildId) navigate("/select-child");
  }, [user, activeChildId, navigate]);

  const { data: child } = useQuery({
    queryKey: ["child", activeChildId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("child_profiles").select("*").eq("id", activeChildId!).single();
      if (error) throw error;
      return data;
    },
    enabled: !!activeChildId,
  });

  const { data: missionProgress = [] } = useQuery({
    queryKey: ["mission_progress", activeChildId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mission_progress").select("*").eq("child_id", activeChildId!);
      if (error) throw error;
      return data;
    },
    enabled: !!activeChildId,
  });

  const learningMode = ((child as any)?.learning_mode as LearningMode) || "standard";
  const level = child?.level ?? 1;
  const points = child?.points ?? 0;
  const rank = getLevelRank(level);
  const avatarConfig = child?.avatar_config as Record<string, any> | null;
  const hasAvatar = !!avatarConfig?.heroSrc;

  useEffect(() => {
    if (child && !hasAvatar) navigate("/edit-avatar");
  }, [child, hasAvatar, navigate]);

  const nodeStatuses = useMemo(() => {
    const expectedTotal = getTotalGames(learningMode);
    return WORLDS.map((world, index) => {
      const progress = missionProgress.find(
        (p) => p.mission_id === world.id && (p.max_score ?? expectedTotal) === expectedTotal
      );
      if (progress?.status === "completed") {
        return { status: "completed" as const, stars: getStars(progress.score, progress.max_score) };
      }
      if (index === 0) return { status: "unlocked" as const, stars: 0 };
      const prev = WORLDS[index - 1];
      const prevDone = missionProgress.find((p) => p.mission_id === prev.id && p.status === "completed");
      return { status: prevDone ? "unlocked" as const : "locked" as const, stars: 0 };
    });
  }, [missionProgress, learningMode]);

  const totalStars = nodeStatuses.reduce((s, n) => s + n.stars, 0);
  const completedCount = nodeStatuses.filter((n) => n.status === "completed").length;
  const currentWorldIdx = nodeStatuses.findIndex((n) => n.status === "unlocked");

  // Set progress message if any worlds completed
  useEffect(() => {
    if (completedCount > 0 && completedCount < WORLDS.length) {
      setGuideMessage(GUIDE_MESSAGES.progress);
    }
  }, [completedCount]);

  const cycleIdleMessage = useCallback(() => {
    const next = (idleIndex + 1) % GUIDE_MESSAGES.idle.length;
    setIdleIndex(next);
    setGuideMessage(GUIDE_MESSAGES.idle[next]);
  }, [idleIndex]);

  const handleWorldClick = (world: typeof WORLDS[number], status: NodeStatus) => {
    if (status === "locked") {
      setGuideMessage(GUIDE_MESSAGES.worldLocked);
      return;
    }
    setGuideMessage(GUIDE_MESSAGES.worldSelected);
    // Small delay so message shows before navigation
    setTimeout(() => navigate(`/missions?mission=${world.id}`), 400);
  };

  return (
    <div className="min-h-screen pb-24 pt-20 relative overflow-hidden"
      style={{
        background: "linear-gradient(160deg, hsl(210 55% 22%), hsl(195 55% 26%), hsl(185 50% 20%))",
      }}
    >
      {/* Decorative background elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Stars / sparkles */}
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 3 + 1,
              height: Math.random() * 3 + 1,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.4 + 0.1,
            }}
            animate={{ opacity: [0.1, 0.5, 0.1] }}
            transition={{
              repeat: Infinity,
              duration: Math.random() * 3 + 2,
              delay: Math.random() * 2,
            }}
          />
        ))}
        {/* Soft cloud shapes */}
        <div className="absolute top-[8%] left-[5%] h-20 w-40 rounded-full bg-white/[0.03] blur-2xl" />
        <div className="absolute top-[15%] right-[10%] h-16 w-32 rounded-full bg-white/[0.04] blur-2xl" />
        <div className="absolute bottom-[20%] left-[15%] h-24 w-48 rounded-full bg-white/[0.03] blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-5xl px-4">
        {/* Header bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 flex flex-wrap items-center justify-between gap-3"
        >
          <div>
            <h1 className="text-2xl font-bold text-white md:text-3xl">🗺️ Adventure Map</h1>
            <p className="text-sm text-white/60">
              {rank.emoji} {rank.title} · {completedCount}/{WORLDS.length} worlds conquered
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 rounded-full bg-accent/20 px-3 py-1.5 backdrop-blur-sm">
              <Star className="h-4 w-4 text-accent" fill="hsl(var(--accent))" />
              <span className="text-sm font-bold text-white">{totalStars}</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-primary/20 px-3 py-1.5 backdrop-blur-sm">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm font-bold text-white">{points} XP</span>
            </div>
          </div>
        </motion.div>

        {/* ─── THE MAP ─────────────────────────────────── */}
        <div className="relative mx-auto aspect-square max-w-3xl w-full">
          {/* Map background */}
          <div className="absolute inset-0 rounded-3xl border border-white/10 overflow-hidden shadow-2xl"
            style={{
              background: "radial-gradient(ellipse at center, hsl(200 45% 20% / 0.9), hsl(210 40% 14% / 0.95))",
            }}
          >
            {/* Subtle grid pattern */}
            <div className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage: "radial-gradient(circle, hsl(195 85% 60%) 1px, transparent 1px)",
                backgroundSize: "28px 28px",
              }}
            />
            {/* Color zone tints per world area */}
            <div className="absolute top-0 left-1/4 right-1/4 h-1/4 rounded-b-full bg-[hsl(195,85%,50%/0.06)] blur-xl" />
            <div className="absolute top-[10%] right-0 w-1/3 h-1/3 rounded-full bg-[hsl(30,95%,55%/0.05)] blur-2xl" />
            <div className="absolute top-1/3 right-0 w-1/4 h-1/3 rounded-full bg-[hsl(175,70%,42%/0.05)] blur-2xl" />
            <div className="absolute bottom-[5%] right-1/4 w-1/3 h-1/4 rounded-full bg-[hsl(270,60%,55%/0.06)] blur-2xl" />
            <div className="absolute bottom-[5%] left-[5%] w-1/3 h-1/4 rounded-full bg-[hsl(0,84%,60%/0.05)] blur-2xl" />
            <div className="absolute top-1/3 left-0 w-1/4 h-1/3 rounded-full bg-[hsl(185,80%,48%/0.05)] blur-2xl" />
            <div className="absolute top-[10%] left-0 w-1/3 h-1/4 rounded-full bg-[hsl(330,70%,55%/0.05)] blur-2xl" />
          </div>

          {/* SVG path connections */}
          <MapPaths statuses={nodeStatuses.map((n) => n.status)} />

          {/* Central Hub - now just the label, no avatar */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2"
          >
            <div className="flex flex-col items-center">
              <div className="relative flex h-16 w-16 md:h-20 md:w-20 items-center justify-center rounded-full border-2 border-primary/60 shadow-[0_0_35px_hsl(195_85%_50%/0.35)]"
                style={{ background: "radial-gradient(circle, hsl(195 85% 50% / 0.2), hsl(220 50% 18% / 0.8))" }}
              >
                <Shield className="h-7 w-7 md:h-9 md:w-9 text-primary" />
              </div>
              <div className="mt-2 rounded-full bg-primary/15 px-3 py-0.5 backdrop-blur-sm border border-primary/20">
                <p className="text-[10px] md:text-xs font-bold text-primary whitespace-nowrap">
                  CyberGuard Academy
                </p>
              </div>
            </div>
          </motion.div>

          {/* World Nodes */}
          {WORLDS.map((world, index) => {
            const { status, stars } = nodeStatuses[index];
            const isClickable = status !== "locked";
            const isCurrent = index === currentWorldIdx;

            return (
              <motion.div
                key={world.id}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.08, type: "spring", stiffness: 180 }}
                className="absolute z-10"
                style={{
                  top: world.pos.top,
                  left: world.pos.left,
                  transform: `translateX(${world.pos.tx})`,
                }}
              >
                <motion.button
                  onClick={() => handleWorldClick(world, status)}
                  disabled={!isClickable}
                  whileHover={isClickable ? { scale: 1.08 } : {}}
                  whileTap={isClickable ? { scale: 0.95 } : {}}
                  className={`group relative flex flex-col items-center transition-all ${
                    status === "locked" ? "opacity-35 grayscale cursor-not-allowed" : "cursor-pointer"
                  }`}
                >
                  {/* Current world pulse ring */}
                  {isCurrent && (
                    <motion.div
                      animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0.15, 0.4] }}
                      transition={{ repeat: Infinity, duration: 2.5 }}
                      className="absolute -inset-3 rounded-2xl border-2 border-primary/50 z-0"
                    />
                  )}

                  {/* World icon circle */}
                  <div
                    className={`relative flex h-14 w-14 md:h-[72px] md:w-[72px] items-center justify-center rounded-xl border-2 bg-gradient-to-br text-2xl md:text-3xl transition-shadow ${
                      status === "completed"
                        ? `${world.borderColor} ${world.color} shadow-[0_4px_20px_hsl(${world.glowHsl}/0.4)]`
                        : status === "unlocked"
                        ? `${world.borderColor} ${world.color} shadow-[0_4px_20px_hsl(${world.glowHsl}/0.25)]`
                        : "border-white/10 bg-gradient-to-br from-[hsl(220,30%,25%)] to-[hsl(220,30%,18%)]"
                    }`}
                  >
                    {status === "locked" ? (
                      <Lock className="h-5 w-5 md:h-6 md:w-6 text-white/30" />
                    ) : (
                      <span className="drop-shadow-lg">{world.icon}</span>
                    )}

                    {/* Completion check */}
                    {status === "completed" && (
                      <div className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-[10px] text-secondary-foreground shadow-md">
                        ✓
                      </div>
                    )}
                  </div>

                  {/* Stars */}
                  {status === "completed" && stars > 0 && (
                    <div className="mt-1 flex gap-0.5">
                      {[1, 2, 3].map((s) => (
                        <Star
                          key={s}
                          className={`h-3 w-3 ${
                            s <= stars ? "text-accent fill-[hsl(var(--accent))]" : "text-white/15"
                          }`}
                        />
                      ))}
                    </div>
                  )}

                  {/* World name label */}
                  <div className={`mt-1 rounded-lg px-2 py-0.5 backdrop-blur-sm ${
                    status === "locked" ? "bg-white/5" : `${world.bgTile} bg-opacity-80`
                  }`}>
                    <p className={`text-[9px] md:text-[11px] font-bold leading-tight whitespace-nowrap ${
                      status === "locked" ? "text-white/30" : "text-white"
                    }`}>
                      {world.name}
                    </p>
                  </div>

                  {/* Status badge */}
                  {status === "unlocked" && (
                    <motion.span
                      animate={{ opacity: [0.7, 1, 0.7] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="mt-0.5 text-[8px] md:text-[10px] font-bold text-primary"
                    >
                      ▶ PLAY
                    </motion.span>
                  )}
                </motion.button>
              </motion.div>
            );
          })}

          {/* Trophy at bottom center */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10"
          >
            <p className="text-xs text-white/50 font-medium text-center">
              🏆 Complete all worlds to earn your certificate!
            </p>
          </motion.div>
        </div>

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-white/50"
        >
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-primary animate-pulse" /> Current
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-secondary" /> Completed
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-white/15 border border-white/10" /> Locked
          </span>
        </motion.div>
      </div>

      {/* Guide Character in corner */}
      <GuideCharacter
        avatarConfig={avatarConfig}
        message={guideMessage}
        onTap={cycleIdleMessage}
      />
    </div>
  );
}
