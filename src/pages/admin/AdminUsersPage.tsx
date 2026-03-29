import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { toast } from "sonner";
import { Search, Eye } from "lucide-react";

const tabs = [
  { label: "All", value: "all" },
  { label: "Family", value: "family" },
  { label: "School", value: "school" },
];

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");
  const [viewUser, setViewUser] = useState<any>(null);

  const { data: profiles, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").neq("role", "creator").order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });

  const { data: kidCounts } = useQuery({
    queryKey: ["admin-kid-counts"],
    queryFn: async () => {
      const { data, error } = await supabase.from("kids").select("parent_id");
      if (error) throw error;
      const counts: Record<string, number> = {};
      (data as any[]).forEach((k) => { counts[k.parent_id] = (counts[k.parent_id] || 0) + 1; });
      return counts;
    },
  });

  const suspendMutation = useMutation({
    mutationFn: async ({ id, suspended }: { id: string; suspended: boolean }) => {
      // We use a simple plan field to mark suspended status
      const { error } = await supabase.from("profiles").update({ plan: suspended ? "suspended" : "free" } as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, { suspended }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success(suspended ? "User suspended." : "User unsuspended.");
    },
  });

  const filtered = (profiles ?? []).filter((p: any) => {
    if (tab !== "all" && p.account_type !== tab) return false;
    if (search && !(p.display_name || "").toLowerCase().includes(search.toLowerCase()) && !(p.email || "").toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const stats = {
    families: profiles?.filter((p: any) => p.account_type === "family").length ?? 0,
    schools: profiles?.filter((p: any) => p.account_type === "school").length ?? 0,
    totalKids: Object.values(kidCounts ?? {}).reduce((a: number, b: any) => a + b, 0) as number,
  };

  const getInitials = (name: string) => name?.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2) || "?";

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-foreground mb-6">Users</h1>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Families", value: stats.families },
          { label: "Total Schools", value: stats.schools },
          { label: "Total Kids", value: stats.totalKids },
          { label: "Total Accounts", value: profiles?.length ?? 0 },
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
            return (
              <div key={p.id} className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 group">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                  {getInitials(p.display_name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">{p.display_name || "No name"}</p>
                  <p className="text-xs text-muted-foreground">{p.account_type} · {kidCounts?.[p.id] ?? 0} kids · Joined {new Date(p.created_at).toLocaleDateString()}</p>
                </div>
                <Badge className={suspended ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}>{suspended ? "Suspended" : "Active"}</Badge>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="sm" variant="ghost" onClick={() => setViewUser(p)}><Eye className="h-3.5 w-3.5" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => suspendMutation.mutate({ id: p.id, suspended: !suspended })}>
                    {suspended ? "Unsuspend" : "Suspend"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

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
                <div className="flex justify-between"><span className="text-muted-foreground">Account Type</span><span className="font-medium text-foreground capitalize">{viewUser.account_type}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Plan</span><span className="font-medium text-foreground">{viewUser.plan}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Kids</span><span className="font-medium text-foreground">{kidCounts?.[viewUser.id] ?? 0}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Joined</span><span className="font-medium text-foreground">{new Date(viewUser.created_at).toLocaleDateString()}</span></div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </AdminLayout>
  );
}
