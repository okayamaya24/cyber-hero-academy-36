import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Shield, Star, Trophy, Flame, Zap, Gamepad2, CheckCircle2, Lock as LockIcon, Award, Printer } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { MISSIONS, ALL_BADGES, getTotalGames, getMissionLevels, LEARNING_MODE_CONFIG, MINI_GAME_META, type LearningMode } from "@/data/missions";
import robotGuide from "@/assets/robot-guide.png";
import AvatarRenderer from "@/components/avatar/AvatarRenderer";
import type { AvatarConfig } from "@/components/avatar/avatarConfig";
import DailyChallenge from "@/components/DailyChallenge";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function KidDashboard() {
  const { user, activeChildId, setActiveChildId } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    if (!activeChildId) { navigate("/select-child"); }
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
    return <div className="flex min-h-screen items-center justify-center"><div className="text-muted-foreground">Loading...</div></div>;
  }

  const learningMode = ((child as any)?.learning_mode as LearningMode) || "standard";
  const modeConfig = LEARNING_MODE_CONFIG[learningMode];
  const totalGamesPerMission = getTotalGames(learningMode);
  const completedMissions = missionProgress.filter((m) => m.status === "completed").length;
  const totalGamesCompleted = missionProgress.reduce((acc, mp) => {
    if (mp.status === "completed") return acc + totalGamesPerMission;
    return acc + (mp.current_question ?? 0);
  }, 0);
  const totalGamesOverall = MISSIONS.length * totalGamesPerMission;
  const earnedBadgeIds = new Set(earnedBadges.map((b) => b.badge_id));

  return (
    <div className="min-h-screen bg-background pb-12">
      <div className="gradient-hero py-8">
        <div className="container mx-auto flex flex-col items-center gap-6 px-4 sm:flex-row">
          <motion.div className="relative" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", duration: 0.6 }}>
            <AvatarRenderer config={(child as any).avatar_config as AvatarConfig | null} size={96} fallbackEmoji={child.avatar} className="rounded-full shadow-lg" />
            <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-foreground shadow">{child.level}</div>
          </motion.div>
          <motion.div className="text-center text-primary-foreground sm:text-left" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <h1 className="text-2xl font-bold">Welcome, {child.name}!</h1>
            <p className="opacity-90">Level {child.level} · Cyber Defender</p>
            <div className="mt-2 flex items-center gap-4">
              <span className="flex items-center gap-1"><Star className="h-4 w-4" /> {child.points} Points</span>
              <span className="flex items-center gap-1"><Flame className="h-4 w-4" /> {child.streak} Day Streak</span>
            </div>
          </motion.div>
          <div className="ml-auto hidden sm:flex items-center gap-3">
            <motion.img src={robotGuide} alt="Robo Buddy" className="h-28" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} />
            <Button variant="outline" size="sm" className="bg-card/20 text-primary-foreground border-primary-foreground/30 hover:bg-card/30"
              onClick={() => { setActiveChildId(null); navigate("/select-child"); }}>Switch Profile</Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-8 space-y-8">
        {/* Stats */}
        <motion.div className="grid grid-cols-2 gap-4 sm:grid-cols-4" variants={container} initial="hidden" animate="show">
          {[
            { label: "Points", value: child.points, icon: Star, color: "text-accent" },
            { label: "Games Done", value: `${totalGamesCompleted}/${totalGamesOverall}`, icon: Gamepad2, color: "text-primary" },
            { label: "Badges", value: `${earnedBadges.length}/${ALL_BADGES.length}`, icon: Trophy, color: "text-secondary" },
            { label: "Streak", value: `${child.streak}🔥`, icon: Zap, color: "text-cyber-pink" },
          ].map((s) => (
            <motion.div key={s.label} variants={fadeUp} className="rounded-2xl border bg-card p-4 text-center shadow-card">
              <s.icon className={`mx-auto mb-2 h-6 w-6 ${s.color}`} />
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Missions */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Your Missions</h2>
            <div className="flex items-center gap-2">
              <Badge className="bg-primary/10 text-primary border-0 text-xs">{modeConfig.emoji} {modeConfig.label}</Badge>
              <Button variant="outline" size="sm" asChild><Link to="/missions">View All</Link></Button>
            </div>
          </div>

          {MISSIONS.length > 0 && completedMissions === 0 && missionProgress.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl border-2 border-dashed bg-card p-8 text-center">
              <Gamepad2 className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
              <h3 className="font-bold text-lg">No missions started yet!</h3>
              <p className="mt-1 text-sm text-muted-foreground">Start your first mission to earn points and badges.</p>
              <Button variant="hero" className="mt-4" asChild><Link to="/missions">Start First Mission 🚀</Link></Button>
            </motion.div>
          ) : (
            <motion.div className="grid gap-4 sm:grid-cols-2" variants={container} initial="hidden" animate="show">
              {MISSIONS.map((m) => {
                const mp = missionProgress.find((p) => p.mission_id === m.id);
                const status = mp?.status ?? "not_started";
                const completedGames = mp?.status === "completed" ? totalGamesPerMission : (mp?.current_question ?? 0);
                const levels = getMissionLevels(m, child.age, learningMode, completedGames);
                const progress = (completedGames / totalGamesPerMission) * 100;

                return (
                  <motion.div key={m.id} variants={fadeUp}
                    className={`group relative overflow-hidden rounded-2xl border-2 bg-card p-5 shadow-card transition-all hover:shadow-playful hover:-translate-y-1 ${status === "not_started" ? "opacity-70" : ""}`}>
                    <div className="flex items-start gap-4">
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${m.bgColor} ${m.color}`}>
                        <m.icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold">{m.title}</h3>
                          {status === "completed" && <Badge className="bg-secondary text-secondary-foreground border-0">✓ Done</Badge>}
                          {status === "in_progress" && <Badge className="bg-accent text-accent-foreground border-0">In Progress</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">{m.description}</p>

                        {/* Mini level indicators */}
                        <div className="mt-2 flex gap-1.5">
                          {levels.map((level) => {
                            const levelStart = (level.level - 1) * modeConfig.gamesPerLevel;
                            const levelCompleted = Math.min(Math.max(completedGames - levelStart, 0), modeConfig.gamesPerLevel);
                            const levelDone = levelCompleted >= modeConfig.gamesPerLevel;
                            return (
                              <div key={level.level} className={`flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${
                                levelDone ? "bg-secondary/20 text-secondary" : level.locked ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"
                              }`}>
                                {levelDone ? <CheckCircle2 className="h-2.5 w-2.5" /> : level.locked ? <LockIcon className="h-2.5 w-2.5" /> : <span>{level.emoji}</span>}
                                {level.name}
                              </div>
                            );
                          })}
                        </div>

                        <div className="mt-3">
                          <div className="mb-1 flex justify-between text-xs">
                            <span>Progress</span>
                            <span className="font-bold">{completedGames}/{totalGamesPerMission} games</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                      </div>
                    </div>
                    {status !== "completed" && (
                      <Button variant="hero" size="sm" className="mt-4 w-full" asChild>
                        <Link to="/missions">{status === "in_progress" ? "Continue Mission →" : "Start Mission 🚀"}</Link>
                      </Button>
                    )}
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>

        {/* Badges */}
        <div>
          <h2 className="mb-4 text-2xl font-bold">Your Badges</h2>
             {earnedBadges.length === ALL_BADGES.length && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 rounded-2xl border-2 border-accent bg-accent/10 p-6 text-center shadow-card"
              >
                <div className="text-5xl mb-3">🏆🎉</div>
                <h3 className="text-xl font-bold mb-2">All Badges Earned!</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  You're a true Cyber Hero! Your certificate is ready!
                </p>
                <div className="flex gap-3 justify-center">
                  <Button variant="hero" asChild>
                    <Link to="/certificate"><Award className="mr-2 h-4 w-4" /> View Certificate</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/certificate"><Printer className="mr-2 h-4 w-4" /> Print Certificate</Link>
                  </Button>
                </div>
              </motion.div>
            )}

            {earnedBadges.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed bg-card p-8 text-center">
              <Trophy className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
              <h3 className="font-bold text-lg">No badges earned yet!</h3>
              <p className="mt-1 text-sm text-muted-foreground">Complete missions with a perfect score to earn badges.</p>
            </div>
          ) : (
            <motion.div className="grid grid-cols-3 gap-4 sm:grid-cols-6" variants={container} initial="hidden" animate="show">
              {ALL_BADGES.map((b) => {
                const earned = earnedBadgeIds.has(b.id);
                return (
                  <motion.div key={b.id} variants={fadeUp}
                    className={`flex flex-col items-center rounded-2xl border p-4 text-center transition-all ${earned ? "bg-card shadow-card hover:shadow-playful" : "bg-muted/50 opacity-50 grayscale"}`}>
                    <span className="mb-2 text-3xl">{b.icon}</span>
                    <span className="text-xs font-semibold">{b.name}</span>
                    {earned && <span className="mt-1 text-[10px] text-secondary font-bold">EARNED ✓</span>}
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
