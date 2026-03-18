import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Star, CheckCircle2, Zap, Map } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { MISSIONS, getTotalGames, type LearningMode } from "@/data/missions";
import { getLevelRank } from "@/data/levelTitles";
import HeroAvatar from "@/components/avatar/HeroAvatar";

// World map nodes — maps mission IDs to themed world names
const WORLD_NODES = [
  {
    missionId: "password-safety",
    worldName: "Password Peak",
    emoji: "🏔️",
    description: "Master the art of unbreakable passwords!",
    bgGradient: "from-primary/20 to-primary/5",
    accentColor: "border-primary",
    glowColor: "shadow-[0_0_20px_hsl(195_85%_50%/0.3)]",
  },
  {
    missionId: "scam-detection",
    worldName: "Scam City",
    emoji: "🏙️",
    description: "Spot fakes and outsmart the tricksters!",
    bgGradient: "from-accent/20 to-accent/5",
    accentColor: "border-accent",
    glowColor: "shadow-[0_0_20px_hsl(30_95%_55%/0.3)]",
  },
  {
    missionId: "personal-info",
    worldName: "Secret Forest",
    emoji: "🌲",
    description: "Guard your personal secrets in the enchanted woods!",
    bgGradient: "from-secondary/20 to-secondary/5",
    accentColor: "border-secondary",
    glowColor: "shadow-[0_0_20px_hsl(160_65%_48%/0.3)]",
  },
  {
    missionId: "malware-monsters",
    worldName: "Malware Mountain",
    emoji: "🌋",
    description: "Battle viruses and trojans at the summit!",
    bgGradient: "from-destructive/20 to-destructive/5",
    accentColor: "border-destructive",
    glowColor: "shadow-[0_0_20px_hsl(0_84%_60%/0.3)]",
  },
  {
    missionId: "safe-websites",
    worldName: "Safe Surf Beach",
    emoji: "🏖️",
    description: "Navigate the web waves safely!",
    bgGradient: "from-primary/15 to-secondary/10",
    accentColor: "border-primary",
    glowColor: "shadow-[0_0_20px_hsl(195_85%_50%/0.2)]",
  },
  {
    missionId: "phishy-messages",
    worldName: "Phishing Bay",
    emoji: "🐟",
    description: "Catch the phishy messages before they catch you!",
    bgGradient: "from-accent/15 to-primary/10",
    accentColor: "border-accent",
    glowColor: "shadow-[0_0_20px_hsl(30_95%_55%/0.2)]",
  },
  {
    missionId: "smart-sharing",
    worldName: "Sharing Meadows",
    emoji: "🌻",
    description: "Learn what's safe to share in the open meadows!",
    bgGradient: "from-secondary/15 to-accent/10",
    accentColor: "border-secondary",
    glowColor: "shadow-[0_0_20px_hsl(160_65%_48%/0.2)]",
  },
  {
    missionId: "device-defender",
    worldName: "Device Fortress",
    emoji: "🏰",
    description: "Defend your devices in the mighty fortress!",
    bgGradient: "from-primary/15 to-destructive/10",
    accentColor: "border-primary",
    glowColor: "shadow-[0_0_20px_hsl(195_85%_50%/0.2)]",
  },
  {
    missionId: "cyber-clues",
    worldName: "Mystery Caves",
    emoji: "🕵️",
    description: "Follow the clues through the digital caves!",
    bgGradient: "from-accent/15 to-secondary/10",
    accentColor: "border-accent",
    glowColor: "shadow-[0_0_20px_hsl(30_95%_55%/0.2)]",
  },
  {
    missionId: "internet-detective",
    worldName: "Truth Tower",
    emoji: "🗼",
    description: "Rise to the top and separate fact from fiction!",
    bgGradient: "from-secondary/15 to-primary/10",
    accentColor: "border-secondary",
    glowColor: "shadow-[0_0_20px_hsl(160_65%_48%/0.2)]",
  },
];

type NodeStatus = "completed" | "unlocked" | "locked";

