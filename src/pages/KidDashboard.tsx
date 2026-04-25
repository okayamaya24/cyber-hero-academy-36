import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Star, Trophy, Flame, Zap, Gamepad2, CheckCircle2, Lock as LockIcon, Award, Printer } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import {
  MISSIONS,
  ALL_BADGES,
  getTotalGames,
  getMissionLevels,
  LEARNING_MODE_CONFIG,
  type LearningMode,
} from "@/data/missions";
import { getLevelRank, getNextRank, getProgressToNextLevel } from "@/data/levelTitles";
import { fetchActiveEventsFromDB, type EventMission } from "@/data/eventMissions";
import { GUIDE_REGISTRY } from "@/data/guides";
import robotGuide from "@/assets/robot-guide.png";
import HeroAvatar from "@/components/avatar/HeroAvatar";
import DailyChallenge from "@/components/DailyChallenge";
import { usePlatformSettings } from "@/hooks/usePlatformSettings";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const BADGE_CATEGORIES = [
  {
    title: "Safety Skills",
    ids: ["scam-spotter", "phish-catcher", "truth-seeker", "cyber-detective"],
  },
  {
    title: "Security Skills",
    ids: ["password-pro", "privacy-knight", "secret-safe-keeper", "device-guardian"],
  },
  {
    title: "Web Safety",
    ids: ["safe-surfer", "website-detective", "smart-sharer", "malware-fighter"],
  },
  {
    title: "Game Achievements",
    ids: ["word-search-winner", "memory-master", "boss-battle-beginner", "boss-battle-champion"],
  },
  {
    title: "Progress & Streaks",
    ids: ["daily-learner", "3-day-streak", "7-day-streak", "deep-practice-hero", "cyber-champion", "master-hero"],
  },
];

function BadgeCard({ badge, earned }: { badge: (typeof ALL_BADGES)[number]; earned: boolean }) {
  const description =
    (badge as any).description ||
    (earned
      ? "You earned this badge. Great job, Cyber Hero!"
      : "Keep playing missions and challenges to unlock this badge.");

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.div
          variants={fadeUp}
          className={`group cursor-help rounded-2xl border p-4 text-center transition-all ${
            earned
              ? "bg-card shadow-card hover:-translate-y-1 hover:shadow-playful"
              : "bg-muted/40 opacity-70 grayscale"
          }`}
        >
          <div
            className={`mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl text-3xl ${
              earned ? "bg-primary/10" : "bg-muted"
            }`}
          >
            {badge.icon}
          </div>
          <h3 className="text-sm font-bold leading-tight">{badge.name}</h3>
          {earned ? (
            <p className="mt-2 text-[11px] font-bold text-secondary">EARNED ✓</p>
          ) : (
            <p className="mt-2 text-[11px] font-medium text-muted-foreground">LOCKED</p>
          )}
        </motion.div>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs rounded-xl text-center">
        <p className="font-semibold">{badge.name}</p>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </TooltipContent>
    </Tooltip>
  );
}

