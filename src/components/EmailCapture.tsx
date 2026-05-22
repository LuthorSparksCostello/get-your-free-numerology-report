import { useState } from 'react';
import { Mail, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface EmailCaptureProps {
  onCapture: (email: string) => void;
  variant?: 'inline' | 'card';
  heading?: string;
  subtext?: string;
}

/**
 * Email capture component for lead generation.
 * Uses localStorage to persist the captured email.
 */
const EmailCapture = ({
  onCapture,
  variant = 'card',
  heading = 'Save Your Cosmic Blueprint',
  subtext = 'Enter your email to save your report and receive personalized cosmic insights.',
}: EmailCaptureProps) => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email');
      return;
    }

    // Save to localStorage
    try {
      const existing = JSON.parse(localStorage.getItem('numerology_leads') || '[]');
      existing.push({ email, timestamp: new Date().toISOString() });
      localStorage.setItem('numerology_leads', JSON.stringify(existing));
    } catch {
      // Silent fail on storage errors
    }

    setIsSubmitted(true);
    setError('');
    onCapture(email);
  };

  if (isSubmitted) {
    return (
      <div className={`text-center p-6 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 ${variant === 'inline' ? '' : 'glass-morphism'}`}>
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/20 mb-3">
          <Sparkles className="w-6 h-6 text-emerald-400" />
        </div>
        <p className="text-emerald-400 font-semibold">Your report has been saved!</p>
        <p className="text-gray-400 text-sm mt-1">Check your inbox for cosmic insights.</p>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <form onSubmit={handleSubmit} className="flex gap-2 items-start">
        <div className="flex-1">
          <Input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(''); }}
            className="bg-white/5 border-white/15 text-white placeholder:text-gray-500 focus:border-amber-400 focus:ring-amber-400/20 h-11"
            aria-label="Email address"
          />
          {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
        </div>
        <Button type="submit" className="cosmic-button h-11 px-5 text-sm flex-shrink-0">
          <Mail className="w-4 h-4 mr-1.5" />
          Save
        </Button>
      </form>
    );
  }

  return (
    <div className="glass-morphism-elevated p-6 sm:p-8 text-center">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-amber-400/20 to-orange-500/20 mb-4">
        <Mail className="w-7 h-7 text-amber-400" />
      </div>
      <h3 className="text-xl font-heading font-bold text-white mb-2">{heading}</h3>
      <p className="text-gray-400 text-sm mb-5 max-w-md mx-auto">{subtext}</p>
      <form onSubmit={handleSubmit} className="max-w-sm mx-auto">
        <div className="flex gap-2">
          <Input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(''); }}
            className="bg-white/5 border-white/15 text-white placeholder:text-gray-500 focus:border-amber-400 focus:ring-amber-400/20 h-12"
            aria-label="Email address"
          />
          <Button type="submit" className="cosmic-button h-12 px-6 flex-shrink-0">
            <Sparkles className="w-4 h-4 mr-1.5" />
            Save
          </Button>
        </div>
        {error && <p className="text-red-400 text-xs mt-2 text-left">{error}</p>}
      </form>
      <p className="text-gray-500 text-xs mt-3">🔒 We never share your information</p>
    </div>
  );
};

export default EmailCapture;
