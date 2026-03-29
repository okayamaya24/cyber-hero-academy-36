import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/portal/DashboardLayout";
import { useProfile } from "@/hooks/useProfile";
import { useAccountType } from "@/hooks/useAccountType";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function AccountPage() {
  const queryClient = useQueryClient();
  const { data: profile, isLoading } = useProfile();
  const { terms } = useAccountType();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  // Initialize form from profile
  if (profile && !dirty && name === "" && email === "") {
    setName(profile.display_name ?? "");
    setEmail(profile.email ?? "");
  }

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ display_name: name.trim(), email: email.trim() } as any).eq("id", profile.id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    queryClient.invalidateQueries({ queryKey: ["profile"] });
    setDirty(false);
    toast.success("Account updated!");
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-foreground mb-6">Account</h1>
      {isLoading ? (
        <Skeleton className="h-60 w-full max-w-md rounded-xl" />
      ) : (
        <div className="rounded-xl border border-border bg-card p-6 max-w-md space-y-5">
          <div>
            <Label>Full Name</Label>
            <Input value={name} onChange={(e) => { setName(e.target.value); setDirty(true); }} />
          </div>
          <div>
            <Label>Email</Label>
            <Input value={email} onChange={(e) => { setEmail(e.target.value); setDirty(true); }} />
          </div>
          <div>
            <Label>Account Type</Label>
            <Input value={profile?.account_type === "school" ? "School" : "Family"} readOnly className="bg-muted" />
          </div>
          <div>
            <Label>Member Since</Label>
            <Input value={profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : ""} readOnly className="bg-muted" />
          </div>
          <div>
            <Label>Plan</Label>
            <Input value={profile?.plan ?? "free"} readOnly className="bg-muted capitalize" />
          </div>
          {dirty && (
            <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
