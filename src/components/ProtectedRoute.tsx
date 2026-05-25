import { withAuthenticationRequired } from '@auth0/auth0-react';
import { ComponentType } from 'react';
import { Sparkles } from 'lucide-react';

/**
 * Loading spinner shown while Auth0 redirects.
 */
const AuthLoading = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400/20 to-orange-500/20 flex items-center justify-center mx-auto mb-4">
        <Sparkles className="w-8 h-8 text-amber-400 loading-spinner" />
      </div>
      <p className="text-gray-400 text-sm">Verifying your cosmic identity...</p>
    </div>
  </div>
);

interface ProtectedRouteProps {
  component: ComponentType;
}

/**
 * Wraps a component with Auth0's authentication guard.
 * Redirects unauthenticated users to the Auth0 login page.
 */
const ProtectedRoute = ({ component }: ProtectedRouteProps) => {
  const Component = withAuthenticationRequired(component, {
    onRedirecting: () => <AuthLoading />,
  });

  return <Component />;
};

export default ProtectedRoute;
