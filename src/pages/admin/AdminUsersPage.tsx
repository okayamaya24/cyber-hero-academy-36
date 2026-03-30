import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Search, Eye, RotateCcw } from "lucide-react";

const tabs = [
  { label: "All", value: "all" },
  { label: "Families", value: "family" },
  { label: "Schools", value: "school" },
  { label: "Kids", value: "kid" },
];

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");
  const [viewUser, setViewUser] = useState<any>(null);
  const [resetId, setResetId] = useState<string | null>(null);
  const [resetName, setResetName] = useState("");

  const { data: profiles, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").neq("role", "creator").order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });

  const { data: kidLinks } = useQuery({
    queryKey: ["admin-kid-links"],
    queryFn: async () => {
      const { data, error } = await supabase.from("parent_kid_links").select("*");
      if (error) throw error;
      return data as any[];
    },
  });

  const { data: gameSessions } = useQuery({
    queryKey: ["admin-game-sessions-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.from("game_sessions").select("kid_id, status, duration_seconds");
      if (error) throw error;
      return data as any[];
    },
  });

  const suspendMutation = useMutation({
    mutationFn: async ({ id, suspended }: { id: string; suspended: boolean }) => {
      const { error } = await supabase.from("profiles").update({ plan: suspended ? "suspended" : "free" } as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, { suspended }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success(suspended ? "User suspended." : "User unsuspended.");
    },
  });

  const resetProgressMutation = useMutation({
    mutationFn: async (userId: string) => {
      // Delete game_sessions and kid_progress for this user
      await supabase.from("game_sessions").delete().eq("kid_id", userId);
      await supabase.from("kid_progress").delete().eq("kid_id", userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-game-sessions-stats"] });
      setResetId(null);
      toast.success("Progress reset successfully.");
    },
    onError: (e: any) => toast.error(e.message),
  });

  // Compute kid counts per parent
  const kidCountsByParent: Record<string, number> = {};
  (kidLinks ?? []).forEach((l: any) => {
    kidCountsByParent[l.parent_id] = (kidCountsByParent[l.parent_id] || 0) + 1;
  });

  // Compute session stats per kid
  const sessionStatsByKid: Record<string, { completed: number; total: number; duration: number }> = {};
  (gameSessions ?? []).forEach((s: any) => {
    if (!sessionStatsByKid[s.kid_id]) sessionStatsByKid[s.kid_id] = { completed: 0, total: 0, duration: 0 };
    sessionStatsByKid[s.kid_id].total++;
    if (s.status === "completed") sessionStatsByKid[s.kid_id].completed++;
    sessionStatsByKid[s.kid_id].duration += s.duration_seconds ?? 0;
  });

  const filtered = (profiles ?? []).filter((p: any) => {
    if (tab !== "all" && p.role !== tab) return false;
    if (search && !(p.display_name || "").toLowerCase().includes(search.toLowerCase()) && !(p.email || "").toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const stats = {
    families: profiles?.filter((p: any) => p.role === "family").length ?? 0,
    schools: profiles?.filter((p: any) => p.role === "school").length ?? 0,
    kids: profiles?.filter((p: any) => p.role === "kid").length ?? 0,
    total: profiles?.length ?? 0,
  };

  const getInitials = (name: string) => name?.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2) || "?";

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-foreground mb-6">Users</h1>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Families", value: stats.families },
          { label: "Total Schools", value: stats.schools },
          { label: "Total Kids", value: stats.kids },
          { label: "Total Accounts", value: stats.total },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className="text-2xl font-bold text-foreground">{isLoading ? <Skeleton className="h-7 w-10" /> : s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
      </div>

      <div className="flex gap-1 mb-4">
        {tabs.map((t) => (
          <button key={t.value} onClick={() => setTab(t.value)} className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${tab === t.value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}</div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-muted-foreground py-10">No users found.</p>
      ) : (
        <div className="space-y-2">
          {filtered.map((p: any) => {
            const suspended = p.plan === "suspended";
            const kidStats = sessionStatsByKid[p.user_id];
            return (
              <div key={p.id} className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 group">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                  {getInitials(p.display_name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">{p.display_name || "No name"}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.role} · {p.role === "kid" ? `${kidStats?.completed ?? 0} missions completed` : `${kidCountsByParent[p.user_id] ?? 0} kids`} · Joined {new Date(p.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Badge className={suspended ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}>{suspended ? "Suspended" : "Active"}</Badge>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="sm" variant="ghost" onClick={() => setViewUser(p)}><Eye className="h-3.5 w-3.5" /></Button>
                  {p.role === "kid" && (
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => { setResetId(p.user_id); setResetName(p.display_name); }}>
                      <RotateCcw className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => suspendMutation.mutate({ id: p.id, suspended: !suspended })}>
                    {suspended ? "Unsuspend" : "Suspend"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* User detail panel */}
      <Sheet open={!!viewUser} onOpenChange={() => setViewUser(null)}>
        <SheetContent>
          <SheetHeader><SheetTitle>User Details</SheetTitle></SheetHeader>
          {viewUser && (
            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">{getInitials(viewUser.display_name)}</div>
                <div>
                  <p className="font-semibold text-foreground">{viewUser.display_name}</p>
                  <p className="text-sm text-muted-foreground">{viewUser.email}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Role</span><span className="font-medium text-foreground capitalize">{viewUser.role}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Account Type</span><span className="font-medium text-foreground capitalize">{viewUser.account_type ?? "—"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Grade Level</span><span className="font-medium text-foreground">{viewUser.grade_level ?? "—"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Plan</span><span className="font-medium text-foreground">{viewUser.plan}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Joined</span><span className="font-medium text-foreground">{new Date(viewUser.created_at).toLocaleDateString()}</span></div>
                {viewUser.role === "kid" && (
                  <>
                    <div className="flex justify-between"><span className="text-muted-foreground">Missions Completed</span><span className="font-medium text-foreground">{sessionStatsByKid[viewUser.user_id]?.completed ?? 0}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Total Sessions</span><span className="font-medium text-foreground">{sessionStatsByKid[viewUser.user_id]?.total ?? 0}</span></div>
                  </>
                )}
              </div>
              {viewUser.role === "kid" && (
                <Button
                  variant="destructive"
                  size="sm"
                  className="mt-4"
                  onClick={() => { setResetId(viewUser.user_id); setResetName(viewUser.display_name); setViewUser(null); }}
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-1" /> Reset Progress
                </Button>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Reset progress confirm */}
      <AlertDialog open={!!resetId} onOpenChange={() => setResetId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Progress?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently reset all of {resetName}'s progress. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={() => resetId && resetProgressMutation.mutate(resetId)}>
              Reset Progress
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
