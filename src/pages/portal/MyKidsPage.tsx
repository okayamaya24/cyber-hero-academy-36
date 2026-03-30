import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/portal/DashboardLayout";
import { useProfile } from "@/hooks/useProfile";
import { useAccountType } from "@/hooks/useAccountType";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

const avatarColors = ["blue", "green", "purple", "orange", "pink", "red", "teal", "yellow"];
const colorMap: Record<string, string> = {
  blue: "bg-blue-500", green: "bg-green-500", purple: "bg-purple-500", orange: "bg-orange-500",
  pink: "bg-pink-500", red: "bg-red-500", teal: "bg-teal-500", yellow: "bg-yellow-500",
};

interface KidForm { name: string; age: string; username: string; password: string; avatar_color: string; }
const emptyForm: KidForm = { name: "", age: "", username: "", password: "", avatar_color: "blue" };

export default function MyKidsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: profile } = useProfile();
  const { terms, isSchool } = useAccountType();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState<KidForm>(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: kids, isLoading } = useQuery({
    queryKey: ["my-kids", profile?.id],
    queryFn: async () => {
      if (!profile) return [];
      const { data, error } = await supabase.from("kids").select("*").eq("parent_id", profile.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
    enabled: !!profile,
  });

  const { data: sessionCounts } = useQuery({
    queryKey: ["kid-session-counts", profile?.id],
    queryFn: async () => {
      if (!kids?.length) return {};
      const kidIds = kids.map((k: any) => k.id);
      const { data, error } = await supabase.from("game_sessions").select("kid_id, status").in("kid_id", kidIds);
      if (error) throw error;
      const counts: Record<string, { total: number; completed: number }> = {};
      (data as any[]).forEach((s) => {
        if (!counts[s.kid_id]) counts[s.kid_id] = { total: 0, completed: 0 };
        counts[s.kid_id].total++;
        if (s.status === "completed") counts[s.kid_id].completed++;
      });
      return counts;
    },
    enabled: !!kids?.length,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!profile) throw new Error("No profile");
      const { error } = await supabase.from("kids").insert({
        parent_id: profile.id,
        name: form.name.trim(),
        age: form.age ? parseInt(form.age) : null,
        username: form.username.trim(),
        avatar_color: form.avatar_color,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-kids"] });
      setDrawerOpen(false);
      setForm(emptyForm);
      toast.success(`${terms.kidSingular} added!`);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("kids").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-kids"] });
      setDeleteId(null);
      toast.success(`${terms.kidSingular} removed.`);
    },
  });

  const getInitials = (name: string) => name?.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) || "?";
  const totalCompleted = Object.values(sessionCounts ?? {}).reduce((a, b: any) => a + b.completed, 0);

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">{terms.kidsLabel}</h1>
        <Button onClick={() => { setForm(emptyForm); setDrawerOpen(true); }}><Plus className="mr-1.5 h-4 w-4" /> {terms.addKidShort}</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: terms.kidPlural, value: kids?.length ?? 0 },
          { label: "Total Sessions", value: Object.values(sessionCounts ?? {}).reduce((a, b: any) => a + b.total, 0) },
          { label: "Games Completed", value: totalCompleted },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className="text-2xl font-bold text-foreground">{isLoading ? <Skeleton className="h-7 w-10" /> : s.value}</p>
          </div>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}</div>
      ) : (kids ?? []).length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-muted-foreground mb-3">No {terms.kidPlural.toLowerCase()} yet</p>
          <Button variant="outline" onClick={() => setDrawerOpen(true)}><Plus className="mr-1.5 h-4 w-4" /> {terms.addKid}</Button>
        </div>
      ) : (
        <div className="space-y-2">
          {(kids ?? []).map((k: any) => {
            const sc = sessionCounts?.[k.id];
            return (
              <div
                key={k.id}
                className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 cursor-pointer hover:border-primary/30 transition-colors group"
                onClick={() => navigate(`/dashboard/kids/${k.id}`)}
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white ${colorMap[k.avatar_color] ?? "bg-blue-500"}`}>
                  {getInitials(k.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground">{k.name}</p>
                  <p className="text-xs text-muted-foreground">Age {k.age ?? "?"} · {sc?.total ?? 0} sessions · {sc?.completed ?? 0} completed</p>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => { e.stopPropagation(); setDeleteId(k.id); }}>
                  <Button size="sm" variant="ghost" className="text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add drawer */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          <SheetHeader><SheetTitle>{terms.addKid}</SheetTitle></SheetHeader>
          <div className="mt-6 space-y-5">
            <div><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" /></div>
            <div><Label>Age</Label><Input type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} placeholder="e.g. 8" /></div>
            <div><Label>Username *</Label><Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="Choose a username" /></div>
            <div><Label>Password *</Label><Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Set a password" /></div>
            <div>
              <Label>Avatar Color</Label>
              <div className="flex gap-2 mt-2">
                {avatarColors.map((c) => (
                  <button key={c} type="button" onClick={() => setForm({ ...form, avatar_color: c })} className={`h-8 w-8 rounded-full transition-all ${colorMap[c]} ${form.avatar_color === c ? "ring-2 ring-offset-2 ring-primary scale-110" : "hover:scale-105"}`} />
                ))}
              </div>
            </div>
            {isSchool && (
              <div className="rounded-lg border border-dashed border-border p-4 text-center">
                <p className="text-sm text-muted-foreground mb-2">Roster Import</p>
                <Button variant="outline" size="sm" onClick={() => toast.success("CSV upload coming soon!")}>Upload CSV</Button>
              </div>
            )}
          </div>
          <SheetFooter className="mt-6">
            <Button variant="outline" onClick={() => setDrawerOpen(false)}>Cancel</Button>
            <Button onClick={() => createMutation.mutate()} disabled={!form.name || !form.username || !form.password || createMutation.isPending}>
              {terms.addKid}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Remove this {terms.kidSingular.toLowerCase()}?</AlertDialogTitle><AlertDialogDescription>This will permanently delete their account and all activity data.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={() => deleteId && deleteMutation.mutate(deleteId)}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
