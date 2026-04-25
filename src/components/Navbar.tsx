import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Gamepad2, BarChart3, Home, LogIn, UserPlus, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";

const publicItems = [
  { label: "Home", to: "/", icon: Home },
];

const kidItems = [
  { label: "Dashboard", to: "/dashboard", icon: Gamepad2 },
  { label: "Missions", to: "/missions", icon: Shield },
];

const parentItems = [
  { label: "Dashboard", to: "/dashboard", icon: Gamepad2 },
  { label: "Missions", to: "/missions", icon: Shield },
  { label: "Parents", to: "/parent-dashboard", icon: BarChart3 },
];

export function Navbar() {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { data: profile } = useProfile();

  const isKid = profile?.role === "kid";
  const isParent = profile?.role === "family" || profile?.role === "school";

  let navItems = publicItems;
  if (user && isKid) navItems = kidItems;
  else if (user && isParent) navItems = parentItems;
  else if (user) navItems = parentItems; // fallback for unknown roles

  return (
    <nav className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2">
          <Shield className="h-8 w-8 text-primary" />
          <span className="text-xl font-display font-bold text-foreground">Cyber Hero Academy</span>
        </Link>

        <div className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute inset-0 rounded-lg bg-primary/10"
                    transition={{ type: "spring", duration: 0.5 }}
                  />
                )}
              </Link>
            );
          })}

          {user ? (
            <button
              onClick={signOut}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          ) : (
            <>
              <Link
                to="/login"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">Log In</span>
              </Link>
              <Link
                to="/signup"
                className="flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <UserPlus className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Up</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
