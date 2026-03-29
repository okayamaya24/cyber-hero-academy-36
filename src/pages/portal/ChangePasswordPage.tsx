import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/portal/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function ChangePasswordPage() {
  const [form, setForm] = useState({ current: "", password: "", confirm: "" });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error("Password must be at least 6 characters."); return; }
    if (form.password !== form.confirm) { toast.error("Passwords do not match."); return; }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password: form.password });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Password updated!");
    setForm({ current: "", password: "", confirm: "" });
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-foreground mb-6">Change Password</h1>
      <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-6 max-w-md space-y-5">
        <div><Label>Current Password</Label><Input type="password" value={form.current} onChange={(e) => setForm({ ...form, current: e.target.value })} /></div>
        <div><Label>New Password</Label><Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="At least 6 characters" /></div>
        <div>
          <Label>Confirm New Password</Label>
          <Input type="password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} />
          {form.confirm && form.password !== form.confirm && <p className="text-xs text-destructive mt-1">Passwords do not match</p>}
        </div>
        <Button type="submit" disabled={saving || !form.password || !form.confirm}>{saving ? "Updating..." : "Update Password"}</Button>
      </form>
    </DashboardLayout>
  );
}
