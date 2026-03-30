import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import MaintenanceGate from "@/components/MaintenanceGate";
import { Navbar } from "@/components/Navbar";
import ProtectedAdminRoute from "@/components/ProtectedAdminRoute";

// Existing Cyber Hero pages
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

// Admin portal pages
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

// Dashboard portal pages
import MyKidsPage from "./pages/portal/MyKidsPage";
import KidProfilePage from "./pages/portal/KidProfilePage";
import AccountPage from "./pages/portal/AccountPage";
import ChangePasswordPage from "./pages/portal/ChangePasswordPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <MaintenanceGate>
            <Routes>
              {/* Public pages with Navbar */}
              <Route path="/" element={<><Navbar /><HomePage /></>} />
              <Route path="/signup" element={<><Navbar /><SignupPage /></>} />
              <Route path="/login" element={<><Navbar /><LoginPage /></>} />
              <Route path="/for-parents" element={<><Navbar /><ForParentsPage /></>} />

              {/* Existing Cyber Hero routes (with Navbar) */}
              <Route path="/select-child" element={<><Navbar /><ChildSelectPage /></>} />
              <Route path="/create-child" element={<><Navbar /><CreateChildPage /></>} />
              <Route path="/kid-dashboard" element={<><Navbar /><KidDashboard /></>} />
              <Route path="/missions" element={<><Navbar /><MissionsPage /></>} />
              <Route path="/world-map" element={<><Navbar /><WorldSelectScreen /></>} />
              <Route path="/world-map/:continentId" element={<><Navbar /><ContinentMapScreen /></>} />
              <Route path="/world-map/:continentId/:zoneId" element={<><Navbar /><ZoneGameScreen /></>} />
              <Route path="/edit-avatar" element={<><Navbar /><EditAvatarPage /></>} />
              <Route path="/parent-dashboard" element={<><Navbar /><ProtectedParentRoute><ParentDashboard /></ProtectedParentRoute></>} />
              <Route path="/certificate" element={<><Navbar /><CertificatePage /></>} />

              {/* Admin Portal (no Navbar - has own sidebar) */}
              {/* Creator account must be manually inserted into Supabase with role = 'creator'. No public signup flow for this role. */}
              <Route path="/admin-portal" element={<Navigate to="/admin-portal/games" replace />} />
              <Route path="/admin-portal/games" element={<ProtectedAdminRoute><AdminGamesPage /></ProtectedAdminRoute>} />
              <Route path="/admin-portal/events" element={<ProtectedAdminRoute><AdminEventsPage /></ProtectedAdminRoute>} />
              <Route path="/admin-portal/badges" element={<ProtectedAdminRoute><AdminBadgesPage /></ProtectedAdminRoute>} />
              <Route path="/admin-portal/categories" element={<ProtectedAdminRoute><AdminCategoriesPage /></ProtectedAdminRoute>} />
              <Route path="/admin-portal/levels" element={<ProtectedAdminRoute><AdminLevelManagerPage /></ProtectedAdminRoute>} />
              <Route path="/admin-portal/announcements" element={<ProtectedAdminRoute><AdminAnnouncementsPage /></ProtectedAdminRoute>} />
              <Route path="/admin-portal/emails" element={<ProtectedAdminRoute><AdminEmailCenterPage /></ProtectedAdminRoute>} />
              <Route path="/admin-portal/users" element={<ProtectedAdminRoute><AdminUsersPage /></ProtectedAdminRoute>} />
              <Route path="/admin-portal/analytics" element={<ProtectedAdminRoute><AdminAnalyticsPage /></ProtectedAdminRoute>} />
              <Route path="/admin-portal/settings" element={<ProtectedAdminRoute><AdminSettingsPage /></ProtectedAdminRoute>} />

              {/* Dashboard Portal (no Navbar - has own sidebar) — family & school roles */}
              <Route path="/dashboard" element={<MyKidsPage />} />
              <Route path="/dashboard/kids/:id" element={<KidProfilePage />} />
              <Route path="/dashboard/account" element={<AccountPage />} />
              <Route path="/dashboard/password" element={<ChangePasswordPage />} />

              {/* Legacy portal routes redirect to new dashboard paths */}
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
