
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import MaintenanceGate from "@/components/MaintenanceGate";
import { Navbar } from "@/components/Navbar";
import ProtectedAdminRoute from "@/components/ProtectedAdminRoute";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import HomePage from "./pages/HomePage";
import KidDashboard from "./pages/KidDashboard";
import MissionsPage from "./pages/MissionsPage";
import ParentDashboard from "./pages/ParentDashboard";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import ChildSelectPage from "./pages/ChildSelectPage";
import CreateChildPage from "./pages/CreateChildPage";
import CertificatePage from "./pages/CertificatePage";
import ForParentsPage from "./pages/ForParentsPage";
import EditAvatarPage from "./pages/EditAvatarPage";
import AdventureMapPage from "./pages/AdventureMapPage";
import WorldZonesPage from "./pages/WorldZonesPage";
import ZoneExperiencePage from "./pages/ZoneExperiencePage";
import ProtectedParentRoute from "./components/ProtectedParentRoute";
import NotFound from "./pages/NotFound";
import AdminGamesPage from "./pages/admin/AdminGamesPage";
import AdminEventsPage from "./pages/admin/AdminEventsPage";
import AdminBadgesPage from "./pages/admin/AdminBadgesPage";
import AdminCategoriesPage from "./pages/admin/AdminCategoriesPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminAnalyticsPage from "./pages/admin/AdminAnalyticsPage";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage";
import AdminLevelManagerPage from "./pages/admin/AdminLevelManagerPage";
import AdminAnnouncementsPage from "./pages/admin/AdminAnnouncementsPage";
import AdminEmailCenterPage from "./pages/admin/AdminEmailCenterPage";
import MyKidsPage from "./pages/portal/MyKidsPage";
import KidProfilePage from "./pages/portal/KidProfilePage";
import AccountPage from "./pages/portal/AccountPage";
import ChangePasswordPage from "./pages/portal/ChangePasswordPage";

const queryClient = new QueryClient();

