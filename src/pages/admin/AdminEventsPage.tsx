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
import { Plus, Search, Pencil, Trash2 } from "lucide-react";

const statusColors: Record<string, string> = {
  live: "bg-green-100 text-green-800",
  scheduled: "bg-blue-100 text-blue-800",
  past: "bg-gray-100 text-gray-600",
  draft: "bg-amber-100 text-amber-800",
};

interface EventForm {
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  display_month: string;
  display_day: string;
  badge_id: string;
  double_xp: boolean;
}

const emptyForm: EventForm = { name: "", description: "", start_date: "", end_date: "", display_month: "", display_day: "", badge_id: "", double_xp: false };

export default function AdminEventsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<EventForm>(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: events, isLoading } = useQuery({
    queryKey: ["admin-events"],
    queryFn: async () => {
      const { data, error } = await supabase.from("events").select("*, badges(name, icon)").order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });

  const { data: badges } = useQuery({
    queryKey: ["admin-badges-list"],
    queryFn: async () => {
      const { data, error } = await supabase.from("badges").select("id, name, icon").order("name");
      if (error) throw error;
      return data as any[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async ({ status }: { status: string }) => {
      const payload: any = {
        name: form.name,
        description: form.description || null,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        display_month: form.display_month || null,
        display_day: form.display_day || null,
        badge_id: form.badge_id || null,
        double_xp: form.double_xp,
        status,
      };
      if (editingId) {
        const { error } = await supabase.from("events").update(payload).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("events").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      setDrawerOpen(false);
      toast.success(editingId ? "Event updated!" : "Event created!");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("events").update({ status } as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      toast.success(status === "live" ? "Event is now live!" : "Event ended.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      setDeleteId(null);
      toast.success("Event deleted.");
    },
  });

  const filtered = (events ?? []).filter((e: any) => !search || e.name.toLowerCase().includes(search.toLowerCase()));

  const stats = {
    upcoming: events?.filter((e: any) => e.status === "scheduled").length ?? 0,
    live: events?.filter((e: any) => e.status === "live").length ?? 0,
    past: events?.filter((e: any) => e.status === "past").length ?? 0,
  };

  const openNew = () => { setEditingId(null); setForm(emptyForm); setDrawerOpen(true); };
  const openEdit = (e: any) => {
    setEditingId(e.id);
    setForm({ name: e.name, description: e.description ?? "", start_date: e.start_date ?? "", end_date: e.end_date ?? "", display_month: e.display_month ?? "", display_day: e.display_day ?? "", badge_id: e.badge_id ?? "", double_xp: e.double_xp ?? false });
    setDrawerOpen(true);
  };

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-foreground mb-6">Special Events</h1>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[{ label: "Upcoming", value: stats.upcoming }, { label: "Live Now", value: stats.live }, { label: "Past", value: stats.past }].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className="text-2xl font-bold text-foreground">{isLoading ? <Skeleton className="h-7 w-10" /> : s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search events..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Button onClick={openNew}><Plus className="mr-1.5 h-4 w-4" /> New Event</Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-muted-foreground mb-3">No events yet</p>
          <Button variant="outline" onClick={openNew}><Plus className="mr-1.5 h-4 w-4" /> Create your first event</Button>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((ev: any) => (
            <div key={ev.id} className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 group">
              <div className="flex h-12 w-12 flex-col items-center justify-center rounded-lg bg-primary/10 text-primary">
                <span className="text-[10px] font-bold uppercase leading-none">{ev.display_month || "TBD"}</span>
                <span className="text-lg font-bold leading-none">{ev.display_day || "?"}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground truncate">{ev.name}</p>
                <p className="text-xs text-muted-foreground truncate">{ev.description || "No description"}</p>
              </div>
              <Badge className={statusColors[ev.status] ?? statusColors.draft}>{ev.status}</Badge>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button size="sm" variant="ghost" onClick={() => openEdit(ev)}><Pencil className="h-3.5 w-3.5" /></Button>
                {(ev.status === "scheduled" || ev.status === "draft") && (
                  <Button size="sm" variant="ghost" onClick={() => statusMutation.mutate({ id: ev.id, status: "live" })}>Go Live</Button>
                )}
                {ev.status === "live" && (
                  <Button size="sm" variant="ghost" onClick={() => statusMutation.mutate({ id: ev.id, status: "past" })}>End</Button>
                )}
                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setDeleteId(ev.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          <SheetHeader><SheetTitle>{editingId ? "Edit Event" : "New Event"}</SheetTitle></SheetHeader>
          <div className="mt-6 space-y-5">
            <div><Label>Event Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Start Date</Label><Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} /></div>
              <div><Label>End Date</Label><Input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Display Month</Label><Input value={form.display_month} onChange={(e) => setForm({ ...form, display_month: e.target.value })} placeholder="e.g. JAN" /></div>
              <div><Label>Display Day</Label><Input value={form.display_day} onChange={(e) => setForm({ ...form, display_day: e.target.value })} placeholder="e.g. 15" /></div>
            </div>
            <div>
              <Label>Badge Reward</Label>
              <Select value={form.badge_id} onValueChange={(v) => setForm({ ...form, badge_id: v })}>
                <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                <SelectContent>{badges?.map((b: any) => <SelectItem key={b.id} value={b.id}>{b.icon} {b.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label>Double XP</Label>
              <Switch checked={form.double_xp} onCheckedChange={(v) => setForm({ ...form, double_xp: v })} />
            </div>
          </div>
          <SheetFooter className="mt-6 flex gap-2">
            <Button variant="outline" onClick={() => setDrawerOpen(false)}>Cancel</Button>
            <Button onClick={() => saveMutation.mutate({ status: "scheduled" })} disabled={!form.name || saveMutation.isPending}>
              {editingId ? "Save Changes" : "Create Event"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete this event?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={() => deleteId && deleteMutation.mutate(deleteId)}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
