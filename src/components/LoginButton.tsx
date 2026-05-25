import { Sparkles } from 'lucide-react';
import { isAuth0Configured } from '@/auth/auth0-config';
import { useOptionalAuth0 } from '@/auth/useOptionalAuth0';

interface LoginButtonProps {
  className?: string;
  label?: string;
}

/**
 * Reusable login trigger button.
 * Calls Auth0's loginWithRedirect to open Universal Login.
 */
const LoginButton = ({ className = '', label = 'Sign In to Save' }: LoginButtonProps) => {
  const auth0Available = isAuth0Configured();
  const { loginWithRedirect } = useOptionalAuth0();

  const handleLogin = () => {
    if (auth0Available) {
      loginWithRedirect();
    }
  };

  if (!auth0Available) return null;

  return (
    <button
      onClick={handleLogin}
      className={`cosmic-button flex items-center justify-center gap-2 ${className}`}
      id="login-button"
    >
      <Sparkles className="w-4 h-4" />
      {label}
    </button>
  );
};

export default LoginButton;
