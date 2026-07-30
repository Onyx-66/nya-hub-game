import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import { useState, useEffect } from 'react';
import LandingPage from '@/features/landing/LandingPage';
import HubScreen from '@/features/hub/HubScreen';
import ProfileScreen from '@/features/auth/ProfileScreen';
import StoreScreen from '@/features/store/components/StoreScreen';
import RankingsScreen from '@/features/rankings/components/RankingScreen';
import GameWrapper from '@/games/GameWrapper';
import SettingsScreen from '@/features/settings/components/SettingsScreen';
import FriendsScreen from '@/features/friends/FriendsScreen';
import AchievementsScreen from '@/features/achievements/AchievementsScreen';
import AchievementNotification from '@/components/nya/AchievementNotification';
import LoginModal from '@/features/landing/LoginModal';
import { useAuthStore } from '@/store/authStore';
// Add page imports here

function RequireAuth({ children }) {
  const user = useAuthStore((s) => s.user);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    if (!user) setShowLogin(true);
  }, [user]);

  if (!user) {
    return <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} onLogin={() => setShowLogin(false)} />;
  }

  return <>{children}</>;
}

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  return (
    <>
      <div key={location.pathname} className="animate-page-enter">
        <Routes location={location}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/hub" element={<RequireAuth><HubScreen /></RequireAuth>} />
          <Route path="/profile" element={<RequireAuth><ProfileScreen /></RequireAuth>} />
          <Route path="/store" element={<RequireAuth><StoreScreen /></RequireAuth>} />
          <Route path="/rankings" element={<RequireAuth><RankingsScreen /></RequireAuth>} />
          <Route path="/friends" element={<RequireAuth><FriendsScreen /></RequireAuth>} />
          <Route path="/achievements" element={<RequireAuth><AchievementsScreen /></RequireAuth>} />
          <Route path="/settings" element={<RequireAuth><SettingsScreen /></RequireAuth>} />
          <Route path="/game/:slug" element={<RequireAuth><GameWrapper /></RequireAuth>} />
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </div>
      <AchievementNotification />
    </>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App