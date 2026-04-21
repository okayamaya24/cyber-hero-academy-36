import { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Users,
  TrendingUp,
  CheckCircle2,
  Award,
  BarChart3,
  Plus,
  Trash2,
  LogOut,
  AlertCircle,
  MessageCircle,
  GraduationCap,
  Star,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Rocket,
  Map as MapIcon,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MISSIONS, ALL_BADGES, LEARNING_MODE_CONFIG, type LearningMode } from "@/data/missions";
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

/** Conversation prompts keyed loosely by topic keywords. */
function getTalkPrompts(name: string, strongest: string, needsReview: string): string[] {
  const prompts: string[] = [];
  const matchTopic = (topic: string, kind: "strongest" | "review"): string | null => {
    const t = topic.toLowerCase();
    if (kind === "strongest") {
      if (t.includes("password")) return `Ask ${name}: What makes a password strong? Can you give me an example?`;
      if (t.includes("phish") || t.includes("scam")) return `Ask ${name}: How can you spot a fake email or message?`;
      if (t.includes("safe") || t.includes("site")) return `Ask ${name}: What clues tell you a website is safe to use?`;
      if (t.includes("secret") || t.includes("privacy")) return `Ask ${name}: What kinds of info should we keep private online?`;
      if (t.includes("malware") || t.includes("virus")) return `Ask ${name}: What's malware, and how do you avoid it?`;
      return `Ask ${name}: What was the coolest thing you learned about ${topic}?`;
    }
    if (t.includes("password")) return `Ask ${name}: Let's create a super-strong password together — want to try?`;
    if (t.includes("phish") || t.includes("scam")) return `Ask ${name}: If a message looks too good to be true, what should we do?`;
    if (t.includes("safe") || t.includes("site")) return `Ask ${name}: Want to look at a few sites together and check if they're safe?`;
    if (t.includes("secret") || t.includes("privacy")) return `Ask ${name}: What info would you NEVER share with someone you don't know?`;
    if (t.includes("malware") || t.includes("virus")) return `Ask ${name}: What should you do if a website asks you to download something unexpected?`;
    return `Ask ${name}: Want to replay the ${topic} mission together?`;
  };

  if (strongest && strongest !== "—") {
    const p = matchTopic(strongest, "strongest");
    if (p) prompts.push(p);
  }
  if (needsReview && needsReview !== "—") {
    const p = matchTopic(needsReview, "review");
    if (p) prompts.push(p);
  }
  if (prompts.length < 2) {
    prompts.push(`Ask ${name}: What's one new thing you'd teach me about staying safe online?`);
  }
  return prompts.slice(0, 3);
}

