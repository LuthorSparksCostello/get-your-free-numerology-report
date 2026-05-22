import { useState, useEffect } from 'react';
import { Calendar, X } from 'lucide-react';

interface UpsellBannerProps {
  bookingUrl: string;
}

/**
 * Floating sticky banner that appears after the user has scrolled
 * through 50%+ of the report. Dismissible with gentle re-appearance.
 */
const UpsellBanner = ({ bookingUrl }: UpsellBannerProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (isDismissed) return;

      const scrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
      setIsVisible(scrollPercent > 0.4);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isDismissed]);

  if (isDismissed || !isVisible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 p-3 sm:p-4 transition-all duration-500 animate-fade-in-up"
      role="complementary"
      aria-label="Book a consultation"
    >
      <div className="max-w-3xl mx-auto glass-morphism-elevated rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400/20 to-orange-500/20 flex items-center justify-center flex-shrink-0">
            <Calendar className="w-5 h-5 text-amber-400" />
          </div>
          <div className="min-w-0">
            <p className="text-white font-semibold text-sm sm:text-base truncate">
              Ready to transform your numbers into a business?
            </p>
            <p className="text-gray-400 text-xs sm:text-sm hidden sm:block">
              Book a Soul-Aligned Business Strategy Call
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <a
            href={bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="cosmic-button px-4 sm:px-6 py-2.5 text-sm font-semibold whitespace-nowrap"
          >
            Book Now
          </a>
          <button
            onClick={() => setIsDismissed(true)}
            className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpsellBanner;
