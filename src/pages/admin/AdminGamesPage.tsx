import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Search, Pencil, Trash2, Eye, EyeOff, Archive } from "lucide-react";

type GameStatus = "draft" | "live" | "scheduled" | "archived";

const statusColors: Record<string, string> = {
  live: "bg-green-100 text-green-800",
  draft: "bg-amber-100 text-amber-800",
  scheduled: "bg-blue-100 text-blue-800",
  archived: "bg-gray-100 text-gray-600",
};

const tabs: { label: string; value: string }[] = [
  { label: "All", value: "all" },
  { label: "Live", value: "live" },
  { label: "Draft", value: "draft" },
  { label: "Scheduled", value: "scheduled" },
  { label: "Archived", value: "archived" },
];

interface GameForm {
  name: string;
  description: string;
  icon: string;
  age_range: string;
  category_id: string;
  featured: boolean;
  publish_date: string;
}

const emptyForm: GameForm = { name: "", description: "", icon: "🎮", age_range: "", category_id: "", featured: false, publish_date: "" };
const emojiOptions = ["🎮", "🧩", "📚", "🔢", "🎨", "🧪", "💻", "🌍", "⭐", "🏆"];

export default function AdminGamesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<GameForm>(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: games, isLoading } = useQuery({
    queryKey: ["admin-games"],
    queryFn: async () => {
      const { data, error } = await supabase.from("games").select("*, categories(name)").order("created_at", { ascending: false });
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

  const saveMutation = useMutation({
    mutationFn: async ({ status }: { status: GameStatus }) => {
      const payload: any = {
        name: form.name,
        description: form.description || null,
        icon: form.icon,
        age_range: form.age_range || null,
        category_id: form.category_id || null,
        featured: form.featured,
        publish_date: form.publish_date || null,
        status,
      };
      if (editingId) {
        const { error } = await supabase.from("games").update(payload).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("games").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-games"] });
      setDrawerOpen(false);
      toast.success(editingId ? "Game updated!" : status === "live" ? "Game created & published!" : "Game saved as draft!");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("games").update({ status } as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-games"] });
      toast.success(status === "live" ? "Game is now live!" : status === "draft" ? "Game unpublished." : "Game archived.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("games").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-games"] });
      setDeleteId(null);
      toast.success("Game deleted.");
    },
  });

  const filtered = (games ?? []).filter((g: any) => {
    if (tab !== "all" && g.status !== tab) return false;
    if (search && !g.name.toLowerCase().includes(search.toLowerCase()) && !(g.categories?.name || "").toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const stats = {
    total: games?.length ?? 0,
    live: games?.filter((g: any) => g.status === "live").length ?? 0,
    draft: games?.filter((g: any) => g.status === "draft").length ?? 0,
    archived: games?.filter((g: any) => g.status === "archived").length ?? 0,
  };

  const openNew = () => { setEditingId(null); setForm(emptyForm); setDrawerOpen(true); };
  const openEdit = (g: any) => {
    setEditingId(g.id);
    setForm({ name: g.name, description: g.description ?? "", icon: g.icon ?? "🎮", age_range: g.age_range ?? "", category_id: g.category_id ?? "", featured: g.featured ?? false, publish_date: g.publish_date ? g.publish_date.split("T")[0] : "" });
    setDrawerOpen(true);
  };

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-foreground mb-6">Games</h1>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Games", value: stats.total },
          { label: "Live", value: stats.live },
          { label: "Draft", value: stats.draft },
          { label: "Archived", value: stats.archived },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className="text-2xl font-bold text-foreground">{isLoading ? <Skeleton className="h-7 w-10" /> : s.value}</p>
          </div>
        ))}
      </div>

      {/* Search + New */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search games..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Button onClick={openNew}><Plus className="mr-1.5 h-4 w-4" /> New Game</Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4">
        {tabs.map((t) => (
          <button key={t.value} onClick={() => setTab(t.value)} className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${tab === t.value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-muted-foreground mb-3">No games yet</p>
          <Button variant="outline" onClick={openNew}><Plus className="mr-1.5 h-4 w-4" /> Create your first game</Button>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((g: any) => (
            <div key={g.id} className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 group">
              <span className="text-2xl">{g.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-foreground truncate">{g.name}</p>
                  {g.featured && <Badge variant="secondary" className="text-xs">Featured</Badge>}
                </div>
                <p className="text-xs text-muted-foreground">
                  {g.categories?.name ?? "No category"} · {g.age_range || "All ages"}
                  {g.status === "live" && g.players_count > 0 && ` · ${g.players_count} players`}
                </p>
              </div>
              <Badge className={statusColors[g.status] ?? statusColors.draft}>{g.status}</Badge>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button size="sm" variant="ghost" onClick={() => openEdit(g)}><Pencil className="h-3.5 w-3.5" /></Button>
                {(g.status === "draft" || g.status === "scheduled") && (
                  <Button size="sm" variant="ghost" onClick={() => statusMutation.mutate({ id: g.id, status: "live" })}><Eye className="h-3.5 w-3.5" /></Button>
                )}
                {g.status === "live" && (
                  <Button size="sm" variant="ghost" onClick={() => statusMutation.mutate({ id: g.id, status: "draft" })}><EyeOff className="h-3.5 w-3.5" /></Button>
                )}
                {(g.status === "live" || g.status === "draft") && (
                  <Button size="sm" variant="ghost" onClick={() => statusMutation.mutate({ id: g.id, status: "archived" })}><Archive className="h-3.5 w-3.5" /></Button>
                )}
                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setDeleteId(g.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Drawer */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          <SheetHeader><SheetTitle>{editingId ? "Edit Game" : "New Game"}</SheetTitle></SheetHeader>
          <div className="mt-6 space-y-5">
            <div><Label>Game Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Math Blaster" /></div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} /></div>
            <div>
              <Label>Icon</Label>
              <div className="flex gap-2 mt-1 flex-wrap">
                {emojiOptions.map((e) => (
                  <button key={e} type="button" onClick={() => setForm({ ...form, icon: e })} className={`text-2xl p-1.5 rounded-lg transition-colors ${form.icon === e ? "bg-primary/20 ring-2 ring-primary" : "hover:bg-muted"}`}>{e}</button>
                ))}
              </div>
            </div>
            <div><Label>Age Range</Label><Input value={form.age_range} onChange={(e) => setForm({ ...form, age_range: e.target.value })} placeholder="e.g. 6–9" /></div>
            <div>
              <Label>Category</Label>
              <Select value={form.category_id} onValueChange={(v) => setForm({ ...form, category_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>{categories?.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label>Featured</Label>
              <Switch checked={form.featured} onCheckedChange={(v) => setForm({ ...form, featured: v })} />
            </div>
            <div><Label>Publish Date</Label><Input type="date" value={form.publish_date} onChange={(e) => setForm({ ...form, publish_date: e.target.value })} /></div>
          </div>
          <SheetFooter className="mt-6 flex gap-2">
            <Button variant="outline" onClick={() => setDrawerOpen(false)}>Cancel</Button>
            <Button variant="secondary" onClick={() => saveMutation.mutate({ status: "draft" })} disabled={!form.name || saveMutation.isPending}>Save as Draft</Button>
            <Button onClick={() => saveMutation.mutate({ status: "live" })} disabled={!form.name || saveMutation.isPending}>
              {editingId ? "Save & Go Live" : "Create & Go Live"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this game?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={() => deleteId && deleteMutation.mutate(deleteId)}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
