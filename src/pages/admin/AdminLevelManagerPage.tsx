import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Lock, Unlock, Eye, Archive, Globe } from "lucide-react";

const statusColors: Record<string, string> = {
  live: "bg-green-100 text-green-800",
  draft: "bg-amber-100 text-amber-800",
  scheduled: "bg-blue-100 text-blue-800",
  archived: "bg-gray-100 text-gray-600",
};

const gradeOptions = ["K", "1", "2", "3", "4", "5", "6", "7", "8+"];

const WORLD_EMOJIS: Record<string, string> = {
  "north-america": "🌎",
  europe: "🏰",
  africa: "🌍",
  asia: "⛩️",
  "south-america": "🌿",
  australia: "🦘",
  antarctica: "❄️",
};

export default function AdminLevelManagerPage() {
  const queryClient = useQueryClient();
  const [gradeFilter, setGradeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // World locks query
  const { data: worldLocks = [], isLoading: worldsLoading } = useQuery({
    queryKey: ["world-locks"],
    queryFn: async () => {
      const { data, error } = await supabase.from("world_locks").select("*").order("id");
      if (error) throw error;
      return data as any[];
    },
  });

  const worldToggleMutation = useMutation({
    mutationFn: async ({ id, locked }: { id: string; locked: boolean }) => {
      const { error } = await supabase.from("world_locks").update({ locked, admin_override: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, { locked }) => {
      queryClient.invalidateQueries({ queryKey: ["world-locks"] });
      toast.success(locked ? "World locked." : "World unlocked!");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const unlockAllWorlds = async () => {
    for (const world of worldLocks) {
      await supabase.from("world_locks").update({ locked: false, admin_override: true }).eq("id", world.id);
    }
    queryClient.invalidateQueries({ queryKey: ["world-locks"] });
    toast.success("All worlds unlocked!");
  };

  const resetWorldsToDefault = async () => {
    const defaults: Record<string, boolean> = {
      "north-america": false,
      europe: true,
      africa: true,
      asia: true,
      "south-america": true,
      australia: true,
      antarctica: true,
    };
    for (const [id, locked] of Object.entries(defaults)) {
      await supabase.from("world_locks").update({ locked, admin_override: false }).eq("id", id);
    }
    queryClient.invalidateQueries({ queryKey: ["world-locks"] });
    toast.success("Worlds reset to default progression!");
  };

  // Missions query
  const { data: games, isLoading } = useQuery({
    queryKey: ["admin-games"],
    queryFn: async () => {
      const { data, error } = await supabase.from("games").select("*, categories(name)").order("name");
      if (error) throw error;
      return data as any[];
    },
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").order("name");
      if (error) throw error;
      return data as any[];
    },
  });

  const bulkMutation = useMutation({
    mutationFn: async ({ ids, updates }: { ids: string[]; updates: Record<string, any> }) => {
      for (const id of ids) {
        const { error } = await supabase.from("games").update(updates).eq("id", id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-games"] });
      setSelected(new Set());
      toast.success("Missions updated!");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, locked }: { id: string; locked: boolean }) => {
      const { error } = await supabase
        .from("games")
        .update({ locked } as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, { locked }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-games"] });
      toast.success(locked ? "Mission locked." : "Mission unlocked.");
    },
  });

  const filtered = (games ?? []).filter((g: any) => {
    if (statusFilter !== "all" && g.status !== statusFilter) return false;
    if (categoryFilter !== "all" && g.category_id !== categoryFilter) return false;
    if (gradeFilter !== "all") {
      const grade = gradeFilter === "K" ? 0 : parseInt(gradeFilter);
      if (g.min_grade != null && grade < g.min_grade) return false;
      if (g.max_grade != null && grade > g.max_grade) return false;
    }
    return true;
  });

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const selectAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((g: any) => g.id)));
  };

  const selectedIds = Array.from(selected);

  const gradeLabel = (g: any) => {
    if (g.min_grade != null && g.max_grade != null) return `${g.min_grade}–${g.max_grade}`;
    if (g.min_grade != null) return `${g.min_grade}+`;
    return "All";
  };

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-foreground mb-2">Level Manager</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Control world access and mission availability across the platform.
      </p>

      {/* ── WORLDS SECTION ── */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" /> World Access Control
          </h2>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={resetWorldsToDefault}>
              Reset to Default
            </Button>
            <Button size="sm" variant="outline" onClick={unlockAllWorlds}>
              <Unlock className="h-3.5 w-3.5 mr-1" /> Unlock All
            </Button>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 mb-2">
          <p className="text-xs text-muted-foreground mb-4">
            <strong>Default progression:</strong> North America is always open. Other worlds unlock automatically when
            the previous world is completed. Antarctica unlocks only when all 6 worlds are defeated. Use admin override
            to temporarily change access.
          </p>

          {worldsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {worldLocks.map((world: any) => (
                <div
                  key={world.id}
                  className={`rounded-xl border p-4 text-center transition-all ${
                    world.locked ? "border-destructive/30 bg-destructive/5" : "border-green-200 bg-green-50"
                  }`}
                >
                  <div className="text-3xl mb-2">{WORLD_EMOJIS[world.id] ?? "🌍"}</div>
                  <p className="text-xs font-bold text-foreground mb-1">{world.name}</p>
                  {world.admin_override && (
                    <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full mb-1 inline-block">
                      Admin Override
                    </span>
                  )}
                  <div className="mt-2">
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        world.locked ? "bg-destructive/10 text-destructive" : "bg-green-100 text-green-700"
                      }`}
                    >
                      {world.locked ? "🔒 Locked" : "🔓 Unlocked"}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant={world.locked ? "default" : "outline"}
                    className="mt-3 w-full text-xs h-7"
                    onClick={() =>
                      worldToggleMutation.mutate({
                        id: world.id,
                        locked: !world.locked,
                      })
                    }
                  >
                    {world.locked ? "Unlock" : "Lock"}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── MISSIONS SECTION ── */}
      <div>
        <h2 className="text-lg font-bold text-foreground mb-4">Mission Lock Control</h2>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-4">
          <Select value={gradeFilter} onValueChange={setGradeFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Grade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Grades</SelectItem>
              {gradeOptions.map((g) => (
                <SelectItem key={g} value={g}>
                  Grade {g}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories?.map((c: any) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="live">Live</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Bulk actions */}
        {selected.size > 0 && (
          <div className="flex items-center gap-2 mb-4 rounded-lg border border-primary/20 bg-primary/5 px-4 py-2">
            <span className="text-sm font-medium text-foreground">{selected.size} selected</span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => bulkMutation.mutate({ ids: selectedIds, updates: { locked: true } })}
            >
              <Lock className="h-3.5 w-3.5 mr-1" /> Lock
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => bulkMutation.mutate({ ids: selectedIds, updates: { locked: false } })}
            >
              <Unlock className="h-3.5 w-3.5 mr-1" /> Unlock
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => bulkMutation.mutate({ ids: selectedIds, updates: { status: "live" } })}
            >
              <Eye className="h-3.5 w-3.5 mr-1" /> Make Live
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => bulkMutation.mutate({ ids: selectedIds, updates: { status: "archived" } })}
            >
              <Archive className="h-3.5 w-3.5 mr-1" /> Archive
            </Button>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-44 rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-10">No missions match your filters.</p>
        ) : (
          <>
            <div className="mb-3">
              <button onClick={selectAll} className="text-xs text-primary hover:underline">
                {selected.size === filtered.length ? "Deselect all" : "Select all"}
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {filtered.map((g: any) => (
                <div
                  key={g.id}
                  className={`relative rounded-xl border bg-card p-5 transition-colors ${
                    selected.has(g.id) ? "border-primary bg-primary/5" : "border-border"
                  }`}
                >
                  <div className="absolute top-3 left-3">
                    <Checkbox checked={selected.has(g.id)} onCheckedChange={() => toggleSelect(g.id)} />
                  </div>
                  <div className="flex flex-col items-center text-center pt-4">
                    <span className="text-3xl mb-2">{g.icon}</span>
                    <p className="font-semibold text-foreground text-sm">{g.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">Grades: {gradeLabel(g)}</p>
                    <Badge className={`mt-2 ${statusColors[g.status] ?? statusColors.draft}`}>{g.status}</Badge>
                    {g.players_count > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">{g.players_count} players</p>
                    )}
                    <Button
                      size="sm"
                      variant={g.locked ? "destructive" : "outline"}
                      className="mt-3 w-full"
                      onClick={() => toggleMutation.mutate({ id: g.id, locked: !g.locked })}
                    >
                      {g.locked ? (
                        <>
                          <Unlock className="h-3.5 w-3.5 mr-1" /> Unlock
                        </>
                      ) : (
                        <>
                          <Lock className="h-3.5 w-3.5 mr-1" /> Lock
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
