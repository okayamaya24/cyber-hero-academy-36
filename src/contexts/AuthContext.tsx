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
    let checkedUserId: string | null = null;

    // If the logged-in user is a kid, their child profile id is their user id
    const checkKidRole = async (userId: string) => {
      const { data: profile } = await supabase.from("profiles").select("role").eq("user_id", userId).maybeSingle();
      if (profile?.role === "kid") {
        handleSetActiveChildId(userId);
      } else if (!profile) {
        const { data: childProfile } = await supabase.from("child_profiles").select("id").eq("id", userId).maybeSingle();
        if (childProfile) handleSetActiveChildId(userId);
      }
    };

    // Publish the session right away so pages can start loading. Supabase warns
    // against awaiting other Supabase calls inside onAuthStateChange (it can stall
    // every request), so the kid check runs afterwards, once per user.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
      const userId = session?.user?.id ?? null;
      if (userId && userId !== checkedUserId) {
        checkedUserId = userId;
        setTimeout(() => checkKidRole(userId), 0);
      }
      if (!userId) checkedUserId = null;
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
