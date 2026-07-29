import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import HubScreen from '@/features/hub/HubScreen';
import ProfileScreen from '@/features/auth/ProfileScreen';
import StoreScreen from '@/features/store/components/StoreScreen';
import RankingsScreen from '@/features/rankings/components/RankingScreen';
import GameWrapper from '@/games/GameWrapper';
import SettingsScreen from '@/features/settings/components/SettingsScreen';
// Add page imports here

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
    <div key={location.pathname} className="animate-page-enter">
      <Routes location={location}>
        <Route path="/" element={<HubScreen />} />
        <Route path="/profile" element={<ProfileScreen />} />
        <Route path="/store" element={<StoreScreen />} />
        <Route path="/rankings" element={<RankingsScreen />} />
        <Route path="/settings" element={<SettingsScreen />} />
        <Route path="/game/:slug" element={<GameWrapper />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </div>
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