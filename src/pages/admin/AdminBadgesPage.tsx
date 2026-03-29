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
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";

const emojiOptions = ["🏅", "⭐", "🏆", "🎖️", "💎", "🔥", "🌟", "🎯", "👑", "🦸"];

interface BadgeForm { name: string; icon: string; description: string; trigger_condition: string; active: boolean; }
const emptyForm: BadgeForm = { name: "", icon: "🏅", description: "", trigger_condition: "", active: true };

export default function AdminBadgesPage() {
  const queryClient = useQueryClient();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<BadgeForm>(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: badges, isLoading } = useQuery({
    queryKey: ["admin-badges"],
    queryFn: async () => {
      const { data, error } = await supabase.from("badges").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload: any = { name: form.name, icon: form.icon, description: form.description || null, trigger_condition: form.trigger_condition || null, active: form.active };
      if (editingId) {
        const { error } = await supabase.from("badges").update(payload).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("badges").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-badges"] });
      setDrawerOpen(false);
      toast.success(editingId ? "Badge updated!" : "Badge created!");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase.from("badges").update({ active } as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-badges"] });
      toast.success("Badge updated.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("badges").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-badges"] });
      setDeleteId(null);
      toast.success("Badge deleted.");
    },
  });

  const openNew = () => { setEditingId(null); setForm(emptyForm); setDrawerOpen(true); };
  const openEdit = (b: any) => {
    setEditingId(b.id);
    setForm({ name: b.name, icon: b.icon, description: b.description ?? "", trigger_condition: b.trigger_condition ?? "", active: b.active });
    setDrawerOpen(true);
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Badges</h1>
        <Button onClick={openNew}><Plus className="mr-1.5 h-4 w-4" /> New Badge</Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-40 rounded-xl" />)}</div>
      ) : (badges ?? []).length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-muted-foreground mb-3">No badges yet</p>
          <Button variant="outline" onClick={openNew}><Plus className="mr-1.5 h-4 w-4" /> Create your first badge</Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(badges ?? []).map((b: any) => (
            <div key={b.id} className="flex flex-col items-center rounded-xl border border-border bg-card p-5 text-center group">
              <span className="text-4xl mb-2">{b.icon}</span>
              <p className="font-semibold text-foreground text-sm">{b.name}</p>
              <p className="text-xs text-muted-foreground mt-1">{b.earned_count} earned</p>
              <Badge className={`mt-2 ${b.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}>{b.active ? "Active" : "Inactive"}</Badge>
              <div className="flex gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button size="sm" variant="ghost" onClick={() => openEdit(b)}><Pencil className="h-3.5 w-3.5" /></Button>
                <Button size="sm" variant="ghost" onClick={() => toggleMutation.mutate({ id: b.id, active: !b.active })}>
                  {b.active ? "Disable" : "Enable"}
                </Button>
                <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setDeleteId(b.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          <SheetHeader><SheetTitle>{editingId ? "Edit Badge" : "New Badge"}</SheetTitle></SheetHeader>
          <div className="mt-6 space-y-5">
            <div><Label>Badge Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div>
              <Label>Icon</Label>
              <div className="flex gap-2 mt-1 flex-wrap">
                {emojiOptions.map((e) => (
                  <button key={e} type="button" onClick={() => setForm({ ...form, icon: e })} className={`text-2xl p-1.5 rounded-lg transition-colors ${form.icon === e ? "bg-primary/20 ring-2 ring-primary" : "hover:bg-muted"}`}>{e}</button>
                ))}
              </div>
            </div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} /></div>
            <div><Label>Trigger Condition</Label><Input value={form.trigger_condition} onChange={(e) => setForm({ ...form, trigger_condition: e.target.value })} placeholder="e.g. Complete 5 reading games" /></div>
            <div className="flex items-center justify-between"><Label>Active</Label><Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} /></div>
          </div>
          <SheetFooter className="mt-6">
            <Button variant="outline" onClick={() => setDrawerOpen(false)}>Cancel</Button>
            <Button onClick={() => saveMutation.mutate()} disabled={!form.name || saveMutation.isPending}>{editingId ? "Save Changes" : "Create Badge"}</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete this badge?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={() => deleteId && deleteMutation.mutate(deleteId)}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
