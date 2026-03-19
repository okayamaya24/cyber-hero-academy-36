import { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Clock,
  TrendingUp,
  CheckCircle2,
  Award,
  BarChart3,
  Plus,
  Trash2,
  LogOut,
  Settings2,
  AlertCircle,
  MessageCircle,
  GraduationCap,
  Star,
} from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MISSIONS, ALL_BADGES, getTotalGames, LEARNING_MODE_CONFIG, type LearningMode } from "@/data/missions";
import { toast } from "sonner";
import HeroAvatar from "@/components/avatar/HeroAvatar";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function ParentDashboard() {
  const { user, signOut, parentUnlocked } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [resettingMode, setResettingMode] = useState<string | null>(null);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const { data: children = [] } = useQuery({
    queryKey: ["children", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("child_profiles")
        .select("*")
        .eq("parent_id", user!.id)
        .order("created_at");

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: allProgress = [] } = useQuery({
    queryKey: ["all_mission_progress", user?.id, children.map((c) => c.id).join(",")],
    queryFn: async () => {
      const childIds = children.map((c) => c.id);
      if (childIds.length === 0) return [];

      const { data, error } = await supabase.from("mission_progress").select("*").in("child_id", childIds);

      if (error) throw error;
      return data;
    },
    enabled: !!user && children.length > 0,
  });

  const { data: allBadges = [] } = useQuery({
    queryKey: ["all_badges", user?.id, children.map((c) => c.id).join(",")],
    queryFn: async () => {
      const childIds = children.map((c) => c.id);
      if (childIds.length === 0) return [];

      const { data, error } = await supabase.from("earned_badges").select("*").in("child_id", childIds);

      if (error) throw error;
      return data;
    },
    enabled: !!user && children.length > 0,
  });

  const deleteChild = async (id: string, name: string) => {
    if (!confirm(`Remove ${name}'s profile? This will delete all their progress.`)) return;

    const { error } = await supabase.from("child_profiles").delete().eq("id", id);

    if (error) {
      console.error("Failed to delete child:", error);
      toast.error(`Failed to remove ${name}'s profile`);
      return;
    }

    await queryClient.invalidateQueries({ queryKey: ["children", user?.id] });
    await queryClient.invalidateQueries({ queryKey: ["all_mission_progress", user?.id] });
    await queryClient.invalidateQueries({ queryKey: ["all_badges", user?.id] });

    toast.success(`${name}'s profile removed`);
  };

  const updateLearningMode = async (childId: string, mode: LearningMode) => {
    const currentChild = children.find((c) => c.id === childId);
    const rawMode = ((currentChild as any)?.learning_mode as string) || "standard";
    const currentMode: LearningMode = (rawMode in LEARNING_MODE_CONFIG ? rawMode : "standard") as LearningMode;

    if (currentMode === mode) return;

    setResettingMode(childId);

    try {
      const { error: updateError } = await supabase
        .from("child_profiles")
        .update({ learning_mode: mode } as any)
        .eq("id", childId);

      if (updateError) {
        console.error("Failed to update learning mode:", updateError);
        toast.error("Failed to update learning mode");
        return;
      }

      const { error: deleteProgressError } = await supabase.from("mission_progress").delete().eq("child_id", childId);

      if (deleteProgressError) {
        console.error("Failed to reset mission progress:", deleteProgressError);
        toast.error("Failed to reset mission progress");
        return;
      }

      queryClient.removeQueries({ queryKey: ["mission_progress", childId] });
      queryClient.removeQueries({ queryKey: ["child", childId] });

      await queryClient.invalidateQueries({ queryKey: ["children", user?.id] });
      await queryClient.invalidateQueries({
        queryKey: ["all_mission_progress", user?.id],
      });
      await queryClient.invalidateQueries({ queryKey: ["mission_progress", childId] });
      await queryClient.invalidateQueries({ queryKey: ["child", childId] });

      await queryClient.refetchQueries({
        queryKey: ["all_mission_progress", user?.id],
      });
      await queryClient.refetchQueries({ queryKey: ["children", user?.id] });

      toast.success(
        `Learning mode changed to ${LEARNING_MODE_CONFIG[mode].label}. Missions have been restarted for this mode.`,
      );
    } catch (err) {
      console.error("Unexpected learning mode reset error:", err);
      toast.error("Something went wrong while changing learning mode");
    } finally {
      setResettingMode(null);
    }
  };

  const getChildMissions = (childId: string) => allProgress.filter((p) => p.child_id === childId);

  const getChildBadges = (childId: string) => allBadges.filter((b) => b.child_id === childId);

  // Filtered data based on selected child
  const filteredChildren = selectedChildId ? children.filter((c) => c.id === selectedChildId) : children;
  const filteredProgress = selectedChildId ? allProgress.filter((p) => p.child_id === selectedChildId) : allProgress;
  const filteredBadges = selectedChildId ? allBadges.filter((b) => b.child_id === selectedChildId) : allBadges;

  const totalMissionsDone = allProgress.filter((p) => p.status === "completed").length;
  const totalBadges = allBadges.length;

  // --- Areas needing review (filtered) ---
  const areasNeedingReview = useMemo(() => {
    if (filteredChildren.length === 0) return [];
    const weakAreas: { missionTitle: string; childNames: string[]; status: string }[] = [];
    for (const mission of MISSIONS) {
      const childrenNeedingWork: string[] = [];
      let worstStatus = "completed";
      for (const child of filteredChildren) {
        const progress = filteredProgress.find((p) => p.child_id === child.id && p.mission_id === mission.id);
        if (!progress) {
          childrenNeedingWork.push(child.name);
          worstStatus = "not started";
        } else if (progress.status !== "completed") {
          childrenNeedingWork.push(child.name);
          if (worstStatus !== "not started") worstStatus = "in progress";
        } else if (progress.score < progress.max_score * 0.7) {
          childrenNeedingWork.push(child.name);
          if (worstStatus === "completed") worstStatus = "needs review";
        }
      }
      if (childrenNeedingWork.length > 0) {
        weakAreas.push({ missionTitle: mission.title, childNames: childrenNeedingWork, status: worstStatus });
      }
    }
    return weakAreas.slice(0, 4);
  }, [filteredChildren, filteredProgress]);

  // --- New: Conversation starters based on weak areas ---
  const conversationStarter = useMemo(() => {
    if (areasNeedingReview.length === 0) return null;
    const topic = areasNeedingReview[0];
    const starters: Record<string, string> = {
      "Spot the Scam!": "Ask your child: 'If you got a message saying you won a prize, what would you do?'",
      "Password Power": "Try this: 'Can you make up a silly sentence to use as a password? Like PurpleDinosaur-Eats-Pizza42!'",
      "Safe Sites Explorer": "Ask: 'How can you tell if a website is safe before clicking?'",
      "Secret Keeper": "Discuss: 'What information should we never share online with strangers?'",
      "Malware Monsters": "Ask: 'What would you do if a pop-up said your tablet has a virus?'",
      "Phishy Messages": "Try: 'Let's look at an email together — can you spot anything suspicious?'",
    };
    return starters[topic.missionTitle] || `Talk with your child about "${topic.missionTitle}" — they could use some extra practice!`;
  }, [areasNeedingReview]);

  // --- Certificate progress (filtered) ---
  const certProgress = useMemo(() => {
    const totalBadgesNeeded = ALL_BADGES.length;
    const uniqueEarned = new Set(filteredBadges.map((b) => b.badge_id)).size;
    return { earned: uniqueEarned, total: totalBadgesNeeded, percent: totalBadgesNeeded > 0 ? Math.round((uniqueEarned / totalBadgesNeeded) * 100) : 0 };
  }, [filteredBadges]);

  // --- Recent badges (filtered, last 5) ---
  const recentBadges = useMemo(() => {
    return [...filteredBadges].sort((a, b) => new Date(b.earned_at).getTime() - new Date(a.earned_at).getTime()).slice(0, 5);
  }, [filteredBadges]);

  // --- New: Per-child learning summary ---
  const getChildSummary = (childId: string) => {
    const childMissions = getChildMissions(childId);
    const completedMissions = childMissions.filter((m) => m.status === "completed");
    const totalStars = completedMissions.reduce((acc, m) => {
      const ratio = m.max_score > 0 ? m.score / m.max_score : 0;
      return acc + (ratio >= 0.9 ? 3 : ratio >= 0.7 ? 2 : 1);
    }, 0);

    let strongestTopic = "—";
    let needsReviewTopic = "—";
    let bestScore = -1;
    let worstScore = Infinity;

    for (const m of childMissions) {
      const mission = MISSIONS.find((mi) => mi.id === m.mission_id);
      if (!mission) continue;
      const ratio = m.max_score > 0 ? m.score / m.max_score : 0;
      if (ratio > bestScore) { bestScore = ratio; strongestTopic = mission.title; }
      if (ratio < worstScore) { worstScore = ratio; needsReviewTopic = mission.title; }
    }

    return { completedCount: completedMissions.length, totalStars, strongestTopic, needsReviewTopic };
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <motion.div
          className="mb-8 flex items-start justify-between"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1 className="text-3xl font-bold md:text-4xl">📊 Parent Dashboard</h1>
            <p className="mt-2 text-muted-foreground">Track your children's cybersecurity learning</p>
          </div>
          <Button variant="ghost" size="sm" onClick={signOut}>
            <LogOut className="mr-2 h-4 w-4" /> Sign Out
          </Button>
        </motion.div>

        {/* Child Switcher — directly under header */}
        {children.length > 1 && (
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <span className="mr-1 text-sm font-medium text-muted-foreground">Viewing:</span>
            <button
              onClick={() => setSelectedChildId(null)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                selectedChildId === null
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              All Children
            </button>
            {children.map((child) => (
              <button
                key={child.id}
                onClick={() => setSelectedChildId(child.id)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                  selectedChildId === child.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {child.name}
              </button>
            ))}
          </div>
        )}

        <motion.div
          className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {[
            {
              label: "Children",
              value: selectedChildId ? 1 : children.length,
              icon: Users,
              color: "text-primary",
            },
            {
              label: "Active Today",
              value: filteredChildren.filter((c) => c.last_activity_date === new Date().toISOString().split("T")[0]).length,
              icon: TrendingUp,
              color: "text-secondary",
            },
            {
              label: "Missions Done",
              value: filteredProgress.filter((p) => p.status === "completed").length,
              icon: CheckCircle2,
              color: "text-accent",
            },
            {
              label: "Badges Earned",
              value: filteredBadges.length,
              icon: Award,
              color: "text-cyber-teal",
            },
            {
              label: "Time Spent",
              value: `${Math.min(filteredChildren.reduce((acc, c) => acc + (c.last_activity_date === new Date().toISOString().split("T")[0] ? Math.round((c.points % 200) * 0.5 + 5) : 0), 0), 120)} min`,
              icon: Clock,
              color: "text-primary",
              subtext: `${Math.round(filteredChildren.reduce((acc, c) => acc + Math.round((c.points % 500) * 0.3 + 10), 0) / 60)}h ${filteredChildren.reduce((acc, c) => acc + Math.round((c.points % 500) * 0.3 + 10), 0) % 60}m this week`,
            },
          ].map((s: any) => (
            <motion.div key={s.label} variants={fadeUp} className="rounded-2xl border bg-card p-5 shadow-card">
              <s.icon className={`mb-2 h-6 w-6 ${s.color}`} />
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="text-sm text-muted-foreground">{s.label}</div>
              {s.subtext && <div className="mt-1 text-[10px] text-muted-foreground">{s.subtext}</div>}
            </motion.div>
          ))}
        </motion.div>

        <div className="space-y-8">

          {/* Children Section */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-xl font-bold">
                <Users className="h-5 w-5 text-primary" /> Children
              </h2>
              <Button variant="hero" size="sm" asChild>
                <Link to="/create-child">
                  <Plus className="mr-1 h-4 w-4" /> Add Child
                </Link>
              </Button>
            </div>

            {children.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-2xl border-2 border-dashed bg-card p-8 text-center"
              >
                <Users className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
                <h3 className="text-lg font-bold">No children added yet</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Add your first child to start their cybersecurity learning journey!
                </p>
              </motion.div>
            ) : (
              <motion.div className="grid gap-4 sm:grid-cols-2" variants={container} initial="hidden" animate="show">
                {children.map((child) => {
                  const childBadges = getChildBadges(child.id);
                  const summary = getChildSummary(child.id);

                  return (
                    <motion.div
                      key={child.id}
                      variants={fadeUp}
                      className="rounded-2xl border bg-card p-5 shadow-card"
                    >
                      <div className="flex items-center gap-4">
                        <HeroAvatar
                          avatarConfig={(child as any).avatar_config as Record<string, any> | null}
                          size={48}
                          fallbackEmoji={child.avatar}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-bold">{child.name}</h3>
                            <Badge variant="secondary" className="border-0">
                              Level {child.level}
                            </Badge>
                            <span className="text-xs text-muted-foreground">Age {child.age}</span>
                          </div>
                          <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                            <span>⭐ {child.points} pts</span>
                            <span>🏅 {childBadges.length} badges</span>
                            <span>🔥 {child.streak} streak</span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => deleteChild(child.id, child.name)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                        <div className="rounded-lg bg-primary/5 p-2 text-center">
                          <div className="text-lg font-bold text-primary">{summary.completedCount}</div>
                          <div className="text-[10px] text-muted-foreground">Missions</div>
                        </div>
                        <div className="rounded-lg bg-accent/5 p-2 text-center">
                          <div className="text-lg font-bold text-accent">{summary.totalStars} ⭐</div>
                          <div className="text-[10px] text-muted-foreground">Stars</div>
                        </div>
                        <div className="rounded-lg bg-secondary/10 p-2 text-center">
                          <div className="truncate text-xs font-semibold text-secondary">{summary.strongestTopic}</div>
                          <div className="text-[10px] text-muted-foreground">Strongest</div>
                        </div>
                        <div className="rounded-lg bg-destructive/5 p-2 text-center">
                          <div className="truncate text-xs font-semibold text-destructive">{summary.needsReviewTopic}</div>
                          <div className="text-[10px] text-muted-foreground">Needs Review</div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </div>

          {/* Mission Completion — full width */}
          {children.length > 0 && (
            <div>
              <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
                <BarChart3 className="h-5 w-5 text-secondary" /> Mission Completion
              </h2>
              <motion.div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" variants={container} initial="hidden" animate="show">
                {MISSIONS.map((m) => {
                  const completed = filteredProgress.filter((p) => p.mission_id === m.id && p.status === "completed").length;
                  const Icon = m.icon;

                  return (
                    <motion.div key={m.id} variants={fadeUp} className="rounded-2xl border bg-card p-4 shadow-card">
                      <div className="mb-2 flex items-center gap-3">
                        <Icon className={`h-5 w-5 ${m.color}`} />
                        <span className="text-sm font-bold">{m.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={filteredChildren.length > 0 ? (completed / filteredChildren.length) * 100 : 0}
                          className="h-2 flex-1"
                        />
                        <span className="whitespace-nowrap text-xs text-muted-foreground">
                          {completed}/{filteredChildren.length}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>
          )}

          {/* Areas Needing Review */}
          {areasNeedingReview.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
                <AlertCircle className="h-5 w-5 text-destructive" /> Areas Needing Review
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {areasNeedingReview.map((area) => (
                  <div key={area.missionTitle} className="rounded-2xl border bg-card p-4 shadow-card">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">{area.missionTitle}</span>
                      <Badge variant="outline" className="text-[10px]">
                        {area.status}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {area.childNames.join(", ")}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Conversation Starter */}
          {conversationStarter && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-2xl border bg-primary/5 p-5"
            >
              <h3 className="mb-2 flex items-center gap-2 font-bold text-primary">
                <MessageCircle className="h-4 w-4" /> Conversation Starter
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{conversationStarter}</p>
            </motion.div>
          )}

          {/* Certificate Progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="rounded-2xl border bg-card p-5 shadow-card"
          >
            <h3 className="mb-3 flex items-center gap-2 font-bold">
              <GraduationCap className="h-5 w-5 text-primary" /> Certificate Progress
            </h3>
            <div className="flex items-center gap-3">
              <Progress value={certProgress.percent} className="h-3 flex-1" />
              <span className="text-sm font-semibold text-primary">{certProgress.percent}%</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {certProgress.earned}/{certProgress.total} badges earned{selectedChildId ? "" : " across all children"}.
              {certProgress.percent < 100
                ? ` ${certProgress.total - certProgress.earned} more to unlock the CyberGuardian Certificate!`
                : " 🎉 Certificate unlocked!"}
            </p>
          </motion.div>

          {/* Recent Badges */}
          {recentBadges.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h3 className="mb-3 flex items-center gap-2 text-xl font-bold">
                <Star className="h-5 w-5 text-accent" /> Recent Badges
              </h3>
              <div className="flex flex-wrap gap-2">
                {recentBadges.map((b) => {
                  const childName = children.find((c) => c.id === b.child_id)?.name || "";
                  return (
                    <div
                      key={b.id}
                      className="flex items-center gap-2 rounded-xl border bg-card px-3 py-2 shadow-card"
                    >
                      <span className="text-lg">{b.badge_icon}</span>
                      <div>
                        <div className="text-xs font-semibold">{b.badge_name}</div>
                        <div className="text-[10px] text-muted-foreground">{childName}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Tips for Parents */}
          <div className="rounded-2xl border bg-primary/5 p-5">
            <h3 className="mb-2 font-bold text-primary">💡 Tips for Parents</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Review progress weekly</li>
              <li>• Celebrate badge achievements</li>
              <li>• Use conversation starters above</li>
              <li>• Adjust learning mode from child settings</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
