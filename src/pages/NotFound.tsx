import { Link } from 'react-router-dom';
import { Home, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background orbs */}
      <div className="floating-orb w-40 h-40 bg-purple-500/10 top-20 left-10" style={{ animationDelay: '0s' }} aria-hidden="true" />
      <div className="floating-orb w-24 h-24 bg-amber-500/10 bottom-20 right-20" style={{ animationDelay: '2s' }} aria-hidden="true" />

      <div className="text-center relative z-10 max-w-md">
        <div className="text-8xl sm:text-9xl font-display font-bold gold-text-static mb-4 opacity-80">
          404
        </div>
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400/20 to-orange-500/20 mb-6">
          <Sparkles className="w-7 h-7 text-amber-400" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white font-heading mb-3">
          Lost in the <span className="gold-text">Cosmos</span>
        </h1>
        <p className="text-gray-400 mb-8 text-sm leading-relaxed">
          This page doesn't exist in any dimension we've discovered.
          Let's get you back to your cosmic blueprint.
        </p>
        <Link to="/">
          <Button className="cosmic-button" id="go-home">
            <Home className="w-4 h-4 mr-2" />
            Return Home
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
