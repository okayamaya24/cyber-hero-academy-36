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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Megaphone, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const audiences = [
  { label: "All Users", value: "all" },
  { label: "Kids Only", value: "kids" },
  { label: "Parents Only", value: "parents" },
  { label: "Teachers Only", value: "teachers" },
  { label: "By Grade Range", value: "grade" },
];

export default function AdminAnnouncementsPage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState("all");
  const [gradeMin, setGradeMin] = useState("");
  const [gradeMax, setGradeMax] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: announcements, isLoading } = useQuery({
    queryKey: ["admin-announcements"],
    queryFn: async () => {
      const { data, error } = await supabase.from("announcements").select("*").order("sent_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });

  const sendMutation = useMutation({
    mutationFn: async () => {
      const payload: any = {
        title,
        body,
        target_audience: audience === "grade" ? "kids" : audience,
        target_grade_min: audience === "grade" && gradeMin ? parseInt(gradeMin) : null,
        target_grade_max: audience === "grade" && gradeMax ? parseInt(gradeMax) : null,
        created_by: user?.id ?? null,
        is_active: true,
      };
      const { error } = await supabase.from("announcements").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-announcements"] });
      setTitle("");
      setBody("");
      setAudience("all");
      setGradeMin("");
      setGradeMax("");
      toast.success("Announcement sent!");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("announcements").update({ is_active } as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-announcements"] });
      toast.success("Announcement updated.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("announcements").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-announcements"] });
      setDeleteId(null);
      toast.success("Announcement deleted.");
    },
  });

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-foreground mb-6">Announcements</h1>

      {/* Send new */}
      <div className="rounded-xl border border-border bg-card p-6 mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2"><Megaphone className="h-5 w-5" /> Send New Announcement</h2>
        <div className="space-y-4 max-w-xl">
          <div><Label>Title *</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Announcement title" /></div>
          <div><Label>Message *</Label><Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} placeholder="Write your announcement..." /></div>
          <div>
            <Label>Target Audience</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {audiences.map((a) => (
                <button
                  key={a.value}
                  type="button"
                  onClick={() => setAudience(a.value)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors border ${audience === a.value ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:bg-muted"}`}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>
          {audience === "grade" && (
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Min Grade</Label><Input type="number" value={gradeMin} onChange={(e) => setGradeMin(e.target.value)} placeholder="e.g. 1" /></div>
              <div><Label>Max Grade</Label><Input type="number" value={gradeMax} onChange={(e) => setGradeMax(e.target.value)} placeholder="e.g. 5" /></div>
            </div>
          )}
          <Button onClick={() => sendMutation.mutate()} disabled={!title.trim() || !body.trim() || sendMutation.isPending}>
            Send Announcement
          </Button>
        </div>
      </div>

      {/* History */}
      <h2 className="text-lg font-semibold text-foreground mb-4">Sent Announcements</h2>
      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}</div>
      ) : (announcements ?? []).length === 0 ? (
        <p className="text-muted-foreground text-center py-10">No announcements sent yet.</p>
      ) : (
        <div className="space-y-2">
          {(announcements ?? []).map((a: any) => (
            <div key={a.id} className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 group">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground truncate">{a.title}</p>
                <p className="text-xs text-muted-foreground">
                  {a.target_audience} · {new Date(a.sent_at).toLocaleDateString()}
                </p>
              </div>
              <Badge className={a.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}>
                {a.is_active ? "Active" : "Inactive"}
              </Badge>
              <Switch checked={a.is_active} onCheckedChange={(v) => toggleMutation.mutate({ id: a.id, is_active: v })} />
              <Button size="sm" variant="ghost" className="text-destructive opacity-0 group-hover:opacity-100" onClick={() => setDeleteId(a.id)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete this announcement?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={() => deleteId && deleteMutation.mutate(deleteId)}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
