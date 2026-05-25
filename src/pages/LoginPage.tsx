import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Shield, Save, Calendar, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CosmicBackground from '@/components/CosmicBackground';
import { isAuth0Configured } from '@/auth/auth0-config';
import { useOptionalAuth0 } from '@/auth/useOptionalAuth0';
import { useEffect } from 'react';

const LoginPage = () => {
  const auth0Available = isAuth0Configured();
  const { loginWithRedirect, isAuthenticated } = useOptionalAuth0();

  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = (connection?: string) => {
    if (!auth0Available) return;
    loginWithRedirect(
      connection
        ? { authorizationParams: { connection } }
        : undefined
    );
  };

  const benefits = [
    { icon: <Save className="w-5 h-5" />, label: 'Save unlimited reports' },
    { icon: <Calendar className="w-5 h-5" />, label: 'Track your personal cycles' },
    { icon: <Shield className="w-5 h-5" />, label: 'Secure & private' },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4">
      <CosmicBackground />

      <div className="floating-orb w-32 h-32 bg-amber-500/15 top-20 -left-10" aria-hidden="true" />
      <div className="floating-orb w-24 h-24 bg-purple-500/15 bottom-20 right-10" aria-hidden="true" />

      <div className="relative z-10 w-full max-w-md">
        {/* Back link */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-amber-400 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Continue as Guest
        </Link>

        <div className="glass-morphism-elevated p-8 sm:p-10 text-center">
          {/* Header */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 mb-6 pulse-glow">
            <Sparkles className="w-8 h-8 text-white" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-white font-heading mb-2">
            Sign In to Your{' '}
            <span className="gold-text">Cosmic Portal</span>
          </h1>
          <p className="text-gray-400 text-sm mb-8">
            Save your reports, track personal cycles, and access your dashboard
          </p>

          {/* SSO Buttons */}
          <div className="space-y-3 mb-8">
            <button
              onClick={() => handleLogin('google-oauth2')}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-white/[0.05] border border-white/10 hover:bg-white/[0.08] hover:border-white/20 transition-all duration-300 text-white text-sm font-medium"
              id="login-google"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Sign in with Google
            </button>

            <button
              onClick={() => handleLogin('apple')}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-white/[0.05] border border-white/10 hover:bg-white/[0.08] hover:border-white/20 transition-all duration-300 text-white text-sm font-medium"
              id="login-apple"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
              Sign in with Apple
            </button>

            <button
              onClick={() => handleLogin('windowslive')}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-white/[0.05] border border-white/10 hover:bg-white/[0.08] hover:border-white/20 transition-all duration-300 text-white text-sm font-medium"
              id="login-microsoft"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#F25022" d="M1 1h10v10H1z" />
                <path fill="#00A4EF" d="M1 13h10v10H1z" />
                <path fill="#7FBA00" d="M13 1h10v10H13z" />
                <path fill="#FFB900" d="M13 13h10v10H13z" />
              </svg>
              Sign in with Microsoft
            </button>
          </div>

          {/* Divider */}
          <div className="section-divider mb-6" />

          {/* Benefits */}
          <div className="space-y-3">
            {benefits.map((b, i) => (
              <div
                key={i}
                className="flex items-center gap-3 text-left text-sm text-gray-400"
              >
                <div className="text-amber-400/60">{b.icon}</div>
                {b.label}
              </div>
            ))}
          </div>

          <p className="mt-6 text-xs text-gray-600">
            🔒 We never access or share your personal data
          </p>
        </div>

        {!auth0Available && (
          <div className="mt-6 p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs text-center">
            ⚠️ Auth0 is not configured. Add your credentials to <code className="bg-white/5 px-1 rounded">.env</code> to enable authentication.
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
