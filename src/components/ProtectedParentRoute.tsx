import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import ParentPinModal from "@/components/ParentPinModal";

interface ProtectedParentRouteProps {
  children: React.ReactNode;
}

export default function ProtectedParentRoute({ children }: ProtectedParentRouteProps) {
  const { user, loading, parentUnlocked, setParentUnlocked } = useAuth();
  const [pinError, setPinError] = useState<string | null>(null);
  const [pinLoading, setPinLoading] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (parentUnlocked) {
    return <>{children}</>;
  }

  const handlePinUnlock = async (pin: string) => {
    setPinLoading(true);
    setPinError(null);

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("parent_pin")
      .eq("user_id", user.id)
      .single();

    setPinLoading(false);

    if (error || !profile) {
      setPinError("Could not verify PIN. Please try again.");
      return;
    }

    if ((profile as any).parent_pin === pin) {
      setParentUnlocked(true);
    } else {
      setPinError("Incorrect PIN. Please try again.");
    }
  };

  return (
    <ParentPinModal
      open={true}
      onBack={() => window.history.back()}
      onUnlock={handlePinUnlock}
      error={pinError}
      loading={pinLoading}
    />
  );
}
