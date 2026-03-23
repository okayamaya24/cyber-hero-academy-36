import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/select-child" element={<ChildSelectPage />} />
            <Route path="/create-child" element={<CreateChildPage />} />
            <Route path="/dashboard" element={<KidDashboard />} />
            <Route path="/missions" element={<MissionsPage />} />
            <Route path="/world-map" element={<WorldSelectScreen />} />
            <Route path="/world-map/:continentId" element={<ContinentMapScreen />} />
            <Route path="/world-map/:continentId/:zoneId" element={<ZoneGameScreen />} />
            <Route path="/edit-avatar" element={<EditAvatarPage />} />
            <Route path="/for-parents" element={<ForParentsPage />} />
            <Route path="/parent-dashboard" element={<ProtectedParentRoute><ParentDashboard /></ProtectedParentRoute>} />
            <Route path="/certificate" element={<CertificatePage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
