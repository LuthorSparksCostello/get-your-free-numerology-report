import { useOptionalAuth0 } from '@/auth/useOptionalAuth0';
import { isAuth0Configured } from '@/auth/auth0-config';
import LoginPage from '@/pages/LoginPage';
import { Sparkles } from 'lucide-react';

/**
 * Global authentication gate.
 * ALL app content is hidden behind this — if the user is not
 * authenticated, they see the LoginPage instead of the app.
 */
const AuthGate = ({ children }: { children: React.ReactNode }) => {
  const auth0Available = isAuth0Configured();
  const { isAuthenticated, isLoading } = useOptionalAuth0();

  // Auth0 not configured — show login page with setup warning
  if (!auth0Available) {
    return <LoginPage />;
  }

  // Loading state — show branded spinner
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a14]">
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400/20 to-orange-500/20 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-amber-400 loading-spinner" />
          </div>
          <p className="text-gray-500 text-sm">Loading your cosmic portal...</p>
        </div>
      </div>
    );
  }

  // Not authenticated — show login page
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Authenticated — render the app
  return <>{children}</>;
};

export default AuthGate;