export default function ParentDashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [expandedChildId, setExpandedChildId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

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

  const { data: allBadgesRaw = [] } = useQuery({
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

  // Ensure summary totals always match per-card counts (filter out any orphaned badges)
  const allBadges = useMemo(() => {
    const validIds = new Set(children.map((c) => c.id));
    return allBadgesRaw.filter((b) => validIds.has(b.child_id));
  }, [allBadgesRaw, children]);

  const { data: allZoneProgress = [] } = useQuery({
    queryKey: ["all_zone_progress", user?.id, children.map((c) => c.id).join(",")],
    queryFn: async () => {
      const childIds = children.map((c) => c.id);
      if (childIds.length === 0) return [];
      const { data, error } = await supabase.from("zone_progress").select("*").in("child_id", childIds);
      if (error) throw error;
      return data;
    },
    enabled: !!user && children.length > 0,
  });

  const deleteChild = async (id: string) => {
    const { error } = await supabase.from("child_profiles").delete().eq("id", id);

    const name = deleteTarget?.name ?? "";
    setDeleteTarget(null);

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

  const getChildMissions = (childId: string) => allProgress.filter((p) => p.child_id === childId);
  const getChildBadges = (childId: string) => allBadges.filter((b) => b.child_id === childId);
  const getChildZones = (childId: string) => allZoneProgress.filter((z) => z.child_id === childId);

  // Filtered data based on selected child
  const filteredChildren = selectedChildId ? children.filter((c) => c.id === selectedChildId) : children;
  const filteredProgress = selectedChildId ? allProgress.filter((p) => p.child_id === selectedChildId) : allProgress;
  const filteredBadges = selectedChildId ? allBadges.filter((b) => b.child_id === selectedChildId) : allBadges;

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

  // --- Certificate progress (filtered) ---
  const certProgress = useMemo(() => {
    const totalBadgesNeeded = ALL_BADGES.length;
    const uniqueEarned = new Set(filteredBadges.map((b) => b.badge_id)).size;
    return {
      earned: uniqueEarned,
      total: totalBadgesNeeded,
      percent: totalBadgesNeeded > 0 ? Math.round((uniqueEarned / totalBadgesNeeded) * 100) : 0,
    };
  }, [filteredBadges]);

  // --- Recent badges (filtered, last 5) ---
  const recentBadges = useMemo(() => {
    return [...filteredBadges]
      .sort((a, b) => new Date(b.earned_at).getTime() - new Date(a.earned_at).getTime())
      .slice(0, 5);
  }, [filteredBadges]);

  // --- Per-child summary ---
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
      if (ratio > bestScore) {
        bestScore = ratio;
        strongestTopic = mission.title;
      }
      if (ratio < worstScore) {
        worstScore = ratio;
        needsReviewTopic = mission.title;
      }
    }

    return { completedCount: completedMissions.length, totalStars, strongestTopic, needsReviewTopic };
  };

  // --- Family totals ---
  const familyXP = useMemo(() => children.reduce((sum, c) => sum + (c.points || 0), 0), [children]);
  const familyMissions = allProgress.filter((p) => p.status === "completed").length;

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

        {/* Family Hero Report */}
        {children.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 p-6 shadow-card"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                  <Sparkles className="h-4 w-4" /> Family Hero Report
                </div>
                <h2 className="mt-1 text-2xl font-bold md:text-3xl">
                  Your family has completed {familyMissions} mission{familyMissions === 1 ? "" : "s"}! 🚀
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {children.length} hero{children.length === 1 ? "" : "es"} • {allBadges.length} badge
                  {allBadges.length === 1 ? "" : "s"} earned
                </p>
              </div>
              <div className="rounded-2xl bg-gradient-to-br from-cyan-400/20 to-blue-500/20 px-6 py-4 text-center">
                <div className="text-3xl font-bold text-primary">{familyXP.toLocaleString()}</div>
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Total Family XP</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Child Switcher */}
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

        {/* Stat boxes with light gradient */}
        <motion.div
          className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4"
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
              value: filteredChildren.filter(
                (c) => c.last_activity_date === new Date().toISOString().split("T")[0],
              ).length,
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
          ].map((s: any) => (
            <motion.div
              key={s.label}
              variants={fadeUp}
              className="rounded-2xl border bg-gradient-to-br from-cyan-50 to-blue-50 p-5 shadow-card dark:from-cyan-950/20 dark:to-blue-950/20"
            >
              <s.icon className={`mb-2 h-6 w-6 ${s.color}`} />
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="text-sm text-muted-foreground">{s.label}</div>
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
                <Button variant="hero" className="mt-4" asChild>
                  <Link to="/create-child">
                    <Plus className="mr-1 h-4 w-4" /> Add First Child
                  </Link>
                </Button>
              </motion.div>
            ) : (
              <motion.div className="grid gap-4 sm:grid-cols-2" variants={container} initial="hidden" animate="show">
                {children.map((child) => {
                  const childBadges = getChildBadges(child.id);
                  const childMissions = getChildMissions(child.id);
                  const childZones = getChildZones(child.id);
                  const summary = getChildSummary(child.id);
                  const isExpanded = expandedChildId === child.id;
                  const isNewKid = summary.completedCount === 0;
                  const prompts = getTalkPrompts(child.name, summary.strongestTopic, summary.needsReviewTopic);

                  // Determine current world/zone
                  const sortedZones = [...childZones].sort(
                    (a, b) => new Date(b.unlocked_at || 0).getTime() - new Date(a.unlocked_at || 0).getTime(),
                  );
                  const currentZone = sortedZones[0];
                  const zonesCompleted = childZones.filter((z) => z.status === "completed").length;
                  const totalZones = Math.max(childZones.length, 8);

                  // Recent missions
                  const recentMissions = [...childMissions]
                    .filter((m) => m.completed_at)
                    .sort(
                      (a, b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime(),
                    )
                    .slice(0, 3);

                  return (
                    <motion.div
                      key={child.id}
                      variants={fadeUp}
                      className="overflow-hidden rounded-2xl border bg-card shadow-card transition-shadow hover:shadow-lg"
                    >
                      <div className="p-5">
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
                            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                              <span>⭐ {child.points} pts</span>
                              <span>🏅 {childBadges.length} badges</span>
                              <span>🔥 {child.streak} streak</span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteTarget({ id: child.id, name: child.name });
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Empty state for new kids */}
                        {isNewKid ? (
                          <div className="mt-4 rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 p-4 text-center">
                            <Rocket className="mx-auto mb-2 h-8 w-8 text-primary" />
                            <p className="text-sm font-semibold">
                              {child.name} is just getting started! 🌟
                            </p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              Their first adventure awaits.
                            </p>
                          </div>
                        ) : (
                          <div className="mt-3 grid grid-cols-2 gap-2">
                            <div className="rounded-lg bg-primary/5 p-2 text-center">
                              <div className="text-lg font-bold text-primary">{summary.completedCount}</div>
                              <div className="text-[10px] text-muted-foreground">Missions</div>
                            </div>
                            <div className="rounded-lg bg-accent/5 p-2 text-center">
                              <div className="text-lg font-bold text-accent">{summary.totalStars} ⭐</div>
                              <div className="text-[10px] text-muted-foreground">Stars</div>
                            </div>
                            <div className="w-auto rounded-lg bg-secondary/10 p-2 text-center">
                              <div className="w-auto whitespace-normal break-words text-xs font-semibold leading-tight text-secondary">
                                {summary.strongestTopic}
                              </div>
                              <div className="mt-1 text-[10px] text-muted-foreground">Strongest</div>
                            </div>
                            <div className="w-auto rounded-lg bg-destructive/10 p-2 text-center">
                              <div className="w-auto whitespace-normal break-words text-xs font-semibold leading-tight text-destructive">
                                {summary.needsReviewTopic}
                              </div>
                              <div className="mt-1 text-[10px] text-muted-foreground">Needs Review</div>
                              <div className="mt-0.5 text-[9px] italic text-muted-foreground">
                                {child.name} struggled here — replay together
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Expand toggle chevron */}
                        <button
                          type="button"
                          onClick={() => setExpandedChildId(isExpanded ? null : child.id)}
                          className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg border border-border/60 bg-muted/40 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          aria-expanded={isExpanded}
                        >
                          {isExpanded ? (
                            <>
                              Hide details <ChevronUp className="h-4 w-4" />
                            </>
                          ) : (
                            <>
                              Show details <ChevronDown className="h-4 w-4" />
                            </>
                          )}
                        </button>
                      </div>

                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="overflow-hidden border-t bg-muted/20"
                          >
                            <div className="space-y-4 p-5">
                              {/* World Progress */}
                              <div>
                                <h4 className="mb-2 flex items-center gap-1.5 text-sm font-bold">
                                  <MapIcon className="h-4 w-4 text-primary" /> World Progress
                                </h4>
                                {currentZone ? (
                                  <>
                                    <p className="text-sm text-muted-foreground">
                                      🌍 {currentZone.continent_id.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} —{" "}
                                      Zone: {currentZone.zone_id.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                                    </p>
                                    <div className="mt-2 flex items-center gap-2">
                                      <Progress
                                        value={totalZones > 0 ? (zonesCompleted / totalZones) * 100 : 0}
                                        className="h-2 flex-1"
                                      />
                                      <span className="whitespace-nowrap text-xs text-muted-foreground">
                                        {zonesCompleted}/{totalZones} zones
                                      </span>
                                    </div>
                                  </>
                                ) : (
                                  <p className="text-sm text-muted-foreground">No worlds started yet.</p>
                                )}
                              </div>

                              {/* Recent Activity */}
                              <div>
                                <h4 className="mb-2 text-sm font-bold">📝 Recent Activity</h4>
                                {recentMissions.length === 0 ? (
                                  <p className="text-xs text-muted-foreground">
                                    No missions completed yet — encourage them to start!
                                  </p>
                                ) : (
                                  <ul className="space-y-1.5">
                                    {recentMissions.map((m) => {
                                      const mission = MISSIONS.find((mi) => mi.id === m.mission_id);
                                      const date = m.completed_at
                                        ? new Date(m.completed_at).toLocaleDateString(undefined, {
                                            month: "short",
                                            day: "numeric",
                                          })
                                        : "—";
                                      return (
                                        <li
                                          key={m.id}
                                          className="flex items-center justify-between rounded-lg bg-card px-3 py-2 text-xs"
                                        >
                                          <span className="font-medium">{mission?.title ?? m.mission_id}</span>
                                          <span className="text-muted-foreground">
                                            {date} • +{m.score} XP
                                          </span>
                                        </li>
                                      );
                                    })}
                                  </ul>
                                )}
                              </div>

                              {/* Badges Earned */}
                              <div>
                                <h4 className="mb-2 text-sm font-bold">🏅 Badges Earned</h4>
                                {childBadges.length === 0 ? (
                                  <p className="text-xs text-muted-foreground">No badges yet — keep going! 🌟</p>
                                ) : (
                                  <div className="flex flex-wrap gap-2">
                                    {childBadges.map((b) => (
                                      <div
                                        key={b.id}
                                        className="flex items-center gap-1.5 rounded-full bg-accent/10 px-2.5 py-1 text-xs"
                                        title={b.badge_name}
                                      >
                                        <span>{b.badge_icon}</span>
                                        <span className="font-semibold">{b.badge_name}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* Streak */}
                              <div className="rounded-lg bg-orange-500/10 p-3 text-sm">
                                🔥 {child.streak}-day streak!{" "}
                                <span className="text-muted-foreground">
                                  Last played:{" "}
                                  {child.last_activity_date
                                    ? new Date(child.last_activity_date).toLocaleDateString(undefined, {
                                        month: "short",
                                        day: "numeric",
                                      })
                                    : "Not yet"}
                                </span>
                              </div>

                              {/* Talk About It */}
                              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                                <h4 className="mb-2 flex items-center gap-1.5 text-sm font-bold text-emerald-700 dark:text-emerald-400">
                                  💬 Talk About It
                                </h4>
                                <ul className="space-y-1.5 text-xs text-foreground/80">
                                  {prompts.map((p, i) => (
                                    <li key={i} className="leading-relaxed">
                                      • {p}
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              <div className="flex justify-end">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setExpandedChildId(null)}
                                >
                                  <ChevronUp className="mr-1 h-4 w-4" /> Close
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </div>

          {/* Mission Completion */}
          {children.length > 0 && (
            <div>
              <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
                <BarChart3 className="h-5 w-5 text-secondary" /> Mission Completion
              </h2>
              <motion.div
                className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                variants={container}
                initial="hidden"
                animate="show"
              >
                {MISSIONS.map((m) => {
                  const completed = filteredProgress.filter(
                    (p) => p.mission_id === m.id && p.status === "completed",
                  ).length;
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
                  <div
                    key={area.missionTitle}
                    className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4 shadow-card"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="break-words text-sm font-semibold">{area.missionTitle}</span>
                      <Badge variant="outline" className="shrink-0 text-[10px]">
                        {area.status}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{area.childNames.join(", ")}</p>
                    <p className="mt-1 text-[11px] italic text-muted-foreground">
                      {area.childNames.length === 1 ? area.childNames[0] : "These heroes"} struggled here — consider
                      replaying this zone together.
                    </p>
                  </div>
                ))}
              </div>
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
              {certProgress.earned}/{certProgress.total} badges earned
              {selectedChildId ? "" : " across all children"}.
              {certProgress.percent < 100
                ? ` ${certProgress.total - certProgress.earned} more to unlock the CyberGuardian Certificate!`
                : " 🎉 Certificate unlocked!"}
            </p>
          </motion.div>

          {/* Recent Badges */}
          {recentBadges.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
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
            <h3 className="mb-2 flex items-center gap-2 font-bold text-primary">
              <MessageCircle className="h-4 w-4" /> Tips for Parents
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Review progress weekly</li>
              <li>• Celebrate badge achievements</li>
              <li>• Use the conversation starters in each child card</li>
              <li>• Adjust learning mode from child settings</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {deleteTarget?.name}'s profile?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {deleteTarget?.name}'s profile and all their progress, badges, and points.
              This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteTarget && deleteChild(deleteTarget.id)}
            >
              Remove Profile
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
