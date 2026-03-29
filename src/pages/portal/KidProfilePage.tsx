import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/portal/DashboardLayout";
import { useAccountType } from "@/hooks/useAccountType";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";

const colorMap: Record<string, string> = {
  blue: "bg-blue-500", green: "bg-green-500", purple: "bg-purple-500", orange: "bg-orange-500",
  pink: "bg-pink-500", red: "bg-red-500", teal: "bg-teal-500", yellow: "bg-yellow-500",
};

const statusColors: Record<string, string> = {
  completed: "bg-green-100 text-green-800",
  in_progress: "bg-blue-100 text-blue-800",
};

export default function KidProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { terms } = useAccountType();

  const { data: kid, isLoading: kidLoading } = useQuery({
    queryKey: ["kid", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("kids").select("*").eq("id", id!).single();
      if (error) throw error;
      return data as any;
    },
    enabled: !!id,
  });

  const { data: sessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ["kid-sessions", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("game_sessions")
        .select("*, games(name, icon)")
        .eq("kid_id", id!)
        .order("started_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
    enabled: !!id,
  });

  const completed = sessions?.filter((s: any) => s.status === "completed") ?? [];
  const totalDuration = sessions?.reduce((a: number, s: any) => a + (s.duration_seconds ?? 0), 0) ?? 0;
  const hours = Math.floor(totalDuration / 3600);
  const mins = Math.round((totalDuration % 3600) / 60);
  const avgSession = completed.length > 0 ? Math.round(completed.reduce((a: number, s: any) => a + (s.duration_seconds ?? 0), 0) / completed.length / 60) : 0;
  const getInitials = (name: string) => name?.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2) || "?";

  return (
    <DashboardLayout>
      <Button variant="ghost" size="sm" onClick={() => navigate("/portal")} className="mb-4">
        <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to {terms.kidsLabel}
      </Button>

      {kidLoading ? (
        <Skeleton className="h-32 w-full rounded-xl" />
      ) : kid ? (
        <>
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <div className={`flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold text-white ${colorMap[kid.avatar_color] ?? "bg-blue-500"}`}>
              {getInitials(kid.name)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{kid.name}</h1>
              <p className="text-muted-foreground">Age {kid.age ?? "?"}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-5 gap-3 mb-6">
            {[
              { label: "Sessions", value: sessions?.length ?? 0 },
              { label: "Time Spent", value: `${hours}h ${mins}m` },
              { label: "Completed", value: completed.length },
              { label: "Badges", value: 0 },
              { label: "Avg. Session", value: `${avgSession}m` },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-border bg-card p-3 text-center">
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-lg font-bold text-foreground">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Activity log */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-lg font-semibold text-foreground mb-4">Game Activity</h2>
            {sessionsLoading ? (
              <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
            ) : (sessions ?? []).length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-6">No games played yet.</p>
            ) : (
              <div className="space-y-2">
                {(sessions ?? []).map((s: any) => (
                  <div key={s.id} className="flex items-center gap-3 rounded-lg p-2 hover:bg-muted/50">
                    <span className="text-xl">{s.games?.icon ?? "🎮"}</span>
                    <span className="flex-1 text-sm font-medium text-foreground">{s.games?.name ?? "Unknown Game"}</span>
                    <span className="text-xs text-muted-foreground">{new Date(s.started_at).toLocaleDateString()}</span>
                    <Badge className={statusColors[s.status] ?? "bg-gray-100 text-gray-600"}>{s.status === "completed" ? "Completed" : "In Progress"}</Badge>
                    {s.score != null && <span className="text-xs font-medium text-foreground">{s.score}%</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <p className="text-muted-foreground text-center py-10">{terms.kidSingular} not found.</p>
      )}
    </DashboardLayout>
  );
}
