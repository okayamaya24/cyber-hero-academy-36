import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Users, UserCircle, KeyRound, LogOut, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAccountType } from "@/hooks/useAccountType";

export function DashboardSidebar() {
  const location = useLocation();
  const { signOut } = useAuth();
  const { terms } = useAccountType();

  const items = [
    { label: terms.kidsLabel, to: "/dashboard", icon: Users },
    { label: "Account", to: "/dashboard/account", icon: UserCircle },
    { label: "Change Password", to: "/dashboard/password", icon: KeyRound },
  ];

  return (
    <aside className="flex w-[220px] flex-col border-r border-border bg-card">
      <div className="flex h-16 items-center gap-2 border-b border-border px-5">
        <Shield className="h-6 w-6 text-primary" />
        <span className="text-lg font-bold text-foreground truncate">{terms.portalTitle}</span>
      </div>

      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-0.5">
          {items.map((item) => {
            const active = item.to === "/dashboard"
              ? location.pathname === "/dashboard"
              : location.pathname.startsWith(item.to);
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-border p-3">
        <button
          onClick={signOut}
          className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
