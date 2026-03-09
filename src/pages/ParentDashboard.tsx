import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Users, Shield, Clock, TrendingUp, CheckCircle2, Award,
  BarChart3, Plus, Trash2, LogOut, AlertTriangle, Lock, Eye,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MISSIONS } from "@/data/missions";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
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
  const [addOpen, setAddOpen] = useState(false);
  const [newChild, setNewChild] = useState({ name: "", age: "", avatar: "🦸" });
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  const { data: children = [], isLoading } = useQuery({
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
    queryKey: ["all_mission_progress", user?.id],
    queryFn: async () => {
      const childIds = children.map((c) => c.id);
      if (childIds.length === 0) return [];
      const { data, error } = await supabase
        .from("mission_progress")
        .select("*")
        .in("child_id", childIds);
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
      const { data, error } = await supabase
        .from("earned_badges")
        .select("*")
        .in("child_id", childIds);
      if (error) throw error;
      return data;
    },
    enabled: children.length > 0,
  });

  const addChild = async () => {
    if (!newChild.name.trim() || !newChild.age) {
      toast.error("Please enter name and age");
      return;
    }
    const age = parseInt(newChild.age);
    if (age < 3 || age > 15) {
      toast.error("Age must be between 3 and 15");
      return;
    }
    setAdding(true);
    const { error } = await supabase.from("child_profiles").insert({
      parent_id: user!.id,
      name: newChild.name.trim(),
      age,
      avatar: newChild.avatar,
    });
    setAdding(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(`${newChild.name} added as a Cyber Hero!`);
      setNewChild({ name: "", age: "", avatar: "🦸" });
      setAddOpen(false);
      queryClient.invalidateQueries({ queryKey: ["children"] });
    }
  };

  const deleteChild = async (id: string, name: string) => {
    if (!confirm(`Remove ${name}'s profile? This will delete all their progress.`)) return;
    await supabase.from("child_profiles").delete().eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["children"] });
    toast.success(`${name}'s profile removed`);
  };

  const getChildMissions = (childId: string) =>
    allProgress.filter((p) => p.child_id === childId);
  const getChildBadges = (childId: string) =>
    allBadges.filter((b) => b.child_id === childId);

  const totalMissionsDone = allProgress.filter((p) => p.status === "completed").length;
  const totalBadges = allBadges.length;

  const missionIcons: Record<string, React.ElementType> = {
    "scam-detection": AlertTriangle,
    "password-safety": Lock,
    "safe-websites": Eye,
    "personal-info": Shield,
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <motion.div className="mb-8 flex items-start justify-between" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div>
            <h1 className="text-3xl font-bold md:text-4xl">📊 Parent Dashboard</h1>
            <p className="mt-2 text-muted-foreground">Track your children's cybersecurity learning</p>
          </div>
          <Button variant="ghost" size="sm" onClick={signOut}>
            <LogOut className="mr-2 h-4 w-4" /> Sign Out
          </Button>
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
          <div className="lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" /> Children
              </h2>
              <Dialog open={addOpen} onOpenChange={setAddOpen}>
                <DialogTrigger asChild>
                  <Button variant="hero" size="sm"><Plus className="mr-1 h-4 w-4" /> Add Child</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add a Cyber Hero</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Name</Label>
                      <Input placeholder="Child's name" value={newChild.name} onChange={(e) => setNewChild({ ...newChild, name: e.target.value })} />
                    </div>
                    <div>
                      <Label>Age</Label>
                      <Input type="number" min={3} max={15} placeholder="5-12" value={newChild.age} onChange={(e) => setNewChild({ ...newChild, age: e.target.value })} />
                    </div>
                    <div>
                      <Label>Avatar</Label>
                      <div className="mt-1 flex gap-2 flex-wrap">
                        {avatarOptions.map((a) => (
                          <button key={a} onClick={() => setNewChild({ ...newChild, avatar: a })}
                            className={`flex h-12 w-12 items-center justify-center rounded-xl border-2 text-2xl transition-all ${
                              newChild.avatar === a ? "border-primary bg-primary/10 scale-110" : "border-border hover:border-primary/50"
                            }`}>
                            {a}
                          </button>
                        ))}
                      </div>
                    </div>
                    <Button variant="hero" className="w-full" onClick={addChild} disabled={adding}>
                      {adding ? "Adding..." : "Create Cyber Hero 🚀"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {children.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="rounded-2xl border-2 border-dashed bg-card p-8 text-center">
                <Users className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
                <h3 className="font-bold text-lg">No children added yet</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Add your first child to start their cybersecurity learning journey!
                </p>
              </motion.div>
            ) : (
              <motion.div className="space-y-4" variants={container} initial="hidden" animate="show">
                {children.map((child) => {
                  const childMissions = getChildMissions(child.id);
                  const childBadges = getChildBadges(child.id);
                  const completedCount = childMissions.filter((m) => m.status === "completed").length;
                  return (
                    <motion.div key={child.id} variants={fadeUp} className="rounded-2xl border bg-card p-5 shadow-card">
                      <div className="flex items-center gap-4">
                        <AvatarRenderer
                          config={(child as any).avatar_config as AvatarConfig | null}
                          size={48}
                          fallbackEmoji={child.avatar}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold">{child.name}</h3>
                            <Badge variant="secondary" className="border-0">Level {child.level}</Badge>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              Age {child.age}
                            </span>
                            {child.last_activity_date && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {child.last_activity_date === new Date().toISOString().split("T")[0]
                                  ? "Today"
                                  : child.last_activity_date}
                              </span>
                            )}
                          </div>
                          <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                            <span>⭐ {child.points} pts</span>
                            <span>🏅 {childBadges.length} badges</span>
                            <span>🎯 {completedCount}/{MISSIONS.length} missions</span>
                            <span>🔥 {child.streak} streak</span>
                          </div>
                          <div className="mt-2">
                            <Progress value={(completedCount / MISSIONS.length) * 100} className="h-2" />
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
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {completed}/{children.length}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}

            <div className="mt-6 rounded-2xl border bg-primary/5 p-5">
              <h3 className="font-bold text-primary mb-2">💡 Tips for Parents</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Discuss online safety during meals</li>
                <li>• Encourage completing all missions</li>
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
