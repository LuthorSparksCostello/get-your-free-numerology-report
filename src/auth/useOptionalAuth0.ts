import { useAuth0 as useAuth0Original } from '@auth0/auth0-react';
import { isAuth0Configured } from './auth0-config';

/**
 * Auth0 fallback values used when Auth0 is not configured.
 * Matches the shape of useAuth0() return type for seamless usage.
 */
const AUTH0_FALLBACK = {
  isAuthenticated: false,
  isLoading: false,
  user: undefined,
  loginWithRedirect: async () => {},
  logout: () => {},
  getAccessTokenSilently: async () => '',
  getAccessTokenWithPopup: async () => '',
  getIdTokenClaims: async () => undefined,
  loginWithPopup: async () => {},
  handleRedirectCallback: async () => ({ appState: {} }),
} as unknown as ReturnType<typeof useAuth0Original>;

/**
 * Safe wrapper around Auth0's useAuth0 hook.
 *
 * When Auth0 is not configured (no env vars), this returns static
 * fallback values so components work without errors. This hook
 * always calls useAuth0() unconditionally when Auth0Provider wraps
 * the app, and returns fallbacks when it doesn't.
 *
 * This avoids violating React's Rules of Hooks (no conditional hook calls).
 */
let _auth0Configured: boolean | null = null;

export const useOptionalAuth0 = () => {
  // Cache the check — it's based on env vars and won't change at runtime
  if (_auth0Configured === null) {
    _auth0Configured = isAuth0Configured();
  }

  if (_auth0Configured) {
    // Auth0Provider is wrapping the app — safe to call the real hook
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useAuth0Original();
  }

  // Auth0 not configured — return fallback (no hook call)
  return AUTH0_FALLBACK;
};
