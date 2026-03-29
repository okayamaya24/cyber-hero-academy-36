import { ReactNode } from "react";
import { usePlatformSettings } from "@/hooks/usePlatformSettings";
import { useProfile } from "@/hooks/useProfile";
import { Shield, Wrench } from "lucide-react";

export default function MaintenanceGate({ children }: { children: ReactNode }) {
  const { data: settings } = usePlatformSettings();
  const { data: profile } = useProfile();

  if (settings?.maintenance_mode && profile?.role !== "creator") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <Wrench className="h-10 w-10 text-muted-foreground" />
        </div>
        <h1 className="text-3xl font-bold text-foreground">Down for Maintenance</h1>
        <p className="max-w-md text-muted-foreground">
          We're making some improvements. Please check back soon!
        </p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Shield className="h-3.5 w-3.5" />
          <span>Cyber Hero Academy</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
