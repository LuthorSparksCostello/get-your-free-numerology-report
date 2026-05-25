import { useState } from 'react';
import { Sparkles, Shield, Save, Calendar, ArrowRight, Mail, Lock, Eye, EyeOff, User } from 'lucide-react';
import CosmicBackground from '@/components/CosmicBackground';
import { useOptionalAuth0 } from '@/auth/useOptionalAuth0';
import { isAuth0Configured } from '@/auth/auth0-config';

type AuthMode = 'login' | 'signup';

const LoginPage = () => {
  const auth0Available = isAuth0Configured();
  const { loginWithRedirect } = useOptionalAuth0();

  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  /** SSO login — redirects to Auth0's Universal Login with a specific social connection */
  const handleSSO = (connection: string) => {
    if (!auth0Available) return;
    loginWithRedirect({
      authorizationParams: { connection },
    });
  };

  /** Email/password — opens Auth0 Universal Login with email pre-filled */
  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth0Available) return;

    loginWithRedirect({
      authorizationParams: {
        login_hint: email,
        screen_hint: mode === 'signup' ? 'signup' : undefined,
      },
    });
  };

  /** Sign up redirect */
  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth0Available) return;

    loginWithRedirect({
      authorizationParams: {
        login_hint: email,
        screen_hint: 'signup',
      },
    });
  };

  const benefits = [
    { icon: <Save className="w-4 h-4" />, label: 'Save unlimited reports to your dashboard' },
    { icon: <Calendar className="w-4 h-4" />, label: 'Track personal year, month & day cycles' },
    { icon: <Shield className="w-4 h-4" />, label: 'Your data is encrypted & never shared' },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4 py-8">
      <CosmicBackground />

      <div className="floating-orb w-40 h-40 bg-amber-500/10 top-10 -left-16" aria-hidden="true" />
      <div className="floating-orb w-28 h-28 bg-purple-500/10 bottom-16 right-8" aria-hidden="true" />
      <div className="floating-orb w-20 h-20 bg-teal-500/10 top-1/3 right-1/4" aria-hidden="true" />

      <div className="relative z-10 w-full max-w-md">
        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 mb-5 pulse-glow">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white font-heading mb-2">
            Cosmic <span className="gold-text">Blueprint</span>
          </h1>
          <p className="text-gray-400 text-sm">
            {mode === 'login'
              ? 'Sign in to access your numerology dashboard'
              : 'Create your account to get started'}
          </p>
        </div>

        {/* Auth card */}
        <div className="glass-morphism-elevated p-6 sm:p-8 rounded-2xl">
          {/* Mode toggle */}
          <div className="flex rounded-xl bg-white/[0.03] border border-white/[0.06] p-1 mb-6">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 ${
                mode === 'login'
                  ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 border border-amber-500/20'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
              id="tab-login"
            >
              Sign In
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 ${
                mode === 'signup'
                  ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 border border-amber-500/20'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
              id="tab-signup"
            >
              Sign Up
            </button>
          </div>

          {/* SSO Buttons */}
          <div className="space-y-2.5 mb-6">
            <button
              onClick={() => handleSSO('google-oauth2')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07] hover:border-white/[0.15] transition-all duration-300 text-white text-sm font-medium group"
              id="sso-google"
            >
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span className="flex-1 text-left">Continue with Google</span>
              <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors" />
            </button>

            <button
              onClick={() => handleSSO('apple')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07] hover:border-white/[0.15] transition-all duration-300 text-white text-sm font-medium group"
              id="sso-apple"
            >
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="white">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
              <span className="flex-1 text-left">Continue with Apple</span>
              <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors" />
            </button>

            <button
              onClick={() => handleSSO('windowslive')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07] hover:border-white/[0.15] transition-all duration-300 text-white text-sm font-medium group"
              id="sso-microsoft"
            >
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                <path fill="#F25022" d="M1 1h10v10H1z" />
                <path fill="#00A4EF" d="M1 13h10v10H1z" />
                <path fill="#7FBA00" d="M13 1h10v10H13z" />
                <path fill="#FFB900" d="M13 13h10v10H13z" />
              </svg>
              <span className="flex-1 text-left">Continue with Microsoft</span>
              <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors" />
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-white/[0.06]" />
            <span className="text-xs text-gray-600 uppercase tracking-wider">or with email</span>
            <div className="flex-1 h-px bg-white/[0.06]" />
          </div>

          {/* Email/Password Form */}
          <form onSubmit={mode === 'login' ? handleEmailLogin : handleSignup} className="space-y-4">
            {mode === 'signup' && (
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Full name"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-gray-600 text-sm focus:outline-none focus:border-amber-500/30 focus:bg-white/[0.06] transition-all duration-300"
                  id="input-name"
                  autoComplete="name"
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-gray-600 text-sm focus:outline-none focus:border-amber-500/30 focus:bg-white/[0.06] transition-all duration-300"
                id="input-email"
                autoComplete="email"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-11 pr-11 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-gray-600 text-sm focus:outline-none focus:border-amber-500/30 focus:bg-white/[0.06] transition-all duration-300"
                id="input-password"
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {mode === 'login' && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => {
                    if (auth0Available) {
                      loginWithRedirect({
                        authorizationParams: {
                          screen_hint: 'reset-password' as string,
                          login_hint: email,
                        },
                      });
                    }
                  }}
                  className="text-xs text-amber-400/60 hover:text-amber-400 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              className="cosmic-button w-full py-3.5 text-sm font-semibold flex items-center justify-center gap-2"
              id="btn-submit"
            >
              {mode === 'login' ? (
                <>
                  <Lock className="w-4 h-4" />
                  Sign In
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Create Account
                </>
              )}
            </button>
          </form>

          {/* Toggle mode */}
          <p className="mt-6 text-center text-xs text-gray-500">
            {mode === 'login' ? (
              <>
                Don't have an account?{' '}
                <button onClick={() => setMode('signup')} className="text-amber-400 hover:text-amber-300 transition-colors font-medium">
                  Sign up free
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button onClick={() => setMode('login')} className="text-amber-400 hover:text-amber-300 transition-colors font-medium">
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>

        {/* Benefits */}
        <div className="mt-6 space-y-2.5">
          {benefits.map((b, i) => (
            <div
              key={i}
              className="flex items-center gap-3 text-xs text-gray-500 px-2"
            >
              <div className="text-amber-500/40">{b.icon}</div>
              {b.label}
            </div>
          ))}
        </div>

        {/* Legal */}
        <p className="mt-6 text-center text-[10px] text-gray-700 px-4">
          By signing in, you agree to our Terms of Service and Privacy Policy.
          <br />
          🔒 Protected by 256-bit encryption
        </p>

        {!auth0Available && (
          <div className="mt-4 p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs text-center">
            ⚠️ Auth0 is not configured. Add your credentials to <code className="bg-white/5 px-1.5 py-0.5 rounded font-mono">.env</code> to enable authentication.
          </div>
        )}

        {/* Footer */}
        <p className="mt-8 text-center text-[10px] text-gray-700">
          © {new Date().getFullYear()} Luthor Sparks Costello AI Studio 508C1A Church ® ™ All Rights Reserved and Retained. None Waived.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
