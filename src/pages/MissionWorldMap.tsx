import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Star, Zap, Shield } from "lucide-react";
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
    // Position on the map (% from center hub)
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
  [50, 14],   // Password Peak
  [82, 26],   // Phish Lagoon
  [88, 54],   // Browse Bazaar
  [75, 82],   // Privacy Palace
  [25, 82],   // Download Dungeon
  [12, 54],   // Stranger Shore
  [18, 26],   // Kindness Kingdom
];

function MapPaths({ statuses }: { statuses: NodeStatus[] }) {
  const points = PATH_COORDS;
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      {/* Hub to first world */}
      <line x1={50} y1={48} x2={points[0][0]} y2={points[0][1]}
        stroke="hsl(195 85% 50% / 0.3)" strokeWidth="0.4" strokeDasharray="1.5 1" />
      {/* World-to-world paths */}
      {points.map((p, i) => {
        if (i === points.length - 1) return null;
        const next = points[i + 1];
        const active = statuses[i] === "completed";
        return (
          <line
            key={i}
            x1={p[0]} y1={p[1]}
            x2={next[0]} y2={next[1]}
            stroke={active ? "hsl(160 65% 48% / 0.5)" : "hsl(200 15% 42% / 0.18)"}
            strokeWidth="0.4"
            strokeDasharray={active ? "none" : "1.5 1"}
          />
        );
      })}
      {/* Last world back toward hub (visual loop hint) */}
      <line x1={points[6][0]} y1={points[6][1]} x2={50} y2={48}
        stroke="hsl(200 15% 42% / 0.12)" strokeWidth="0.3" strokeDasharray="1.5 1" />
    </svg>
  );
}

/* ─── Main Component ─────────────────────────────────── */
export default function MissionWorldMap() {
  const { user, activeChildId } = useAuth();
  const navigate = useNavigate();

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

  // Find current world (first unlocked)
  const currentWorldIdx = nodeStatuses.findIndex((n) => n.status === "unlocked");

  const handleWorldClick = (world: typeof WORLDS[number], status: NodeStatus) => {
    if (status === "locked") return;
    navigate(`/missions?mission=${world.id}`);
  };

  return (
    <div className="min-h-screen bg-background pb-24 pt-20">
      <div className="mx-auto max-w-5xl px-4">
        {/* Header bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 flex flex-wrap items-center justify-between gap-3"
        >
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">🗺️ Adventure Map</h1>
            <p className="text-sm text-muted-foreground">
              {rank.emoji} {rank.title} · {completedCount}/{WORLDS.length} worlds conquered
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1.5">
              <Star className="h-4 w-4 text-accent" fill="hsl(var(--accent))" />
              <span className="text-sm font-bold">{totalStars}</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1.5">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm font-bold">{points} XP</span>
            </div>
          </div>
        </motion.div>

        {/* ─── THE MAP ─────────────────────────────────── */}
        <div className="relative mx-auto aspect-square max-w-3xl w-full">
          {/* Background texture */}
          <div className="absolute inset-0 rounded-3xl border-2 border-border bg-card overflow-hidden shadow-lg">
            {/* Subtle grid pattern */}
            <div className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: "radial-gradient(circle, hsl(195 85% 50%) 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            />
          </div>

          {/* SVG path connections */}
          <MapPaths statuses={nodeStatuses.map((n) => n.status)} />

          {/* Central Hub */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2"
          >
            <div className="flex flex-col items-center">
              <div className="relative flex h-20 w-20 md:h-24 md:w-24 items-center justify-center rounded-full border-[3px] border-primary bg-card shadow-[0_0_30px_hsl(195_85%_50%/0.25)]">
                <motion.div
                  animate={{ y: [0, -3, 0] }}
                  transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                >
                  <HeroAvatar avatarConfig={avatarConfig} size={52} fallbackEmoji="🦸" />
                </motion.div>
                <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground shadow">
                  <Shield className="h-3.5 w-3.5" />
                </div>
              </div>
              <div className="mt-2 rounded-full bg-primary/10 px-3 py-0.5">
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
                    status === "locked" ? "opacity-40 grayscale cursor-not-allowed" : "cursor-pointer"
                  }`}
                >
                  {/* Current world indicator */}
                  {isCurrent && (
                    <motion.div
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="absolute -top-2 -left-2 -right-2 -bottom-2 rounded-2xl border-2 border-primary/40 bg-primary/5 z-0"
                    />
                  )}

                  {/* World icon circle */}
                  <div
                    className={`relative flex h-14 w-14 md:h-[72px] md:w-[72px] items-center justify-center rounded-xl border-2 bg-gradient-to-br text-2xl md:text-3xl shadow-md transition-shadow ${
                      status === "completed"
                        ? `${world.borderColor} ${world.color} shadow-[0_0_16px_hsl(${world.glowHsl}/0.3)]`
                        : status === "unlocked"
                        ? `${world.borderColor} ${world.color} shadow-[0_0_16px_hsl(${world.glowHsl}/0.2)]`
                        : "border-muted bg-muted"
                    }`}
                  >
                    {status === "locked" ? (
                      <Lock className="h-5 w-5 md:h-6 md:w-6 text-muted-foreground" />
                    ) : (
                      <span className="drop-shadow">{world.icon}</span>
                    )}

                    {/* Completion check */}
                    {status === "completed" && (
                      <div className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-[10px] text-secondary-foreground shadow">
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
                            s <= stars ? "text-accent fill-[hsl(var(--accent))]" : "text-muted-foreground/20"
                          }`}
                        />
                      ))}
                    </div>
                  )}

                  {/* World name label */}
                  <div className={`mt-1 rounded-lg px-2 py-0.5 ${
                    status === "locked" ? "bg-muted/60" : world.bgTile
                  }`}>
                    <p className={`text-[9px] md:text-[11px] font-bold leading-tight whitespace-nowrap ${
                      status === "locked" ? "text-muted-foreground" : "text-foreground"
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
            <p className="text-xs text-muted-foreground font-medium text-center">
              🏆 Complete all worlds to earn your certificate!
            </p>
          </motion.div>
        </div>

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground"
        >
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-primary animate-pulse" /> Current
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-secondary" /> Completed
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-muted border border-muted-foreground/20" /> Locked
          </span>
        </motion.div>
      </div>
    </div>
  );
}
