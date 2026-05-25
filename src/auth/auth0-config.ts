/**
 * Auth0 Configuration
 * Reads from Vite environment variables set in .env
 */

export const auth0Config = {
  domain: import.meta.env.VITE_AUTH0_DOMAIN || '',
  clientId: import.meta.env.VITE_AUTH0_CLIENT_ID || '',
  callbackUrl: import.meta.env.VITE_AUTH0_CALLBACK_URL || window.location.origin,
};

/** Check if Auth0 is properly configured */
export const isAuth0Configured = (): boolean => {
  return !!(
    auth0Config.domain &&
    auth0Config.clientId &&
    auth0Config.domain !== 'your-tenant.auth0.com' &&
    auth0Config.clientId !== 'your-client-id'
  );
};
