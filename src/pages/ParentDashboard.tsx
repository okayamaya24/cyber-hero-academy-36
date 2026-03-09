import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Users, Shield, Clock, TrendingUp, CheckCircle2, Award,
  BarChart3, Plus, Trash2, LogOut, AlertTriangle, Lock, Eye, Settings2,
} from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MISSIONS, getTotalGames, LEARNING_MODE_CONFIG, type LearningMode } from "@/data/missions";
import { toast } from "sonner";
import AvatarRenderer from "@/components/avatar/AvatarRenderer";
import type { AvatarConfig } from "@/components/avatar/avatarConfig";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function ParentDashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  const { data: children = [], isLoading } = useQuery({
    queryKey: ["children", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("child_profiles").select("*").eq("parent_id", user!.id).order("created_at");
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: allProgress = [] } = useQuery({
    queryKey: ["all_mission_progress", user?.id],
    queryFn: async () => {
      const childIds = children.map((c) => c.id);
      if (childIds.length === 0) return [];
      const { data, error } = await supabase.from("mission_progress").select("*").in("child_id", childIds);
      if (error) throw error;
      return data;
    },
    enabled: children.length > 0,
  });

  const { data: allBadges = [] } = useQuery({
    queryKey: ["all_badges", user?.id],
    queryFn: async () => {
      const childIds = children.map((c) => c.id);
      if (childIds.length === 0) return [];
      const { data, error } = await supabase.from("earned_badges").select("*").in("child_id", childIds);
      if (error) throw error;
      return data;
    },
    enabled: children.length > 0,
  });

  const deleteChild = async (id: string, name: string) => {
    if (!confirm(`Remove ${name}'s profile? This will delete all their progress.`)) return;
    await supabase.from("child_profiles").delete().eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["children"] });
    toast.success(`${name}'s profile removed`);
  };

  const updateLearningMode = async (childId: string, mode: LearningMode) => {
    const { error } = await supabase
      .from("child_profiles")
      .update({ learning_mode: mode } as any)
      .eq("id", childId);
    if (error) {
      toast.error("Failed to update learning mode");
      return;
    }
    queryClient.invalidateQueries({ queryKey: ["children"] });
    toast.success("Learning mode updated!");
  };

  const getChildMissions = (childId: string) => allProgress.filter((p) => p.child_id === childId);
  const getChildBadges = (childId: string) => allBadges.filter((b) => b.child_id === childId);

  const totalMissionsDone = allProgress.filter((p) => p.status === "completed").length;
  const totalBadges = allBadges.length;

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <motion.div className="mb-8 flex items-start justify-between" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div>
            <h1 className="text-3xl font-bold md:text-4xl">📊 Parent Dashboard</h1>
            <p className="mt-2 text-muted-foreground">Track your children's cybersecurity learning</p>
          </div>
          <Button variant="ghost" size="sm" onClick={signOut}><LogOut className="mr-2 h-4 w-4" /> Sign Out</Button>
        </motion.div>

        {/* Stats */}
        <motion.div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4" variants={container} initial="hidden" animate="show">
          {[
            { label: "Children", value: children.length, icon: Users, color: "text-primary" },
            { label: "Active Today", value: children.filter((c) => c.last_activity_date === new Date().toISOString().split("T")[0]).length, icon: TrendingUp, color: "text-secondary" },
            { label: "Missions Done", value: totalMissionsDone, icon: CheckCircle2, color: "text-accent" },
            { label: "Badges Earned", value: totalBadges, icon: Award, color: "text-cyber-purple" },
          ].map((s) => (
            <motion.div key={s.label} variants={fadeUp} className="rounded-2xl border bg-card p-5 shadow-card">
              <s.icon className={`mb-2 h-6 w-6 ${s.color}`} />
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="text-sm text-muted-foreground">{s.label}</div>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Children */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2"><Users className="h-5 w-5 text-primary" /> Children</h2>
                <Button variant="hero" size="sm" asChild><Link to="/create-child"><Plus className="mr-1 h-4 w-4" /> Add Child</Link></Button>
              </div>

              {children.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="rounded-2xl border-2 border-dashed bg-card p-8 text-center">
                  <Users className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
                  <h3 className="font-bold text-lg">No children added yet</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Add your first child to start their cybersecurity learning journey!</p>
                </motion.div>
              ) : (
                <motion.div className="space-y-4" variants={container} initial="hidden" animate="show">
                  {children.map((child) => {
                    const childMissions = getChildMissions(child.id);
                    const childBadges = getChildBadges(child.id);
                    const childMode = ((child as any).learning_mode as LearningMode) || "standard";
                    const totalGames = getTotalGames(childMode);
                    const completedGamesTotal = childMissions.reduce((acc, mp) => {
                      if (mp.status === "completed") return acc + totalGames;
                      return acc + (mp.current_question ?? 0);
                    }, 0);
                    const totalGamesOverall = MISSIONS.length * totalGames;
                    const completedCount = childMissions.filter((m) => m.status === "completed").length;

                    return (
                      <motion.div key={child.id} variants={fadeUp} className="rounded-2xl border bg-card p-5 shadow-card">
                        <div className="flex items-center gap-4">
                          <AvatarRenderer config={(child as any).avatar_config as AvatarConfig | null} size={48} fallbackEmoji={child.avatar} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-bold">{child.name}</h3>
                              <Badge variant="secondary" className="border-0">Level {child.level}</Badge>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">Age {child.age}</span>
                              <Badge className="bg-primary/10 text-primary border-0 text-xs">
                                {LEARNING_MODE_CONFIG[childMode].emoji} {LEARNING_MODE_CONFIG[childMode].label}
                              </Badge>
                              {child.last_activity_date && (
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {child.last_activity_date === new Date().toISOString().split("T")[0] ? "Today" : child.last_activity_date}
                                </span>
                              )}
                            </div>
                            <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                              <span>⭐ {child.points} pts</span>
                              <span>🏅 {childBadges.length} badges</span>
                              <span>🎮 {completedGamesTotal}/{totalGamesOverall} games</span>
                              <span>🔥 {child.streak} streak</span>
                            </div>
                            <div className="mt-2">
                              <Progress value={totalGamesOverall > 0 ? (completedGamesTotal / totalGamesOverall) * 100 : 0} className="h-2" />
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"
                            onClick={() => deleteChild(child.id, child.name)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </div>

            {/* Learning Mode Settings */}
            {children.length > 0 && (
              <div>
                <h2 className="mb-4 text-xl font-bold flex items-center gap-2">
                  <Settings2 className="h-5 w-5 text-secondary" /> Learning Mode
                </h2>
                <motion.div className="space-y-4" variants={container} initial="hidden" animate="show">
                  {children.map((child) => {
                    const childMode = ((child as any).learning_mode as LearningMode) || "standard";
                    return (
                      <motion.div key={child.id} variants={fadeUp} className="rounded-2xl border bg-card p-5 shadow-card">
                        <div className="flex items-center gap-3 mb-4">
                          <AvatarRenderer config={(child as any).avatar_config as AvatarConfig | null} size={32} fallbackEmoji={child.avatar} />
                          <h3 className="font-bold">{child.name}'s Learning Mode</h3>
                        </div>
                        <RadioGroup
                          value={childMode}
                          onValueChange={(value) => updateLearningMode(child.id, value as LearningMode)}
                          className="grid gap-3 sm:grid-cols-2"
                        >
                          {(Object.entries(LEARNING_MODE_CONFIG) as [LearningMode, typeof LEARNING_MODE_CONFIG[LearningMode]][]).map(([key, config]) => (
                            <div key={key} className={`flex items-start gap-3 rounded-xl border p-3 transition-all cursor-pointer hover:border-primary/50 ${
                              childMode === key ? "border-primary bg-primary/5" : ""
                            }`}>
                              <RadioGroupItem value={key} id={`${child.id}-${key}`} className="mt-0.5" />
                              <Label htmlFor={`${child.id}-${key}`} className="cursor-pointer flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">{config.emoji}</span>
                                  <span className="font-semibold text-sm">{config.label}</span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-0.5">{config.description}</p>
                                {key === "auto" && (
                                  <p className="text-[10px] text-primary mt-1 font-medium">
                                    Generates extra practice after core levels are done
                                  </p>
                                )}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </div>
            )}
          </div>

          {/* Mission Stats */}
          <div>
            <h2 className="mb-4 text-xl font-bold flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-secondary" /> Mission Completion
            </h2>
            {children.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed bg-card p-6 text-center text-sm text-muted-foreground">
                Add children to see mission stats
              </div>
            ) : (
              <motion.div className="space-y-4" variants={container} initial="hidden" animate="show">
                {MISSIONS.map((m) => {
                  const completed = allProgress.filter((p) => p.mission_id === m.id && p.status === "completed").length;
                  const Icon = m.icon;
                  return (
                    <motion.div key={m.id} variants={fadeUp} className="rounded-2xl border bg-card p-4 shadow-card">
                      <div className="flex items-center gap-3 mb-2">
                        <Icon className={`h-5 w-5 ${m.color}`} />
                        <span className="text-sm font-bold">{m.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={children.length > 0 ? (completed / children.length) * 100 : 0} className="h-2 flex-1" />
                        <span className="text-xs text-muted-foreground whitespace-nowrap">{completed}/{children.length} children</span>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}

            <div className="mt-6 rounded-2xl border bg-primary/5 p-5">
              <h3 className="font-bold text-primary mb-2">💡 Tips for Parents</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Use Learning Mode to adjust difficulty</li>
                <li>• Quick Play is great for younger kids</li>
                <li>• Deep Practice builds stronger habits</li>
                <li>• Celebrate badge achievements</li>
                <li>• Review progress weekly</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
