import { Link, useLocation } from 'react-router-dom';
import { LogIn, LogOut, LayoutDashboard, Sparkles, Menu, X, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import UserAvatar from './UserAvatar';
import { isAuth0Configured } from '@/auth/auth0-config';
import { useOptionalAuth0 } from '@/auth/useOptionalAuth0';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import InstallInstructionsDialog from './InstallInstructionsDialog';
import { useState } from 'react';

/**
 * Persistent top navigation bar with auth-aware actions.
 * Shows Sign In for guests, user menu for authenticated users.
 */
const AuthNavbar = () => {
  const auth0Available = isAuth0Configured();
  const { isAuthenticated, user, loginWithRedirect, logout, isLoading } = useOptionalAuth0();

  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const {
    canInstall,
    promptInstall,
    platform,
    showInstructions,
    setShowInstructions,
  } = usePWAInstall();

  const handleLogin = () => {
    if (auth0Available) {
      loginWithRedirect();
    }
  };

  const handleLogout = () => {
    if (auth0Available) {
      logout({ logoutParams: { returnTo: window.location.origin + import.meta.env.BASE_URL } });
    }
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 glass-morphism rounded-none border-x-0 border-t-0"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 group"
            id="nav-logo"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-heading font-bold text-lg hidden sm:block">
              Cosmic <span className="gold-text-static">Blueprint</span>
            </span>
          </Link>

          {/* Desktop actions */}
          <div className="hidden sm:flex items-center gap-3">
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full loading-spinner" />
            ) : isAuthenticated && user ? (
              <>
                <Link to="/dashboard">
                  <Button
                    variant="ghost"
                    className={`text-sm font-medium transition-colors ${
                      location.pathname === '/dashboard'
                        ? 'text-amber-400 bg-amber-500/10'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                    id="nav-dashboard"
                  >
                    <LayoutDashboard className="w-4 h-4 mr-1.5" />
                    Dashboard
                  </Button>
                </Link>

                <div className="w-px h-6 bg-white/10" />

                <div className="flex items-center gap-2.5">
                  <UserAvatar picture={user.picture} name={user.name} size="sm" />
                  <span className="text-sm text-gray-300 max-w-[120px] truncate">
                    {user.name || user.email}
                  </span>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-gray-400 hover:text-white hover:bg-white/5"
                  id="nav-logout"
                  aria-label="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            ) : auth0Available ? (
              <Button
                onClick={handleLogin}
                className="cosmic-button px-5 py-2 text-sm"
                id="nav-signin"
              >
                <LogIn className="w-4 h-4 mr-1.5" />
                Sign In
              </Button>
            ) : null}

            {/* Install button — always visible */}
            {canInstall && (
              <Button
                variant="ghost"
                size="sm"
                onClick={promptInstall}
                className="text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 border border-amber-500/30"
                id="nav-install"
                aria-label="Install app"
              >
                <Download className="w-4 h-4 mr-1.5" />
                Install
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="sm:hidden p-2 text-gray-400 hover:text-white transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden pb-4 border-t border-white/5 pt-3 space-y-2 animate-fade-in">
            {isAuthenticated && user ? (
              <>
                <div className="flex items-center gap-3 px-2 py-2">
                  <UserAvatar picture={user.picture} name={user.name} size="sm" />
                  <span className="text-sm text-gray-300 truncate">
                    {user.name || user.email}
                  </span>
                </div>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-2 py-2.5 text-sm text-gray-300 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <button
                  onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                  className="flex items-center gap-2 px-2 py-2.5 text-sm text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors w-full"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </>
            ) : auth0Available ? (
              <button
                onClick={() => { handleLogin(); setMobileMenuOpen(false); }}
                className="cosmic-button w-full py-2.5 text-sm flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </button>
            ) : null}

            {/* Install button — always visible in mobile menu */}
            {canInstall && (
              <button
                onClick={() => { promptInstall(); setMobileMenuOpen(false); }}
                className="flex items-center gap-2 px-2 py-2.5 text-sm text-amber-400 hover:text-amber-300 rounded-lg hover:bg-amber-500/10 border border-amber-500/30 transition-colors w-full"
              >
                <Download className="w-4 h-4" />
                Install App
              </button>
            )}
          </div>
        )}
      </div>

      <InstallInstructionsDialog
        open={showInstructions}
        onOpenChange={setShowInstructions}
        platform={platform}
      />
    </nav>
  );
};

export default AuthNavbar;
