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
import ChallengesScreen from '@/features/challenges/ChallengesScreen';
import AchievementNotification from '@/components/nya/AchievementNotification';
import LoginModal from '@/features/landing/LoginModal';
import ErrorBoundary from '@/components/nya/ErrorBoundary';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
// Add page imports here

function RequireAuth({ children }) {
  const user = useAuthStore((s) => s.user);

  if (!user) {
    return <LoginModal isOpen={true} onClose={() => window.history.back()} onLogin={() => {}} />;
  }

  return <>{children}</>;
}

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center gap-4 bg-background">
        <div className="w-10 h-10 border-4 border-muted border-t-primary rounded-full animate-spin"></div>
        <p className="text-sm text-muted-foreground font-heading">Loading Nya Hub…</p>
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
        <ErrorBoundary>
        <Routes location={location}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/hub" element={<RequireAuth><HubScreen /></RequireAuth>} />
          <Route path="/profile" element={<RequireAuth><ProfileScreen /></RequireAuth>} />
          <Route path="/store" element={<RequireAuth><StoreScreen /></RequireAuth>} />
          <Route path="/rankings" element={<RequireAuth><RankingsScreen /></RequireAuth>} />
          <Route path="/friends" element={<RequireAuth><FriendsScreen /></RequireAuth>} />
          <Route path="/achievements" element={<RequireAuth><AchievementsScreen /></RequireAuth>} />
          <Route path="/challenges" element={<RequireAuth><ChallengesScreen /></RequireAuth>} />
          <Route path="/settings" element={<RequireAuth><SettingsScreen /></RequireAuth>} />
          <Route path="/game/:slug" element={<RequireAuth><GameWrapper /></RequireAuth>} />
          <Route path="*" element={<PageNotFound />} />
        </Routes>
        </ErrorBoundary>
      </div>
      <AchievementNotification />
    </>
  );
};


function App() {
  const applyTheme = useThemeStore((s) => s.applyTheme);

  useEffect(() => {
    applyTheme();
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      if (useThemeStore.getState().theme === 'system') applyTheme();
    };
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [applyTheme]);

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