export default function KidDashboard() {
  const { user, activeChildId, setActiveChildId } = useAuth();
  const navigate = useNavigate();
  const [liveEvents, setLiveEvents] = useState<EventMission[]>([]);
  const { data: platformSettings } = usePlatformSettings();
  const worldMapEnabled = platformSettings?.world_map_enabled ?? false;

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (!activeChildId && user) {
      setActiveChildId(user.id);
    }
  }, [user, activeChildId, navigate]);

  useEffect(() => {
    fetchActiveEventsFromDB().then(setLiveEvents);
  }, []);

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

  const { data: earnedBadges = [] } = useQuery({
    queryKey: ["earned_badges", activeChildId],
    queryFn: async () => {
      const { data, error } = await supabase.from("earned_badges").select("*").eq("child_id", activeChildId!);
      if (error) throw error;
      return data;
    },
    enabled: !!activeChildId,
  });

  if (!child) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="text-muted-foreground mb-4">Loading your dashboard...</div>
          <Button variant="outline" size="sm" onClick={() => (window.location.href = "/kid-dashboard")}>
            Click here if this takes too long
          </Button>
        </div>
      </div>
    );
  }

  const learningMode = ((child as any)?.learning_mode as LearningMode) || "standard";
  const modeConfig = LEARNING_MODE_CONFIG[learningMode];
  const totalGamesPerMission = getTotalGames(learningMode);

  const totalGamesCompleted = missionProgress.reduce((acc, mp) => {
    if (mp.status === "completed") return acc + totalGamesPerMission;
    return acc + (mp.current_question ?? 0);
  }, 0);

  const totalGamesOverall = MISSIONS.length * totalGamesPerMission;
  const earnedBadgeIds = new Set(earnedBadges.map((b) => b.badge_id));
  const badgeProgress = ALL_BADGES.length > 0 ? (earnedBadges.length / ALL_BADGES.length) * 100 : 0;

  const groupedBadges = BADGE_CATEGORIES.map((category) => ({
    ...category,
    badges: category.ids.map((id) => ALL_BADGES.find((b) => b.id === id)).filter(Boolean) as typeof ALL_BADGES,
  })).filter((category) => category.badges.length > 0);

  const inProgressMissions = MISSIONS.filter((m) => {
    const mp = missionProgress.find((p) => p.mission_id === m.id);
    return mp?.status === "in_progress";
  });

  const completedMissionCards = MISSIONS.filter((m) => {
    const mp = missionProgress.find((p) => p.mission_id === m.id);
    return mp?.status === "completed";
  });

  const notStartedMissions = MISSIONS.filter((m) => {
    const mp = missionProgress.find((p) => p.mission_id === m.id);
    return !mp || mp.status === "not_started";
  });

  const recommendedMission = notStartedMissions.length > 0 ? notStartedMissions[0] : null;

  const dashboardMissions =
    inProgressMissions.length > 0
      ? inProgressMissions
      : recommendedMission
        ? [recommendedMission]
        : completedMissionCards.slice(0, 2);

  const xpProgress = getProgressToNextLevel(child.points);
  const nextRankForHeader = getNextRank(child.level);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pb-12">
      {/* ── COLORFUL HOME BASE HEADER ── */}
      <div className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 40%, #06b6d4 100%)" }}>
        {/* Decorative circles */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full bg-white/10" />
          <div className="absolute -bottom-10 -left-10 w-56 h-56 rounded-full bg-white/8" />
          <div className="absolute top-1/2 left-1/2 w-96 h-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5 blur-2xl" />
        </div>

        <div className="container relative z-10 mx-auto px-4 pt-8 pb-10">
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
            {/* Avatar */}
            <motion.div
              className="relative flex-shrink-0"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.6 }}
            >
              <div className="rounded-full p-[3px] bg-white/40 shadow-xl">
                <HeroAvatar
                  avatarConfig={(child as any).avatar_config as Record<string, any> | null}
                  size={88}
                  fallbackEmoji={child.avatar}
                  className="rounded-full"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full bg-yellow-400 text-sm font-black text-yellow-900 shadow-lg ring-2 ring-white">
                {child.level}
              </div>
            </motion.div>

            {/* Name + rank */}
            <motion.div
              className="flex-1 text-center sm:text-left"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <p className="mb-1 text-xs font-bold uppercase tracking-widest text-white/70">🏠 My Hero HQ</p>
              <h1 className="text-3xl font-black text-white drop-shadow">
                Hey, {child.name}! 👋
              </h1>
              <p className="mt-1 text-white/80 font-medium">
                {getLevelRank(child.level).emoji} {getLevelRank(child.level).title} · Level {child.level}
              </p>

              {/* XP bar in header */}
              <div className="mt-3 max-w-xs">
                <div className="mb-1.5 flex justify-between text-[11px] text-white/70">
                  <span>Level {child.level}</span>
                  <span>{xpProgress.current} / {xpProgress.needed} XP</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/20">
                  <motion.div
                    className="h-full rounded-full bg-yellow-400 shadow-sm"
                    initial={{ width: 0 }}
                    animate={{ width: `${xpProgress.percent}%` }}
                    transition={{ duration: 1.2, ease: "easeOut", delay: 0.4 }}
                  />
                </div>
                {nextRankForHeader && (
                  <p className="mt-1 text-[10px] text-white/60">Next: {nextRankForHeader.emoji} {nextRankForHeader.title}</p>
                )}
              </div>
            </motion.div>

            {/* Mascot */}
            <div className="ml-auto hidden flex-col items-end gap-2 sm:flex">
              <div className="flex items-end gap-3">
                <div className="mb-1 rounded-2xl rounded-br-sm bg-white/15 backdrop-blur px-3 py-2 text-[11px] text-white max-w-[150px] border border-white/20">
                  Looking great, {child.name}! Keep it up! ⭐
                </div>
                <motion.img
                  src={robotGuide}
                  alt="Robo Buddy"
                  className="h-24 object-contain drop-shadow-xl"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                />
              </div>
              <Button size="sm" variant="outline" className="border-white/40 bg-white/15 text-white hover:bg-white/25 backdrop-blur" asChild>
                <Link to="/edit-avatar">✏️ Customize Hero</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Wave bottom */}
        <div className="h-6 bg-gradient-to-b from-slate-50/0 to-slate-50" style={{ marginTop: "-1px", background: "linear-gradient(to bottom right, transparent 49%, #f8fafc 50%)" }} />
      </div>

      <div className="container mx-auto mt-6 space-y-8 px-4">
        {/* Stats */}
        <motion.div
          className="grid grid-cols-2 gap-4 sm:grid-cols-4"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {[
            { label: "Total XP", value: child.points.toLocaleString(), icon: Star, bg: "bg-yellow-50", border: "border-yellow-200", iconBg: "bg-yellow-100", iconColor: "text-yellow-600", valColor: "text-yellow-700" },
            { label: "Games Done", value: `${totalGamesCompleted}/${totalGamesOverall}`, icon: Gamepad2, bg: "bg-blue-50", border: "border-blue-200", iconBg: "bg-blue-100", iconColor: "text-blue-600", valColor: "text-blue-700" },
            { label: "Badges", value: `${earnedBadges.length}/${ALL_BADGES.length}`, icon: Trophy, bg: "bg-purple-50", border: "border-purple-200", iconBg: "bg-purple-100", iconColor: "text-purple-600", valColor: "text-purple-700" },
            { label: child.streak === 0 ? "Start a Streak!" : "Day Streak 🔥", value: child.streak === 0 ? "—" : child.streak, icon: Zap, bg: "bg-orange-50", border: "border-orange-200", iconBg: "bg-orange-100", iconColor: "text-orange-600", valColor: "text-orange-700" },
          ].map((s) => (
            <motion.div key={s.label} variants={fadeUp} className={`rounded-2xl border ${s.border} ${s.bg} p-4 text-center shadow-sm`}>
              <div className={`mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl ${s.iconBg}`}>
                <s.icon className={`h-5 w-5 ${s.iconColor}`} />
              </div>
              <p className={`text-2xl font-black ${s.valColor}`}>{s.value}</p>
              <p className="mt-0.5 text-xs text-gray-500">{s.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Rank Progress */}
        {(() => {
          const rank = getLevelRank(child.level);
          const nextRankData = getNextRank(child.level);
          return (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50 to-purple-50 p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{rank.emoji}</span>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{rank.title}</h3>
                    <p className="text-xs text-gray-500">{rank.description}</p>
                  </div>
                </div>
                {nextRankData && (
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-wider text-gray-400">Next rank</p>
                    <p className="text-sm font-bold text-indigo-600">{nextRankData.emoji} {nextRankData.title}</p>
                  </div>
                )}
              </div>
              {!nextRankData && <p className="mt-3 text-center text-sm font-bold text-yellow-600">🏆 Maximum rank achieved!</p>}
            </motion.div>
          );
        })()}

        {/* Daily Challenge */}
        <DailyChallenge childId={child.id} childAge={child.age} />

        {/* Special Events — pulls from database via admin portal */}
        {liveEvents.length > 0 && (
          <div>
            <h2 className="mb-4 text-2xl font-bold">🎉 Special Events</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {liveEvents.map((event) => {
                const guide = GUIDE_REGISTRY[event.guideId] ?? GUIDE_REGISTRY["captain-cyber"];
                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group overflow-hidden rounded-2xl border-2 border-accent/30 bg-gradient-to-br from-accent/5 to-primary/5 p-5 shadow-card transition-all hover:-translate-y-1 hover:shadow-playful"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-3xl">{event.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold">{event.title}</h3>
                        <p className="text-sm text-muted-foreground">{event.description}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <img src={guide.image} alt={guide.name} className="h-6 w-6 object-contain" />
                          <span className="text-xs text-muted-foreground">{guide.name}</span>
                          <span className="text-xs">
                            {event.badgeIcon} {event.badgeName}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="mt-3 w-full" asChild>
                      <Link to="/missions">Explore Event →</Link>
                    </Button>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Continue Learning */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Continue Learning</h2>
            <div className="flex items-center gap-2">
              <Badge className="border-0 bg-primary/10 text-xs text-primary">
                {modeConfig.emoji} {modeConfig.label}
              </Badge>
              <div className="flex gap-2">
                {worldMapEnabled && (
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/world-map">🗺️ World Map</Link>
                  </Button>
                )}
                <Button variant="outline" size="sm" asChild>
                  <Link to="/missions">View All</Link>
                </Button>
              </div>
            </div>
          </div>

          {dashboardMissions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50 p-8 text-center"
            >
              <Gamepad2 className="mx-auto mb-3 h-12 w-12 text-indigo-300" />
              <h3 className="text-lg font-bold text-gray-800">No missions started yet!</h3>
              <p className="mt-1 text-sm text-gray-500">Start your first mission to begin your cyber adventure.</p>
              <Button variant="hero" className="mt-4" asChild>
                <Link to="/missions">Start First Mission 🚀</Link>
              </Button>
            </motion.div>
          ) : (
            <motion.div className="grid gap-4 sm:grid-cols-2" variants={container} initial="hidden" animate="show">
              {dashboardMissions.map((m) => {
                const mp = missionProgress.find((p) => p.mission_id === m.id);
                const status = mp?.status ?? "not_started";
                const isRecommended = status === "not_started" && recommendedMission?.id === m.id;
                const completedGames = mp?.status === "completed" ? totalGamesPerMission : (mp?.current_question ?? 0);
                const levels = getMissionLevels(m, child.age, learningMode, completedGames);
                const progress = totalGamesPerMission > 0 ? (completedGames / totalGamesPerMission) * 100 : 0;

                return (
                  <motion.div
                    key={m.id}
                    variants={fadeUp}
                    className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${m.bgColor} ${m.color}`}>
                        <m.icon className="h-6 w-6" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold text-gray-900">{m.title}</h3>
                          {status === "completed" && (
                            <Badge className="border-0 bg-green-100 text-green-700">✓ Done</Badge>
                          )}
                          {status === "in_progress" && (
                            <Badge className="border-0 bg-blue-100 text-blue-700">In Progress</Badge>
                          )}
                          {isRecommended && (
                            <Badge className="border-0 bg-yellow-100 text-yellow-700">⭐ Recommended</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{m.description}</p>
                        <div className="mt-2 flex gap-1.5">
                          {levels.map((level) => {
                            const levelStart = (level.level - 1) * modeConfig.gamesPerLevel;
                            const levelCompleted = Math.min(Math.max(completedGames - levelStart, 0), modeConfig.gamesPerLevel);
                            const levelDone = levelCompleted >= modeConfig.gamesPerLevel;
                            return (
                              <div
                                key={level.level}
                                className={`flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${
                                  levelDone ? "bg-green-100 text-green-700" : level.locked ? "bg-gray-100 text-gray-400" : "bg-primary/10 text-primary"
                                }`}
                              >
                                {levelDone ? <CheckCircle2 className="h-2.5 w-2.5" /> : level.locked ? <LockIcon className="h-2.5 w-2.5" /> : <span>{level.emoji}</span>}
                                {level.name}
                              </div>
                            );
                          })}
                        </div>
                        <div className="mt-3">
                          <div className="mb-1 flex justify-between text-xs text-gray-400">
                            <span>Progress</span>
                            <span className="font-bold">{completedGames}/{totalGamesPerMission} games</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                      </div>
                    </div>
                    {status !== "completed" && (
                      <Button variant="hero" size="sm" className="mt-4 w-full" asChild>
                        <Link to={`/missions?mission=${m.id}`}>
                          {status === "in_progress" ? "Continue Mission →" : "Start Mission 🚀"}
                        </Link>
                      </Button>
                    )}
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>

        {/* Badges Trophy Wall */}
        <div>
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Your Badges 🏅</h2>
              <p className="text-sm text-muted-foreground">
                {earnedBadges.length} of {ALL_BADGES.length} badges earned
              </p>
            </div>
            <div className="w-full sm:w-72">
              <div className="mb-1 flex justify-between text-xs font-medium text-muted-foreground">
                <span>Badge Progress</span>
                <span>{Math.round(badgeProgress)}%</span>
              </div>
              <Progress value={badgeProgress} className="h-2.5" />
            </div>
          </div>

          {earnedBadges.length === ALL_BADGES.length && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 rounded-2xl border-2 border-accent bg-accent/10 p-6 text-center shadow-card"
            >
              <div className="mb-3 text-5xl">🏆🎉</div>
              <h3 className="mb-2 text-xl font-bold">All Badges Earned!</h3>
              <p className="mb-4 text-sm text-muted-foreground">You're a true Cyber Hero! Your certificate is ready!</p>
              <div className="flex justify-center gap-3">
                <Button variant="hero" asChild>
                  <Link to="/certificate">
                    <Award className="mr-2 h-4 w-4" /> View Certificate
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/certificate">
                    <Printer className="mr-2 h-4 w-4" /> Print Certificate
                  </Link>
                </Button>
              </div>
            </motion.div>
          )}

          {earnedBadges.length === 0 && (
            <div className="mb-6 rounded-2xl border-2 border-dashed bg-card p-5 text-center">
              <Trophy className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
              <p className="text-sm font-semibold">No badges earned yet — complete missions to unlock them!</p>
            </div>
          )}
          <div className="space-y-8">
            {groupedBadges.map((category) => (
              <div key={category.title}>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-bold">{category.title}</h3>
                  <span className="text-xs text-muted-foreground">
                    {category.badges.filter((badge) => earnedBadgeIds.has(badge.id)).length}/{category.badges.length}{" "}
                    earned
                  </span>
                </div>
                <motion.div
                  className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6"
                  variants={container}
                  initial="hidden"
                  animate="show"
                >
                  {category.badges.map((badge) => (
                    <BadgeCard key={badge.id} badge={badge} earned={earnedBadgeIds.has(badge.id)} />
                  ))}
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
