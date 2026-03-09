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
  justLoggedIn: boolean;
  setJustLoggedIn: (v: boolean) => void;
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
  justLoggedIn: false,
  setJustLoggedIn: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [parentUnlocked, setParentUnlocked] = useState(false);
  const [justLoggedIn, setJustLoggedIn] = useState(false);
  const [activeChildId, setActiveChildId] = useState<string | null>(() => {
    return localStorage.getItem("cyber_hero_active_child");
  });

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSetActiveChildId = (id: string | null) => {
    setActiveChildId(id);
    if (id) localStorage.setItem("cyber_hero_active_child", id);
    else localStorage.removeItem("cyber_hero_active_child");
  };

  const signOut = async () => {
    handleSetActiveChildId(null);
    setParentUnlocked(false);
    setJustLoggedIn(false);
    await supabase.auth.signOut();
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
        justLoggedIn,
        setJustLoggedIn,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
