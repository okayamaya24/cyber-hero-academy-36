import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Gamepad2,
  CalendarDays,
  Award,
  FolderOpen,
  Users,
  BarChart3,
  Settings,
  Shield,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const sections = [
  {
    title: "CMS",
    items: [
      { label: "Games", to: "/admin-portal/games", icon: Gamepad2 },
      { label: "Special Events", to: "/admin-portal/events", icon: CalendarDays },
      { label: "Badges", to: "/admin-portal/badges", icon: Award },
      { label: "Categories", to: "/admin-portal/categories", icon: FolderOpen },
    ],
  },
  {
    title: "Platform",
    items: [
      { label: "Users", to: "/admin-portal/users", icon: Users },
      { label: "Analytics", to: "/admin-portal/analytics", icon: BarChart3 },
      { label: "Settings", to: "/admin-portal/settings", icon: Settings },
    ],
  },
];

export function AdminSidebar() {
  const location = useLocation();
  const { signOut } = useAuth();

  return (
    <aside className="flex w-[220px] flex-col border-r border-border bg-card">
      <div className="flex h-16 items-center gap-2 border-b border-border px-5">
        <Shield className="h-6 w-6 text-primary" />
        <span className="text-lg font-bold text-foreground">Admin</span>
      </div>

      <nav className="flex-1 space-y-6 px-3 py-4">
        {sections.map((section) => (
          <div key={section.title}>
            <p className="mb-1 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {section.title}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active = location.pathname === item.to;
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
          </div>
        ))}
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
