import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/portal/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useAccountType } from "@/hooks/useAccountType";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
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
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  Users,
  CheckCircle2,
  Award,
  MessageCircle,
  GraduationCap,
  Star,
  AlertCircle,
  Trophy,
  Lightbulb,
} from "lucide-react";
import { MISSIONS, ALL_BADGES } from "@/data/missions";
import HeroAvatar from "@/components/avatar/HeroAvatar";
import { motion } from "framer-motion";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

interface KidForm {
  name: string;
  age: string;
  username: string;
  password: string;
}
const emptyForm: KidForm = { name: "", age: "", username: "", password: "" };

// Grade to age mapping
const GRADE_TO_AGE: Record<string, number> = {
  K: 5,
  "1": 6,
  "2": 7,
  "3": 8,
  "4": 9,
  "5": 10,
  "6": 11,
  "7": 12,
  "8": 13,
};

function generateUsername(first: string, last: string, grade: string): string {
  return `${first.toLowerCase().slice(0, 5)}${last.toLowerCase().slice(0, 1)}${grade}`.replace(/\s+/g, "");
}

const conversationStarters: Record<string, string> = {
  "Spot the Scam!": "Ask your child: 'If you got a message saying you won a prize, what would you do?'",
  "Password Power":
    "Try this: 'Can you make up a silly sentence to use as a password? Like PurpleDinosaur-Eats-Pizza42!'",
  "Safe Sites Explorer": "Ask: 'How can you tell if a website is safe before clicking?'",
  "Secret Keeper": "Discuss: 'What information should we never share online with strangers?'",
  "Malware Monsters": "Ask: 'What would you do if a pop-up said your tablet has a virus?'",
  "Phishy Messages": "Try: 'Let's look at an email together — can you spot anything suspicious?'",
};

const parentTips = [
  "Review progress weekly and celebrate improvements",
  "Use the conversation starters to talk about online safety",
  "Celebrate badge achievements together",
  "Set a regular time for cybersecurity learning",
  "Explore the missions yourself to understand what they're learning",
];

const teacherTips = [
  "Review class progress weekly and identify students who need support",
  "Use discussion prompts to start classroom conversations about online safety",
  "Celebrate top performers and badge achievements with the class",
  "Assign specific missions as homework for focused learning",
  "Use the leaderboard to motivate friendly competition",
];

const discussionPrompts = [
  "What should you do if a stranger online asks for your address or school name?",
  "How can you tell if a website is trustworthy?",
  "Why is it important to have different passwords for different accounts?",
  "What would you do if someone sent you a mean message online?",
  "How can you protect your privacy when using social media?",
];