function DashboardRouter() {
  const { user, setActiveChildId } = useAuth();
  const [role, setRole] = useState<string | null>(null);
  const [hasAvatar, setHasAvatar] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!user) return;

    const timeout = setTimeout(() => {
      setRole((prev) => prev ?? "kid");
      setHasAvatar((prev) => prev ?? true);
      setActiveChildId(user.id);
      setChecking(false);
    }, 5000);

    const checkRole = async () => {
      try {
        const { data: profile } = await supabase.from("profiles").select("role").eq("user_id", user.id).maybeSingle();

        if (profile?.role === "creator") {
          setRole("creator");
          setHasAvatar(true);
        } else if (profile?.role === "family" || profile?.role === "school") {
          setRole(profile.role);
          setHasAvatar(true);
        } else {
          // role is kid or no profile — check child_profiles
          const { data: childProfile } = await supabase
            .from("child_profiles")
            .select("id, avatar_config")
            .eq("id", user.id)
            .maybeSingle();

          if (childProfile || profile?.role === "kid") {
            setRole("kid");
            setActiveChildId(user.id);
            const avatarConfig = childProfile?.avatar_config as Record<string, any> | null;
            const avatarKeys = avatarConfig && typeof avatarConfig === "object" ? Object.keys(avatarConfig) : [];
            const hasValidAvatar =
              avatarKeys.length > 0 && avatarKeys.some((k) => ["gender", "suitKey", "heroName", "heroSrc"].includes(k));
            setHasAvatar(hasValidAvatar);
          } else {
            setRole("family");
            setHasAvatar(true);
          }
        }
      } catch {
        setRole("family");
        setHasAvatar(true);
      }
      clearTimeout(timeout);
      setChecking(false);
    };

    checkRole();
    return () => clearTimeout(timeout);
  }, [user]);

  if (checking)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );

  if (role === "creator") return <Navigate to="/admin-portal/games" replace />;

  if (role === "kid") {
    if (!hasAvatar) return <Navigate to="/create-child" replace />;
    return (
      <>
        <Navbar />
        <KidDashboard />
      </>
    );
  }

  return <MyKidsPage />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <MaintenanceGate>
            <Routes>
              <Route
                path="/"
                element={
                  <>
                    <Navbar />
                    <HomePage />
                  </>
                }
              />
              <Route
                path="/signup"
                element={
                  <>
                    <Navbar />
                    <SignupPage />
                  </>
                }
              />
              <Route
                path="/login"
                element={
                  <>
                    <Navbar />
                    <LoginPage />
                  </>
                }
              />
              <Route
                path="/for-parents"
                element={
                  <>
                    <Navbar />
                    <ForParentsPage />
                  </>
                }
              />
              <Route path="/select-child" element={<Navigate to="/dashboard" replace />} />
              <Route
                path="/create-child"
                element={
                  <>
                    <Navbar />
                    <CreateChildPage />
                  </>
                }
              />
              <Route
                path="/kid-dashboard"
                element={
                  <>
                    <Navbar />
                    <KidDashboard />
                  </>
                }
              />
              <Route
                path="/missions"
                element={
                  <>
                    <Navbar />
                    <MissionsPage />
                  </>
                }
              />
              <Route
                path="/edit-avatar"
                element={
                  <>
                    <Navbar />
                    <EditAvatarPage />
                  </>
                }
              />
              <Route
                path="/adventure"
                element={
                  <>
                    <Navbar />
                    <AdventureMapPage />
                  </>
                }
              />
              <Route
                path="/adventure/:worldId"
                element={
                  <>
                    <Navbar />
                    <WorldZonesPage />
                  </>
                }
              />
              <Route
                path="/adventure/:worldId/:zoneId"
                element={
                  <>
                    <Navbar />
                    <ZoneExperiencePage />
                  </>
                }
              />
              <Route
                path="/parent-dashboard"
                element={
                  <>
                    <Navbar />
                    <ProtectedParentRoute>
                      <ParentDashboard />
                    </ProtectedParentRoute>
                  </>
                }
              />
              <Route
                path="/certificate"
                element={
                  <>
                    <Navbar />
                    <CertificatePage />
                  </>
                }
              />

              <Route path="/admin-portal" element={<Navigate to="/admin-portal/games" replace />} />
              <Route
                path="/admin-portal/games"
                element={
                  <ProtectedAdminRoute>
                    <AdminGamesPage />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/admin-portal/events"
                element={
                  <ProtectedAdminRoute>
                    <AdminEventsPage />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/admin-portal/badges"
                element={
                  <ProtectedAdminRoute>
                    <AdminBadgesPage />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/admin-portal/categories"
                element={
                  <ProtectedAdminRoute>
                    <AdminCategoriesPage />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/admin-portal/levels"
                element={
                  <ProtectedAdminRoute>
                    <AdminLevelManagerPage />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/admin-portal/announcements"
                element={
                  <ProtectedAdminRoute>
                    <AdminAnnouncementsPage />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/admin-portal/emails"
                element={
                  <ProtectedAdminRoute>
                    <AdminEmailCenterPage />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/admin-portal/users"
                element={
                  <ProtectedAdminRoute>
                    <AdminUsersPage />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/admin-portal/analytics"
                element={
                  <ProtectedAdminRoute>
                    <AdminAnalyticsPage />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/admin-portal/settings"
                element={
                  <ProtectedAdminRoute>
                    <AdminSettingsPage />
                  </ProtectedAdminRoute>
                }
              />

              <Route path="/dashboard" element={<DashboardRouter />} />
              <Route path="/dashboard/kids/:id" element={<KidProfilePage />} />
              <Route path="/dashboard/account" element={<AccountPage />} />
              <Route path="/dashboard/password" element={<ChangePasswordPage />} />
              <Route path="/portal" element={<Navigate to="/dashboard" replace />} />
              <Route path="/portal/*" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </MaintenanceGate>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
