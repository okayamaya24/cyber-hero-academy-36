import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/portal/DashboardLayout";
import { useAccountType } from "@/hooks/useAccountType";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Star, Award, CheckCircle2, Flame, Trophy } from "lucide-react";
import { MISSIONS } from "@/data/missions";
import HeroAvatar from "@/components/avatar/HeroAvatar";
import { motion } from "framer-motion";
import { useMemo } from "react";

export default function KidProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { terms } = useAccountType();

  // Pull from child_profiles (existing game data)
  const { data: child, isLoading: childLoading } = useQuery({
    queryKey: ["child", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("child_profiles").select("*").eq("id", id!).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: missionProgress = [] } = useQuery({
    queryKey: ["mission_progress", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("mission_progress").select("*").eq("child_id", id!);
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: earnedBadges = [] } = useQuery({
    queryKey: ["earned_badges", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("earned_badges").select("*").eq("child_id", id!);
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const completedMissions = missionProgress.filter((m) => m.status === "completed");
  const totalStars = useMemo(() => completedMissions.reduce((acc, m) => {
    const ratio = m.max_score > 0 ? m.score / m.max_score : 0;
    return acc + (ratio >= 0.9 ? 3 : ratio >= 0.7 ? 2 : 1);
  }, 0), [completedMissions]);

  const summary = useMemo(() => {
    let strongestTopic = "—";
    let needsReviewTopic = "—";
    let bestScore = -1;
    let worstScore = Infinity;
    for (const m of missionProgress) {
      const mission = MISSIONS.find((mi) => mi.id === m.mission_id);
      if (!mission) continue;
      const ratio = m.max_score > 0 ? m.score / m.max_score : 0;
      if (ratio > bestScore) { bestScore = ratio; strongestTopic = mission.title; }
      if (ratio < worstScore) { worstScore = ratio; needsReviewTopic = mission.title; }
    }
    return { strongestTopic, needsReviewTopic };
  }, [missionProgress]);

  return (
    <DashboardLayout>
      <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")} className="mb-4">
        <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to {terms.kidsLabel}
      </Button>

      {childLoading ? (
        <Skeleton className="h-32 w-full rounded-2xl" />
      ) : child ? (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
            <HeroAvatar
              avatarConfig={(child as any).avatar_config as Record<string, any> | null}
              size={72}
              fallbackEmoji={child.avatar}
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-foreground">{child.name}</h1>
                <Badge variant="secondary" className="border-0">Level {child.level}</Badge>
                <span className="text-sm text-muted-foreground">Age {child.age}</span>
              </div>
              {child.last_activity_date && (
                <p className="text-xs text-muted-foreground mt-1">Last active: {new Date(child.last_activity_date).toLocaleDateString()}</p>
              )}
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-5 gap-3">
            {[
              { label: "Points", value: child.points, icon: Star, color: "text-primary" },
              { label: "Badges", value: earnedBadges.length, icon: Award, color: "text-accent" },
              { label: "Streak", value: child.streak, icon: Flame, color: "text-destructive" },
              { label: "Missions", value: completedMissions.length, icon: CheckCircle2, color: "text-secondary" },
              { label: "Stars", value: totalStars, icon: Trophy, color: "text-accent" },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl border border-border bg-card p-3 text-center shadow-sm">
                <s.icon className={`mx-auto mb-1 h-5 w-5 ${s.color}`} />
                <p className="text-lg font-bold text-foreground">{s.value}</p>
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Strongest vs Needs Review */}
          <div className="flex gap-3">
            <div className="flex-1 rounded-2xl bg-secondary/10 p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Strongest Topic</p>
              <p className="font-semibold text-secondary text-sm">{summary.strongestTopic}</p>
            </div>
            <div className="flex-1 rounded-2xl bg-destructive/5 p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Needs Review</p>
              <p className="font-semibold text-destructive text-sm">{summary.needsReviewTopic}</p>
            </div>
          </div>

          {/* Mission Progress */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-foreground mb-4">Mission Progress</h2>
            <div className="space-y-3">
              {MISSIONS.map((m) => {
                const Icon = m.icon;
                const progress = missionProgress.find((p) => p.mission_id === m.id);
                const status = progress?.status || "not started";
                const pct = progress && progress.max_score > 0 ? Math.round((progress.score / progress.max_score) * 100) : 0;
                return (
                  <div key={m.id} className="flex items-center gap-3">
                    <Icon className={`h-5 w-5 shrink-0 ${m.color}`} />
                    <span className="text-sm font-medium text-foreground flex-1 min-w-0 truncate">{m.title}</span>
                    <Progress value={status === "completed" ? 100 : pct} className="h-2 w-24" />
                    <Badge
                      variant="outline"
                      className={`text-[10px] whitespace-nowrap ${
                        status === "completed" ? "border-secondary text-secondary" :
                        status === "in_progress" ? "border-primary text-primary" :
                        "border-muted-foreground text-muted-foreground"
                      }`}
                    >
                      {status === "completed" ? "Completed" : status === "in_progress" ? "In Progress" : "Not Started"}
                    </Badge>
                    {status === "completed" && <span className="text-xs font-medium text-foreground">{pct}%</span>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Badges Earned */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-foreground mb-4">Badges Earned ({earnedBadges.length})</h2>
            {earnedBadges.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No badges earned yet.</p>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
                {earnedBadges.map((b) => (
                  <div key={b.id} className="rounded-xl border border-border bg-muted/30 p-3 text-center">
                    <span className="text-2xl">{b.badge_icon}</span>
                    <p className="text-xs font-semibold text-foreground mt-1 truncate">{b.badge_name}</p>
                    <p className="text-[9px] text-muted-foreground">{new Date(b.earned_at).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <p className="text-muted-foreground text-center py-10">{terms.kidSingular} not found.</p>
      )}
    </DashboardLayout>
  );
}
