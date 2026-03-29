import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";

export default function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: categories, isLoading } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").order("name");
      if (error) throw error;
      return data as any[];
    },
  });

  const { data: gameCounts } = useQuery({
    queryKey: ["admin-game-counts"],
    queryFn: async () => {
      const { data, error } = await supabase.from("games").select("category_id");
      if (error) throw error;
      const counts: Record<string, number> = {};
      (data as any[]).forEach((g) => { if (g.category_id) counts[g.category_id] = (counts[g.category_id] || 0) + 1; });
      return counts;
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("categories").insert({ name: newName.trim() });
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-categories"] }); setNewName(""); toast.success("Category created!"); },
    onError: (e: any) => toast.error(e.message),
  });

  const renameMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("categories").update({ name: editName.trim() } as any).eq("id", editingId!);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-categories"] }); setEditingId(null); toast.success("Category renamed!"); },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-categories"] }); setDeleteId(null); toast.success("Category deleted."); },
  });

  const deleteCategory = categories?.find((c: any) => c.id === deleteId);
  const deleteCount = deleteId ? (gameCounts?.[deleteId] ?? 0) : 0;

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-foreground mb-6">Categories</h1>

      <div className="flex gap-2 mb-6">
        <Input placeholder="New category name" value={newName} onChange={(e) => setNewName(e.target.value)} className="max-w-xs" onKeyDown={(e) => e.key === "Enter" && newName.trim() && createMutation.mutate()} />
        <Button onClick={() => createMutation.mutate()} disabled={!newName.trim() || createMutation.isPending}><Plus className="mr-1.5 h-4 w-4" /> Add</Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full rounded-xl" />)}</div>
      ) : (categories ?? []).length === 0 ? (
        <p className="text-muted-foreground text-center py-10">No categories yet.</p>
      ) : (
        <div className="space-y-2">
          {(categories ?? []).map((c: any) => (
            <div key={c.id} className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 group">
              {editingId === c.id ? (
                <>
                  <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="flex-1 max-w-xs" autoFocus onKeyDown={(e) => e.key === "Enter" && renameMutation.mutate()} />
                  <Button size="sm" variant="ghost" onClick={() => renameMutation.mutate()}><Check className="h-4 w-4" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}><X className="h-4 w-4" /></Button>
                </>
              ) : (
                <>
                  <p className="flex-1 font-medium text-foreground">{c.name}</p>
                  <span className="text-xs text-muted-foreground">{gameCounts?.[c.id] ?? 0} games</span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="sm" variant="ghost" onClick={() => { setEditingId(c.id); setEditName(c.name); }}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setDeleteId(c.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{deleteCategory?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteCount > 0 ? `Warning: ${deleteCount} game(s) use this category. They will lose their category assignment.` : "This action cannot be undone."}
            </AlertDialogDescription>
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
