
import { useState } from 'react';
import CosmicBackground from '@/components/CosmicBackground';
import NumerologyForm from '@/components/NumerologyForm';
import NumerologyReport from '@/components/NumerologyReport';
import { generateNumerologyReport } from '@/utils/numerology';
import { Sparkles, Stars, Heart } from 'lucide-react';

interface FormData {
  fullName: string;
  email: string;
  birthDate: string;
}

const Index = () => {
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(true);

  const handleFormSubmit = async (data: FormData) => {
    setIsLoading(true);
    
    // Simulate API call delay for better UX
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const report = generateNumerologyReport(data.fullName, data.email, data.birthDate);
    setReportData(report);
    setShowForm(false);
    setIsLoading(false);
  };

  const handleBack = () => {
    setShowForm(true);
    setReportData(null);
  };

  const scrollToSignup = () => {
    const signupSection = document.getElementById('newsletter-signup');
    if (signupSection) {
      signupSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'center'
      });
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <CosmicBackground />
      
      {/* Floating decorative elements */}
      <div className="floating-orb w-32 h-32 bg-amber-500/20 top-20 left-10 animate-cosmic-float" style={{ animationDelay: '0s' }} />
      <div className="floating-orb w-24 h-24 bg-purple-500/20 top-40 right-20 animate-cosmic-float" style={{ animationDelay: '2s' }} />
      <div className="floating-orb w-16 h-16 bg-pink-500/20 bottom-40 left-1/4 animate-cosmic-float" style={{ animationDelay: '4s' }} />
      
      <div className="relative z-10">
        {/* Header */}
        <header className="py-16 sm:py-24 text-center px-4">
          <div className="max-w-6xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 backdrop-blur-sm rounded-full px-6 py-2 mb-6 border border-amber-500/30">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-amber-300 font-medium text-sm">
                5-DAY LIVE CHALLENGE FOR SPIRITUAL ENTREPRENEURS
              </span>
            </div>
            
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 cosmic-text leading-tight">
              Turn Your{' '}
              <span className="gold-text relative">
                Birth Chart
                <div className="absolute -inset-2 bg-gradient-to-r from-amber-500/20 to-transparent blur-xl rounded-lg -z-10" />
              </span>{' '}
              into a{' '}
              <span className="relative">
                Magnetic Offer
                <Stars className="absolute -top-2 -right-8 w-6 h-6 text-amber-400 animate-pulse" />
              </span>{' '}
              That Sells
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto mb-8 leading-relaxed">
              Without the self-sabotage, imposter syndrome, plateaus, or overwhelm. Discover your cosmic blueprint 
              and build a <span className="text-amber-400 font-semibold">soul urge business</span> that flows with your natural energy.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button onClick={scrollToSignup} className="cosmic-button flex items-center gap-2">
                <Heart className="w-5 h-5" />
                <span className="font-medium">Get Your Free Report Now</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content - Newsletter Signup Section */}
        <main className="pb-16 px-4">
          <div className="max-w-7xl mx-auto">
            {showForm && (
              <div id="newsletter-signup" className="space-y-12">
                <div className="text-center">
                  <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 cosmic-text">
                    Get Your <span className="gold-text">Free</span> Cosmic Blueprint Instantly
                  </h2>
                  <p className="text-gray-400 max-w-2xl mx-auto">
                    Unlock your personalized Chaldean numerology report and discover the cosmic forces 
                    that shape your entrepreneurial journey.
                  </p>
                </div>
                
                <NumerologyForm onSubmit={handleFormSubmit} isLoading={isLoading} />
                
                {/* Trust indicators */}
                <div className="text-center space-y-4">
                  <div className="flex justify-center items-center gap-8 text-sm text-gray-400">
                    <span>🔮 Ancient Chaldean System</span>
                    <span>✨ 100% Personalized</span>
                    <span>🛡️ Privacy Protected</span>
                  </div>
                </div>
              </div>
            )}
            
            {reportData && !showForm && (
              <NumerologyReport data={reportData} onBack={handleBack} />
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="py-8 text-center text-gray-500 text-sm border-t border-white/10">
          <p>© {new Date().getFullYear()} Dangelo Ali Ministry All Rights Reserved and Retained.</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
