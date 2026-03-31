import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  activeChildId: string | null;
  setActiveChildId: (id: string | null) => void;
  parentUnlocked: boolean;
  setParentUnlocked: (v: boolean) => void;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  signOut: async () => {},
  activeChildId: null,
  setActiveChildId: () => {},
  parentUnlocked: false,
  setParentUnlocked: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [parentUnlocked, setParentUnlocked] = useState(false);

  const [activeChildId, setActiveChildId] = useState<string | null>(() => {
    return localStorage.getItem("cyber_hero_active_child");
  });

  useEffect(() => {
    const checkKidRole = async (session: Session | null) => {
      if (session?.user) {
        // Check profiles table first
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("user_id", session.user.id)
          .maybeSingle();

        if (profile?.role === "kid") {
          handleSetActiveChildId(session.user.id);
        } else if (!profile) {
          // Fallback: check if they exist in child_profiles
          const { data: childProfile } = await supabase
            .from("child_profiles")
            .select("id")
            .eq("id", session.user.id)
            .maybeSingle();
          if (childProfile) {
            handleSetActiveChildId(session.user.id);
          }
        }
      }
      setSession(session);
      setLoading(false);
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      checkKidRole(session);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      checkKidRole(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSetActiveChildId = (id: string | null) => {
    setActiveChildId(id);
    if (id) {
      localStorage.setItem("cyber_hero_active_child", id);
    } else {
      localStorage.removeItem("cyber_hero_active_child");
    }
  };

  const signOut = async () => {
    handleSetActiveChildId(null);
    setParentUnlocked(false);
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        loading,
        signOut,
        activeChildId,
        setActiveChildId: handleSetActiveChildId,
        parentUnlocked,
        setParentUnlocked,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
