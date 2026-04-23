import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { usePlatformSettings, useUpdatePlatformSetting } from "@/hooks/usePlatformSettings";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const flags = [
  { key: "special_events_visible", label: "Special Events visible", description: "Show special events to users" },
  { key: "leaderboards_visible", label: "Leaderboards visible", description: "Show leaderboards to users" },
  { key: "onboarding_enabled", label: "New user onboarding flow", description: "Show onboarding for new signups" },
  { key: "school_accounts_enabled", label: "School accounts allowed", description: "Allow teachers to sign up" },
  { key: "maintenance_mode", label: "Maintenance Mode", description: "All non-admin users see a maintenance page" },
  { key: "world_map_enabled", label: "World Map", description: "Show the World Map tab in Continue Learning on the kid dashboard" },
];

export default function AdminSettingsPage() {
  const { data: settings, isLoading } = usePlatformSettings();
  const updateSetting = useUpdatePlatformSetting();

  const [emailForm, setEmailForm] = useState({ email: "", password: "" });
  const [savingAuth, setSavingAuth] = useState(false);

  const handleUpdateEmail = async () => {
    if (!emailForm.email) return;
    setSavingAuth(true);
    const { error } = await supabase.auth.updateUser({ email: emailForm.email });
    setSavingAuth(false);
    if (error) toast.error(error.message);
    else toast.success("Email update initiated. Check your inbox.");
  };

  const handleUpdatePassword = async () => {
    if (!emailForm.password || emailForm.password.length < 8) { toast.error("Password must be at least 8 characters."); return; }
    setSavingAuth(true);
    const { error } = await supabase.auth.updateUser({ password: emailForm.password });
    setSavingAuth(false);
    if (error) toast.error(error.message);
    else { toast.success("Password updated!"); setEmailForm((f) => ({ ...f, password: "" })); }
  };

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-foreground mb-6">Settings</h1>

      <div className="rounded-xl border border-border bg-card p-6 mb-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Feature Flags</h2>
        {isLoading ? (
          <div className="space-y-4">{flags.map((f) => <Skeleton key={f.key} className="h-10 w-full" />)}</div>
        ) : (
          <div className="space-y-4">
            {flags.map((f) => (
              <div key={f.key} className="flex items-center justify-between rounded-lg border border-border p-4">
                <div>
                  <p className="font-medium text-foreground text-sm">{f.label}</p>
                  <p className="text-xs text-muted-foreground">{f.description}</p>
                </div>
                <Switch
                  checked={settings?.[f.key] ?? false}
                  onCheckedChange={(v) => {
                    updateSetting.mutate({ key: f.key, value: v });
                    toast.success(`${f.label} ${v ? "enabled" : "disabled"}.`);
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Creator Account</h2>
        <div className="space-y-4 max-w-sm">
          <div>
            <Label>Update Email</Label>
            <div className="flex gap-2 mt-1">
              <Input type="email" value={emailForm.email} onChange={(e) => setEmailForm({ ...emailForm, email: e.target.value })} placeholder="New email" />
              <Button onClick={handleUpdateEmail} disabled={savingAuth || !emailForm.email}>Update</Button>
            </div>
          </div>
          <div>
            <Label>Update Password</Label>
            <div className="flex gap-2 mt-1">
              <Input type="password" value={emailForm.password} onChange={(e) => setEmailForm({ ...emailForm, password: e.target.value })} placeholder="New password" />
              <Button onClick={handleUpdatePassword} disabled={savingAuth || !emailForm.password}>Update</Button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
