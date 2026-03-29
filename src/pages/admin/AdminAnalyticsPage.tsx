import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminAnalyticsPage() {
  const { data: games } = useQuery({
    queryKey: ["analytics-games"],
    queryFn: async () => {
      const { data, error } = await supabase.from("games").select("id, name, icon, players_count, completions_count").eq("status", "live").order("players_count", { ascending: false }).limit(10);
      if (error) throw error;
      return data as any[];
    },
  });

  const { data: sessionStats, isLoading } = useQuery({
    queryKey: ["analytics-sessions"],
    queryFn: async () => {
      const { data, error } = await supabase.from("game_sessions").select("*");
      if (error) throw error;
      const sessions = data as any[];
      const completed = sessions.filter((s) => s.status === "completed");
      const avgDuration = completed.length > 0 ? Math.round(completed.reduce((a, s) => a + (s.duration_seconds ?? 0), 0) / completed.length / 60) : 0;
      const completionRate = sessions.length > 0 ? Math.round((completed.length / sessions.length) * 100) : 0;
      return { totalSessions: sessions.length, avgDuration, completionRate, completedCount: completed.length };
    },
  });

  const stats = [
    { label: "Total Sessions", value: sessionStats?.totalSessions ?? 0 },
    { label: "Avg. Session Length", value: `${sessionStats?.avgDuration ?? 0}m` },
    { label: "Completion Rate", value: `${sessionStats?.completionRate ?? 0}%` },
    { label: "Completed Games", value: sessionStats?.completedCount ?? 0 },
  ];

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-foreground mb-6">Analytics</h1>

      <div className="grid grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className="text-2xl font-bold text-foreground">{isLoading ? <Skeleton className="h-7 w-10" /> : s.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="text-lg font-semibold text-foreground mb-4">Top Games</h2>
        {!games ? (
          <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
        ) : games.length === 0 ? (
          <p className="text-muted-foreground text-sm">No live games yet.</p>
        ) : (
          <div className="space-y-2">
            {games.map((g: any, i: number) => (
              <div key={g.id} className="flex items-center gap-3 rounded-lg p-2 hover:bg-muted/50">
                <span className="text-sm font-bold text-muted-foreground w-6">{i + 1}</span>
                <span className="text-xl">{g.icon}</span>
                <span className="flex-1 font-medium text-foreground text-sm">{g.name}</span>
                <span className="text-xs text-muted-foreground">{g.players_count} sessions</span>
                <span className="text-xs text-muted-foreground">{g.players_count > 0 ? Math.round((g.completions_count / g.players_count) * 100) : 0}% completed</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
