// Register continent configs with the adventure engine
import "@/engine/configs/northAmerica";

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
import WorldSelectScreen from "./pages/WorldSelectScreen";
import ContinentMapScreen from "./pages/ContinentMapScreen";
import ZoneGameScreen from "./pages/ZoneGameScreen";
import EditAvatarPage from "./pages/EditAvatarPage";
import ProtectedParentRoute from "./components/ProtectedParentRoute";
import NotFound from "./pages/NotFound";
import TermsPage from "./pages/TermsPage";
import PrivacyPage from "./pages/PrivacyPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
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

// Training Center Games
import VirusVaporizer from "./pages/games/VirusVaporizer";
import SpotThePhish from "./pages/games/SpotThePhish";
import FirewallBlitz from "./pages/games/FirewallBlitz";
import HackerChase from "./pages/games/HackerChase";
import TypeToDefend from "./pages/games/TypeToDefend";
import PasswordCrackerRace from "./pages/games/PasswordCrackerRace";
import CodeTyper from "./pages/games/CodeTyper";
import DecryptTheMessage from "./pages/games/DecryptTheMessage";
import FirewallTyper from "./pages/games/FirewallTyper";
import CyberEscapeRoom from "./pages/games/CyberEscapeRoom";
import CodeBreaker from "./pages/games/CodeBreaker";
import PasswordTower from "./pages/games/PasswordTower";
import LockTheVault from "./pages/games/LockTheVault";
import SafeOrDangerSort from "./pages/games/SafeOrDangerSort";
import RealOrFakeWebsite from "./pages/games/RealOrFakeWebsite";
import TrustOrTrash from "./pages/games/TrustOrTrash";
import BytesQuizBlitz from "./pages/games/BytesQuizBlitz";
import TrueOrFalseLightning from "./pages/games/TrueOrFalseLightning";
import BeatTheClockTrivia from "./pages/games/BeatTheClockTrivia";
import CyberMemoryMatch from "./pages/games/CyberMemoryMatch";
import SequenceShield from "./pages/games/SequenceShield";
import PasswordHunt from "./pages/games/PasswordHunt";
import PhishingDetective from "./pages/games/PhishingDetective";
import PrivacyPatrol from "./pages/games/PrivacyPatrol";
import CyberBasics from "./pages/games/CyberBasics";
import StaySafeOnline from "./pages/games/StaySafeOnline";
import BuildAStrongPassword from "./pages/games/BuildAStrongPassword";
import SafeOrScamSorter from "./pages/games/SafeOrScamSorter";
import LockTheVaultDrag from "./pages/games/LockTheVaultDrag";
import SpotTheScam from "./pages/games/SpotTheScam";
import PasswordPower from "./pages/games/PasswordPower";
import SafeSitesExplorer from "./pages/games/SafeSitesExplorer";
import SecretKeeper from "./pages/games/SecretKeeper";
import MalwareMonsters from "./pages/games/MalwareMonsters";
import PhishyMessages from "./pages/games/PhishyMessages";
import SmartSharing from "./pages/games/SmartSharing";
import DeviceDefender from "./pages/games/DeviceDefender";
import CyberClues from "./pages/games/CyberClues";
import InternetDetective from "./pages/games/InternetDetective";

const queryClient = new QueryClient();

function DashboardRouter() {
  const { user, loading: authLoading, setActiveChildId } = useAuth();
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

  if (authLoading)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );

  if (!user) return <Navigate to="/login" replace />;

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
                path="/world-map"
                element={
                  <>
                    <Navbar />
                    <WorldSelectScreen />
                  </>
                }
              />
              <Route
                path="/world-map/:continentId"
                element={
                  <>
                    <Navbar />
                    <ContinentMapScreen />
                  </>
                }
              />
              <Route
                path="/world-map/:continentId/:zoneId"
                element={
                  <>
                    <Navbar />
                    <ZoneGameScreen />
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
              {/* Training Center Games */}
              <Route path="/games/virus-vaporizer" element={<VirusVaporizer />} />
              <Route path="/games/spot-the-phish" element={<SpotThePhish />} />
              <Route path="/games/firewall-blitz" element={<FirewallBlitz />} />
              <Route path="/games/hacker-chase" element={<HackerChase />} />
              <Route path="/games/type-to-defend" element={<TypeToDefend />} />
              <Route path="/games/password-cracker-race" element={<PasswordCrackerRace />} />
              <Route path="/games/code-typer" element={<CodeTyper />} />
              <Route path="/games/decrypt-the-message" element={<DecryptTheMessage />} />
              <Route path="/games/firewall-typer" element={<FirewallTyper />} />
              <Route path="/games/cyber-escape-room" element={<CyberEscapeRoom />} />
              <Route path="/games/code-breaker" element={<CodeBreaker />} />
              <Route path="/games/password-tower" element={<PasswordTower />} />
              <Route path="/games/lock-the-vault" element={<LockTheVault />} />
              <Route path="/games/safe-or-danger-sort" element={<SafeOrDangerSort />} />
              <Route path="/games/real-or-fake-website" element={<RealOrFakeWebsite />} />
              <Route path="/games/trust-or-trash" element={<TrustOrTrash />} />
              <Route path="/games/bytes-quiz-blitz" element={<BytesQuizBlitz />} />
              <Route path="/games/true-or-false-lightning" element={<TrueOrFalseLightning />} />
              <Route path="/games/beat-the-clock-trivia" element={<BeatTheClockTrivia />} />
              <Route path="/games/cyber-memory-match" element={<CyberMemoryMatch />} />
              <Route path="/games/sequence-shield" element={<SequenceShield />} />
              <Route path="/games/password-hunt" element={<PasswordHunt />} />
              <Route path="/games/phishing-detective" element={<PhishingDetective />} />
              <Route path="/games/privacy-patrol" element={<PrivacyPatrol />} />
              <Route path="/games/cyber-basics" element={<CyberBasics />} />
              <Route path="/games/stay-safe-online" element={<StaySafeOnline />} />
              <Route path="/games/build-a-strong-password" element={<BuildAStrongPassword />} />
              <Route path="/games/safe-or-scam-sorter" element={<SafeOrScamSorter />} />
              <Route path="/games/lock-the-vault-drag" element={<LockTheVaultDrag />} />
              <Route path="/games/spot-the-scam" element={<SpotTheScam />} />
              <Route path="/games/password-power" element={<PasswordPower />} />
              <Route path="/games/safe-sites-explorer" element={<SafeSitesExplorer />} />
              <Route path="/games/secret-keeper" element={<SecretKeeper />} />
              <Route path="/games/malware-monsters" element={<MalwareMonsters />} />
              <Route path="/games/phishy-messages" element={<PhishyMessages />} />
              <Route path="/games/smart-sharing" element={<SmartSharing />} />
              <Route path="/games/device-defender" element={<DeviceDefender />} />
              <Route path="/games/cyber-clues" element={<CyberClues />} />
              <Route path="/games/internet-detective" element={<InternetDetective />} />

              <Route path="/forgot-password" element={<><Navbar /><ForgotPasswordPage /></>} />
              <Route path="/terms" element={<><Navbar /><TermsPage /></>} />
              <Route path="/privacy" element={<><Navbar /><PrivacyPage /></>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </MaintenanceGate>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