export default function MyKidsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const { terms, isSchool } = useAccountType();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState<KidForm>(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  // Teacher-specific state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [grade, setGrade] = useState("");

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

  const childIds = useMemo(() => children.map((c) => c.id), [children]);

  const { data: allProgress = [] } = useQuery({
    queryKey: ["all_mission_progress", user?.id, childIds.join(",")],
    queryFn: async () => {
      if (childIds.length === 0) return [];
      const { data, error } = await supabase.from("mission_progress").select("*").in("child_id", childIds);
      if (error) throw error;
      return data;
    },
    enabled: !!user && childIds.length > 0,
  });

  const { data: allBadges = [] } = useQuery({
    queryKey: ["all_badges", user?.id, childIds.join(",")],
    queryFn: async () => {
      if (childIds.length === 0) return [];
      const { data, error } = await supabase.from("earned_badges").select("*").in("child_id", childIds);
      if (error) throw error;
      return data;
    },
    enabled: !!user && childIds.length > 0,
  });

  const getChildMissions = (childId: string) => allProgress.filter((p) => p.child_id === childId);
  const getChildBadges = (childId: string) => allBadges.filter((b) => b.child_id === childId);

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

  const totalMissionsDone = allProgress.filter((p) => p.status === "completed").length;
  const totalBadgesEarned = allBadges.length;

  const areasNeedingReview = useMemo(() => {
    if (children.length === 0) return [];
    const areas: { missionTitle: string; childNames: string[]; status: string }[] = [];
    for (const mission of MISSIONS) {
      const needingWork: string[] = [];
      let worstStatus = "completed";
      for (const child of children) {
        const progress = allProgress.find((p) => p.child_id === child.id && p.mission_id === mission.id);
        if (!progress) {
          needingWork.push(child.name);
          worstStatus = "not started";
        } else if (progress.status !== "completed") {
          needingWork.push(child.name);
          if (worstStatus !== "not started") worstStatus = "in progress";
        } else if (progress.score < progress.max_score * 0.7) {
          needingWork.push(child.name);
          if (worstStatus === "completed") worstStatus = "needs review";
        }
      }
      if (needingWork.length > 0)
        areas.push({ missionTitle: mission.title, childNames: needingWork, status: worstStatus });
    }
    return areas.slice(0, 6);
  }, [children, allProgress]);

  const conversationStarter = useMemo(() => {
    if (areasNeedingReview.length === 0) return discussionPrompts[Math.floor(Math.random() * discussionPrompts.length)];
    const topic = areasNeedingReview[0];
    return (
      conversationStarters[topic.missionTitle] ||
      `Talk with your child about "${topic.missionTitle}" — they could use some extra practice!`
    );
  }, [areasNeedingReview]);

  const certProgress = useMemo(() => {
    const total = ALL_BADGES.length;
    const earned = new Set(allBadges.map((b) => b.badge_id)).size;
    return { earned, total, percent: total > 0 ? Math.round((earned / total) * 100) : 0 };
  }, [allBadges]);

  const recentBadges = useMemo(() => {
    return [...allBadges].sort((a, b) => new Date(b.earned_at).getTime() - new Date(a.earned_at).getTime()).slice(0, 8);
  }, [allBadges]);

  const leaderboard = useMemo(() => {
    if (!isSchool) return [];
    return [...children]
      .map((c) => ({ ...c, completedCount: getChildMissions(c.id).filter((m) => m.status === "completed").length }))
      .sort((a, b) => b.points - a.points)
      .slice(0, 5);
  }, [children, allProgress, isSchool]);

  const classAverage = useMemo(() => {
    if (!isSchool || children.length === 0) return 0;
    const totalPossible = children.length * MISSIONS.length;
    if (totalPossible === 0) return 0;
    return Math.round((totalMissionsDone / totalPossible) * 100);
  }, [isSchool, children, totalMissionsDone]);

  // Auto-generated username for teachers
  const autoUsername = isSchool ? generateUsername(firstName, lastName, grade) : form.username;
  const autoPassword = isSchool ? `CyberHero${autoUsername}!` : form.password;

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("No user");
      const { data: parentSession } = await supabase.auth.getSession();
      const parentAccessToken = parentSession.session?.access_token;
      const parentRefreshToken = parentSession.session?.refresh_token;

      const u = isSchool ? autoUsername : form.username.trim().toLowerCase();
      const pwd = isSchool ? autoPassword : form.password;
      const name = isSchool ? `${firstName.trim()} ${lastName.trim()}` : form.name.trim();
      const age = isSchool ? (GRADE_TO_AGE[grade] ?? 8) : form.age ? parseInt(form.age) : 7;

      if (!u) throw new Error("Username is required");
      if (!pwd || pwd.length < 8) throw new Error("Password must be at least 8 characters");
      if (!name) throw new Error("Name is required");

      const fakeEmail = `${u}@cyberhero.app`;
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: fakeEmail,
        password: pwd,
        options: { data: { name, role: "kid" } },
      });
      if (signUpError) {
        if (signUpError.message.includes("already registered")) throw new Error("That username is already taken");
        throw signUpError;
      }
      const kidId = signUpData.user?.id;
      if (!kidId) throw new Error("Failed to create account");

      await supabase
        .from("profiles")
        .upsert({ id: kidId, user_id: kidId, role: "kid", account_type: "kid", display_name: name, email: fakeEmail });
      await supabase
        .from("child_profiles")
        .insert({
          id: kidId,
          parent_id: user.id,
          name,
          age,
          learning_mode: "standard",
          avatar: "🦸",
          level: 1,
          points: 0,
          streak: 0,
        });
      await supabase.from("parent_kid_links").insert({ parent_id: user.id, kid_id: kidId });

      if (parentAccessToken && parentRefreshToken) {
        await supabase.auth.setSession({ access_token: parentAccessToken, refresh_token: parentRefreshToken });
      }
      return { username: u, name };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["children"] });
      setDrawerOpen(false);
      setForm(emptyForm);
      setFirstName("");
      setLastName("");
      setGrade("");
      toast.success(`${result.name} added! Login: ${result.username}`);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("child_profiles").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["children"] });
      queryClient.invalidateQueries({ queryKey: ["all_mission_progress"] });
      queryClient.invalidateQueries({ queryKey: ["all_badges"] });
      setDeleteId(null);
      toast.success(`${terms.kidSingular} removed.`);
    },
  });

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    const text = await file.text();
    const lines = text.trim().split("\n").slice(1);
    const students = lines
      .map((line) => {
        const parts = line.split(",");
        const first = parts[0]?.trim() || "";
        const last = parts[1]?.trim() || "";
        const g = parts[2]?.trim() || "3";
        const username = generateUsername(first, last, g);
        const age = GRADE_TO_AGE[g] ?? 8;
        return { name: `${first} ${last}`, username, age, password: `CyberHero${username}!` };
      })
      .filter((s) => s.username && s.name.trim());

    const { data: sess } = await supabase.auth.getSession();
    let created = 0;
    for (const student of students) {
      toast.info(`Creating ${student.name}... (${created + 1}/${students.length})`);
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: `${student.username}@cyberhero.app`,
        password: student.password,
      });
      if (signUpError) {
        toast.error(`Failed: ${student.name}`);
        continue;
      }
      const kidId = signUpData?.user?.id;
      if (kidId) {
        await supabase
          .from("profiles")
          .upsert({
            id: kidId,
            user_id: kidId,
            role: "kid",
            account_type: "kid",
            display_name: student.name,
            email: `${student.username}@cyberhero.app`,
          });
        await supabase
          .from("child_profiles")
          .insert({
            id: kidId,
            parent_id: user.id,
            name: student.name,
            age: student.age,
            learning_mode: "standard",
            avatar: "🦸",
            level: 1,
            points: 0,
            streak: 0,
          });
        await supabase.from("parent_kid_links").insert({ parent_id: user.id, kid_id: kidId });
        if (sess?.session)
          await supabase.auth.setSession({
            access_token: sess.session.access_token,
            refresh_token: sess.session.refresh_token,
          });
        created++;
      }
    }
    queryClient.invalidateQueries({ queryKey: ["children"] });
    toast.success(`✅ ${created} students imported! Password: CyberHero[username]!`);
    (e.target as HTMLInputElement).value = "";
  };

  const canSubmit = isSchool ? !!firstName && !!lastName && !!grade : !!form.name && !!form.username && !!form.password;

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">{terms.kidsLabel}</h1>
        <Button
          onClick={() => {
            setForm(emptyForm);
            setFirstName("");
            setLastName("");
            setGrade("");
            setDrawerOpen(true);
          }}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="mr-1.5 h-4 w-4" /> {terms.addKidShort}
        </Button>
      </div>

      <motion.div className="grid grid-cols-3 gap-4 mb-8" variants={container} initial="hidden" animate="show">
        {[
          { label: terms.kidPlural, value: children.length, icon: Users, color: "text-primary" },
          { label: "Missions Completed", value: totalMissionsDone, icon: CheckCircle2, color: "text-secondary" },
          { label: "Badges Earned", value: totalBadgesEarned, icon: Award, color: "text-accent" },
        ].map((s) => (
          <motion.div
            key={s.label}
            variants={fadeUp}
            className="rounded-2xl border border-border bg-card p-5 shadow-sm"
          >
            <s.icon className={`mb-2 h-6 w-6 ${s.color}`} />
            <p className="text-2xl font-bold text-foreground">
              {isLoading ? <Skeleton className="h-7 w-10" /> : s.value}
            </p>
            <p className="text-sm text-muted-foreground">{s.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
          ))}
        </div>
      ) : children.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border-2 border-dashed border-border bg-card">
          <Users className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
          <p className="text-lg font-bold text-foreground">No {terms.kidPlural.toLowerCase()} yet</p>
          <p className="mt-1 text-sm text-muted-foreground mb-4">
            Add your first {terms.kidSingular.toLowerCase()} to start tracking their learning!
          </p>
          <Button onClick={() => setDrawerOpen(true)}>
            <Plus className="mr-1.5 h-4 w-4" /> {terms.addKid}
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          <div>
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" /> {isSchool ? "Students" : "Children"}
            </h2>
            <motion.div className="grid gap-4 sm:grid-cols-2" variants={container} initial="hidden" animate="show">
              {children.map((child) => {
                const childBadges = getChildBadges(child.id);
                const summary = getChildSummary(child.id);
                return (
                  <motion.div
                    key={child.id}
                    variants={fadeUp}
                    className="rounded-2xl border border-border bg-card p-5 shadow-sm cursor-pointer hover:border-primary/40 hover:shadow-md transition-all group"
                    onClick={() => navigate(`/dashboard/kids/${child.id}`)}
                  >
                    <div className="flex items-center gap-4">
                      <HeroAvatar
                        avatarConfig={(child as any).avatar_config as Record<string, any> | null}
                        size={52}
                        fallbackEmoji={child.avatar}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold text-foreground">{child.name}</h3>
                          <Badge variant="secondary" className="border-0 text-xs">
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
                      <div
                        className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive h-8 w-8 p-0"
                          onClick={() => setDeleteId(child.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                      <div className="rounded-xl bg-primary/5 p-2 text-center">
                        <div className="text-lg font-bold text-primary">{summary.completedCount}</div>
                        <div className="text-[10px] text-muted-foreground">Missions</div>
                      </div>
                      <div className="rounded-xl bg-accent/5 p-2 text-center">
                        <div className="text-lg font-bold text-accent">{summary.totalStars} ⭐</div>
                        <div className="text-[10px] text-muted-foreground">Stars</div>
                      </div>
                      <div className="rounded-xl bg-secondary/10 p-2 text-center">
                        <div className="truncate text-xs font-semibold text-secondary">{summary.strongestTopic}</div>
                        <div className="text-[10px] text-muted-foreground">Strongest</div>
                      </div>
                      <div className="rounded-xl bg-destructive/5 p-2 text-center">
                        <div className="truncate text-xs font-semibold text-destructive">
                          {summary.needsReviewTopic}
                        </div>
                        <div className="text-[10px] text-muted-foreground">Needs Review</div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>

          {isSchool && leaderboard.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-accent" /> Class Leaderboard
              </h2>
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="space-y-3">
                  {leaderboard.map((student, i) => (
                    <div key={student.id} className="flex items-center gap-3">
                      <span className="text-lg font-bold text-muted-foreground w-6">{i + 1}</span>
                      <HeroAvatar
                        avatarConfig={(student as any).avatar_config as Record<string, any> | null}
                        size={32}
                        fallbackEmoji={student.avatar}
                      />
                      <span className="flex-1 font-semibold text-sm text-foreground">{student.name}</span>
                      <span className="text-sm font-bold text-primary">⭐ {student.points} pts</span>
                      <span className="text-xs text-muted-foreground">{student.completedCount} missions</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div>
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-secondary" /> Mission Completion
            </h2>
            <motion.div
              className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
              variants={container}
              initial="hidden"
              animate="show"
            >
              {MISSIONS.map((m) => {
                const Icon = m.icon;
                const completedCount = allProgress.filter(
                  (p) => p.mission_id === m.id && p.status === "completed",
                ).length;
                return (
                  <motion.div
                    key={m.id}
                    variants={fadeUp}
                    className="rounded-2xl border border-border bg-card p-4 shadow-sm"
                  >
                    <div className="mb-2 flex items-center gap-3">
                      <Icon className={`h-5 w-5 ${m.color}`} />
                      <span className="text-sm font-bold text-foreground">{m.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={children.length > 0 ? (completedCount / children.length) * 100 : 0}
                        className="h-2 flex-1"
                      />
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {completedCount}/{children.length}
                      </span>
                    </div>
                    {isSchool && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {children.map((c) => {
                          const p = allProgress.find((pr) => pr.child_id === c.id && pr.mission_id === m.id);
                          const done = p?.status === "completed";
                          return (
                            <span
                              key={c.id}
                              className={`text-[10px] px-1.5 py-0.5 rounded-full ${done ? "bg-secondary/10 text-secondary" : "bg-muted text-muted-foreground"}`}
                            >
                              {c.name.split(" ")[0]}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </motion.div>
          </div>

          {areasNeedingReview.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" /> Needing Review
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {areasNeedingReview.map((area) => (
                  <div key={area.missionTitle} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-foreground">{area.missionTitle}</span>
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${area.status === "not started" ? "border-accent text-accent" : "border-primary text-primary"}`}
                      >
                        {area.status}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{area.childNames.join(", ")}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
            <h3 className="mb-2 flex items-center gap-2 font-bold text-primary">
              <MessageCircle className="h-4 w-4" /> {isSchool ? "Discussion Prompt" : "Conversation Starter"}
            </h3>
            <p className="text-sm leading-relaxed text-foreground/80">{conversationStarter}</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h3 className="mb-3 flex items-center gap-2 font-bold text-foreground">
              <GraduationCap className="h-5 w-5 text-primary" />
              {isSchool ? "Class Average Progress" : "Certificate Progress"}
            </h3>
            {isSchool ? (
              <>
                <div className="flex items-center gap-3">
                  <Progress value={classAverage} className="h-3 flex-1" />
                  <span className="text-sm font-semibold text-primary">{classAverage}%</span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Average completion across {children.length} students and {MISSIONS.length} missions.
                </p>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <Progress value={certProgress.percent} className="h-3 flex-1" />
                  <span className="text-sm font-semibold text-primary">{certProgress.percent}%</span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {certProgress.earned}/{certProgress.total} badges earned across all children.
                  {certProgress.percent < 100
                    ? ` ${certProgress.total - certProgress.earned} more to unlock the CyberGuardian Certificate!`
                    : " 🎉 Certificate unlocked!"}
                </p>
              </>
            )}
          </div>

          {recentBadges.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                <Star className="h-5 w-5 text-accent" /> Recent Badges
              </h3>
              <div className="flex flex-wrap gap-2">
                {recentBadges.map((b) => {
                  const childName = children.find((c) => c.id === b.child_id)?.name || "";
                  return (
                    <div
                      key={b.id}
                      className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 shadow-sm"
                    >
                      <span className="text-lg">{b.badge_icon}</span>
                      <div>
                        <div className="text-xs font-semibold text-foreground">{b.badge_name}</div>
                        <div className="text-[10px] text-muted-foreground">{childName}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-accent/20 bg-accent/5 p-5">
            <h3 className="mb-2 font-bold text-accent flex items-center gap-2">
              <Lightbulb className="h-4 w-4" /> {isSchool ? "Teaching Tips" : "Tips for Parents"}
            </h3>
            <ul className="space-y-2 text-sm text-foreground/70">
              {(isSchool ? teacherTips : parentTips).map((tip, i) => (
                <li key={i}>• {tip}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Drawer */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{terms.addKid}</SheetTitle>
          </SheetHeader>

          <div className="mt-6 space-y-5">
            {isSchool ? (
              // ── TEACHER FORM ──
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>First Name *</Label>
                    <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Emma" />
                  </div>
                  <div>
                    <Label>Last Name *</Label>
                    <Input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Johnson" />
                  </div>
                </div>

                <div>
                  <Label>Grade *</Label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">Select grade</option>
                    <option value="K">Kindergarten</option>
                    <option value="1">Grade 1</option>
                    <option value="2">Grade 2</option>
                    <option value="3">Grade 3</option>
                    <option value="4">Grade 4</option>
                    <option value="5">Grade 5</option>
                    <option value="6">Grade 6</option>
                    <option value="7">Grade 7</option>
                    <option value="8">Grade 8+</option>
                  </select>
                </div>

                {firstName && lastName && grade && (
                  <div className="rounded-lg bg-muted/50 border border-border p-3 space-y-1">
                    <p className="text-xs font-bold text-foreground">🔑 Auto-generated login credentials:</p>
                    <p className="text-xs text-muted-foreground">
                      Username: <span className="font-mono font-bold text-foreground">{autoUsername}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Password: <span className="font-mono font-bold text-foreground">{autoPassword}</span>
                    </p>
                  </div>
                )}

                <div className="rounded-lg border border-dashed border-border p-4 text-center">
                  <p className="text-sm font-semibold text-foreground mb-1">Bulk Roster Import</p>
                  <p className="text-xs text-muted-foreground mb-3">CSV format: first_name, last_name, grade</p>
                  <input type="file" accept=".csv" id="csv-upload" className="hidden" onChange={handleCSVUpload} />
                  <Button variant="outline" size="sm" onClick={() => document.getElementById("csv-upload")?.click()}>
                    Upload CSV
                  </Button>
                </div>
              </>
            ) : (
              // ── PARENT FORM ──
              <>
                <div>
                  <Label>Name *</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      const suggested = name.trim().toLowerCase().replace(/\s+/g, "") + (form.age || "");
                      setForm({ ...form, name, username: suggested });
                    }}
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <Label>Age</Label>
                  <Input
                    type="number"
                    value={form.age}
                    onChange={(e) => setForm({ ...form, age: e.target.value })}
                    placeholder="e.g. 8"
                  />
                </div>
                <div>
                  <Label>Username *</Label>
                  <Input
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value.toLowerCase().replace(/\s+/g, "") })}
                    placeholder="e.g. jake8"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    This is what {form.name || "your child"} types to log in
                  </p>
                </div>
                <div>
                  <Label>Password *</Label>
                  <Input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Min 8 characters"
                  />
                </div>
              </>
            )}
          </div>

          <SheetFooter className="mt-6">
            <Button variant="outline" onClick={() => setDrawerOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => createMutation.mutate()} disabled={!canSubmit || createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : terms.addKid}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this {terms.kidSingular.toLowerCase()}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete their account and all activity data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground"
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