function getStars(score: number, maxScore: number): number {
  if (maxScore === 0) return 0;
  const ratio = score / maxScore;
  if (ratio >= 0.9) return 3;
  if (ratio >= 0.6) return 2;
  if (ratio > 0) return 1;
  return 0;
}

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
        .from("child_profiles")
        .select("*")
        .eq("id", activeChildId!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!activeChildId,
  });

  const { data: missionProgress = [] } = useQuery({
    queryKey: ["mission_progress", activeChildId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mission_progress")
        .select("*")
        .eq("child_id", activeChildId!);
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

  // Gate: redirect to hero creation if no avatar
  useEffect(() => {
    if (child && !hasAvatar) navigate("/edit-avatar");
  }, [child, hasAvatar, navigate]);

  // Determine node statuses
  const nodeStatuses: { status: NodeStatus; stars: number; score: number; maxScore: number }[] =
    WORLD_NODES.map((node, index) => {
      const expectedTotal = getTotalGames(learningMode);
      const progress = missionProgress.find(
        (p) => p.mission_id === node.missionId && (p.max_score ?? expectedTotal) === expectedTotal
      );

      if (progress?.status === "completed") {
        return {
          status: "completed" as const,
          stars: getStars(progress.score, progress.max_score),
          score: progress.score,
          maxScore: progress.max_score,
        };
      }

      // First mission is always unlocked; otherwise unlock if previous is completed
      if (index === 0) {
        return { status: "unlocked" as const, stars: 0, score: 0, maxScore: 0 };
      }

      const prevNode = WORLD_NODES[index - 1];
      const prevProgress = missionProgress.find(
        (p) => p.mission_id === prevNode.missionId && p.status === "completed"
      );

      return {
        status: prevProgress ? ("unlocked" as const) : ("locked" as const),
        stars: 0,
        score: 0,
        maxScore: 0,
      };
    });

  const totalStars = nodeStatuses.reduce((sum, n) => sum + n.stars, 0);
  const completedCount = nodeStatuses.filter((n) => n.status === "completed").length;

  const handleNodeClick = (node: typeof WORLD_NODES[number], status: NodeStatus) => {
    if (status === "locked") return;
    navigate(`/missions?mission=${node.missionId}`);
  };

  return (
    <div className="min-h-screen bg-background pb-24 pt-20">
      {/* Header */}
      <div className="mx-auto max-w-4xl px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex flex-wrap items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <Map className="h-7 w-7 text-primary" />
            <div>
              <h1 className="text-2xl font-bold md:text-3xl">Mission World Map</h1>
              <p className="text-sm text-muted-foreground">
                {rank.emoji} {rank.title} · {completedCount}/{WORLD_NODES.length} worlds conquered
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
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

        {/* Player hero banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          className="mb-8 flex items-center gap-4 rounded-2xl border-2 border-border bg-card p-4 shadow-card"
        >
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
          >
            <HeroAvatar avatarConfig={avatarConfig} size={64} fallbackEmoji="🦸" />
          </motion.div>
          <div>
            <p className="text-sm font-bold text-primary">{child?.name ?? "Hero"}</p>
            <p className="text-sm text-foreground">
              Welcome to the World Map! Complete each world to unlock the next adventure! 🗺️✨
            </p>
          </div>
        </motion.div>

        {/* Map path */}
        <div className="relative">
          {/* Connecting line */}
          <div className="absolute left-8 top-0 bottom-0 w-1 rounded-full bg-border md:left-1/2 md:-translate-x-1/2" />

          <div className="space-y-6">
            {WORLD_NODES.map((node, index) => {
              const { status, stars } = nodeStatuses[index];
              const mission = MISSIONS.find((m) => m.id === node.missionId);
              const isEven = index % 2 === 0;
              const isClickable = status !== "locked";

              return (
                <motion.div
                  key={node.missionId}
                  initial={{ opacity: 0, x: isEven ? -30 : 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                  className={`relative flex items-center gap-4 md:gap-0 ${
                    isEven ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                >
                  {/* Node connector dot */}
                  <div className="absolute left-8 z-10 md:left-1/2 md:-translate-x-1/2">
                    <div
                      className={`h-5 w-5 rounded-full border-[3px] ${
                        status === "completed"
                          ? "border-secondary bg-secondary"
                          : status === "unlocked"
                          ? "border-primary bg-primary animate-pulse"
                          : "border-muted-foreground/30 bg-muted"
                      }`}
                    />
                  </div>

                  {/* Spacer for the line area */}
                  <div className="w-16 shrink-0 md:w-1/2" />

                  {/* Card */}
                  <div className={`flex-1 md:w-1/2 ${isEven ? "md:pr-10" : "md:pl-10"}`}>
                    <motion.button
                      onClick={() => handleNodeClick(node, status)}
                      disabled={!isClickable}
                      whileHover={isClickable ? { scale: 1.02 } : {}}
                      whileTap={isClickable ? { scale: 0.98 } : {}}
                      className={`group relative w-full rounded-2xl border-2 bg-gradient-to-br p-5 text-left transition-all ${
                        node.bgGradient
                      } ${
                        status === "completed"
                          ? `${node.accentColor} ${node.glowColor}`
                          : status === "unlocked"
                          ? `${node.accentColor} ${node.glowColor} ring-2 ring-primary/20`
                          : "border-muted opacity-50 grayscale"
                      }`}
                    >
                      {/* Status badge */}
                      <div className="absolute -top-2.5 right-4">
                        {status === "completed" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-xs font-bold text-secondary-foreground">
                            <CheckCircle2 className="h-3 w-3" /> Complete
                          </span>
                        )}
                        {status === "unlocked" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-xs font-bold text-primary-foreground animate-pulse">
                            ▶ Play Now
                          </span>
                        )}
                        {status === "locked" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-bold text-muted-foreground">
                            <Lock className="h-3 w-3" /> Locked
                          </span>
                        )}
                      </div>

                      <div className="flex items-start gap-4">
                        {/* World emoji */}
                        <div
                          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-3xl ${
                            status === "locked" ? "bg-muted" : "bg-card shadow-sm"
                          }`}
                        >
                          {status === "locked" ? (
                            <Lock className="h-6 w-6 text-muted-foreground" />
                          ) : (
                            node.emoji
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="text-lg font-bold leading-tight">
                            {node.worldName}
                          </h3>
                          <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                            {node.description}
                          </p>

                          {/* Stars */}
                          {status === "completed" && (
                            <div className="mt-2 flex items-center gap-0.5">
                              {[1, 2, 3].map((s) => (
                                <Star
                                  key={s}
                                  className={`h-4 w-4 ${
                                    s <= stars
                                      ? "text-accent fill-[hsl(var(--accent))]"
                                      : "text-muted-foreground/30"
                                  }`}
                                />
                              ))}
                            </div>
                          )}

                        </div>
                      </div>
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* End marker */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: WORLD_NODES.length * 0.1 + 0.2 }}
            className="relative mt-6 flex items-center gap-4 md:justify-center"
          >
            <div className="absolute left-8 z-10 md:left-1/2 md:-translate-x-1/2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-lg">
                🏆
              </div>
            </div>
            <div className="w-16 shrink-0 md:hidden" />
            <p className="text-sm font-bold text-muted-foreground md:ml-12">
              More worlds coming soon...
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
