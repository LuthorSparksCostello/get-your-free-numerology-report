import { useState, useEffect } from 'react';
import CosmicBackground from '@/components/CosmicBackground';
import NumerologyForm from '@/components/NumerologyForm';
import NumerologyReport from '@/components/NumerologyReport';
import AuthNavbar from '@/components/AuthNavbar';
import UpsellBanner from '@/components/UpsellBanner';
import { generateNumerologyReport } from '@/utils/numerology';
import { saveReport } from '@/utils/reportStorage';
import { isAuth0Configured } from '@/auth/auth0-config';
import { useOptionalAuth0 } from '@/auth/useOptionalAuth0';
import {
  Heart, Sparkles, Star, Zap, Shield, ChevronDown, Calculator,
  BookOpen, Target, ArrowRight, Save,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import type { ReportData } from '@/hooks/useReportStore';

const Index = () => {
  const auth0Available = isAuth0Configured();
  const { isAuthenticated, user, loginWithRedirect } = useOptionalAuth0();

  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const [counter, setCounter] = useState(0);
  const [reportSaved, setReportSaved] = useState(false);

  // Animated counter for social proof
  useEffect(() => {
    const target = 12847;
    const duration = 2000;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCounter(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, []);

  // Check for saved report view from dashboard
  useEffect(() => {
    const savedReportData = sessionStorage.getItem('view_report');
    if (savedReportData) {
      try {
        const data = JSON.parse(savedReportData);
        setReportData(data as ReportData);
        setShowForm(false);
        setReportSaved(true);
        sessionStorage.removeItem('view_report');
      } catch {
        sessionStorage.removeItem('view_report');
      }
    }
  }, []);

  const handleFormSubmit = async (data: { fullName: string; birthDate: string; email?: string }) => {
    setIsLoading(true);
    setReportSaved(false);
    await new Promise((r) => setTimeout(r, 2200));
    const report = generateNumerologyReport(data.fullName, data.email || '', data.birthDate);
    const reportAsData = report as unknown as ReportData;
    setReportData(reportAsData);
    setShowForm(false);
    setIsLoading(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Auto-save if authenticated
    if (isAuthenticated && user?.sub) {
      saveReport(user.sub, reportAsData);
      setReportSaved(true);
      toast({
        title: '✨ Report saved!',
        description: 'Your cosmic blueprint has been saved to your dashboard.',
      });
    }
  };

  const handleSaveReport = () => {
    if (!reportData) return;

    if (!isAuthenticated) {
      if (auth0Available) {
        loginWithRedirect();
      }
      return;
    }

    if (user?.sub) {
      saveReport(user.sub, reportData);
      setReportSaved(true);
      toast({
        title: '✨ Report saved!',
        description: 'Your cosmic blueprint has been saved to your dashboard.',
      });
    }
  };

  const handleBack = () => {
    setShowForm(true);
    setReportData(null);
    setReportSaved(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSignup = () => {
    document.getElementById('get-report')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const features = [
    { icon: <Calculator className="w-6 h-6" />, title: '9 Core Numbers', desc: 'Life Path, Expression, Soul Urge, and 6 more deep calculations.' },
    { icon: <Target className="w-6 h-6" />, title: '105 Career Paths', desc: '15 aligned career paths for each of your 7 primary numbers.' },
    { icon: <Zap className="w-6 h-6" />, title: 'Personal Cycles', desc: 'Your current Personal Year, Month, and Day energy forecasts.' },
    { icon: <Shield className="w-6 h-6" />, title: 'Pinnacle & Challenge', desc: '4 life periods and 4 growth challenges mapped to your timeline.' },
    { icon: <BookOpen className="w-6 h-6" />, title: 'Full Breakdowns', desc: 'Step-by-step Chaldean calculations showing exactly how each number is derived.' },
    { icon: <Star className="w-6 h-6" />, title: 'Master Numbers', desc: 'Full support for Master Numbers 11-99 with specialized interpretations.' },
  ];

  const steps = [
    { step: '01', title: 'Enter Your Name', desc: 'Your full name at birth — each letter has a Chaldean value.' },
    { step: '02', title: 'Add Your Birthdate', desc: 'The cosmic moment that set your life path in motion.' },
    { step: '03', title: 'Receive Your Blueprint', desc: 'An instant, comprehensive numerology report you can download.' },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      <CosmicBackground />
      <AuthNavbar />

      {/* Floating orbs */}
      <div className="floating-orb w-40 h-40 bg-amber-500/15 top-20 -left-10" style={{ animationDelay: '0s' }} aria-hidden="true" />
      <div className="floating-orb w-28 h-28 bg-purple-500/15 top-40 right-10" style={{ animationDelay: '3s' }} aria-hidden="true" />
      <div className="floating-orb w-20 h-20 bg-teal-500/15 bottom-40 left-1/4" style={{ animationDelay: '6s' }} aria-hidden="true" />

      <div className="relative z-10 pt-16">
        {showForm ? (
          <>
            {/* HERO */}
            <header className="pt-12 sm:pt-20 pb-12 text-center px-4">
              <div className="max-w-5xl mx-auto">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium mb-8">
                  <Sparkles className="w-3.5 h-3.5" />
                  Ancient Chaldean System • 100% Free
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 font-heading leading-tight">
                  Discover Your{' '}
                  <span className="gold-text">Cosmic Blueprint</span>{' '}
                  <br className="hidden sm:block" />
                  & Build a Business That{' '}
                  <span className="relative inline-block">
                    <span className="gold-text">Flows</span>
                    <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/10 to-transparent blur-xl rounded-lg -z-10" aria-hidden="true" />
                  </span>
                </h1>

                <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                  Without the self-sabotage, imposter syndrome, or overwhelm.
                  Unlock your personalized Chaldean numerology report and discover
                  the <span className="text-amber-400 font-medium">soul urge business</span> that
                  flows with your natural energy.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                  <button onClick={scrollToSignup} className="cosmic-button flex items-center gap-2 text-base" id="hero-cta">
                    <Heart className="w-5 h-5" />
                    Get Your Free Report
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Social proof */}
                <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <span className="text-amber-400 font-bold text-base">{counter.toLocaleString()}+</span> reports generated
                  </span>
                  <span className="w-1 h-1 rounded-full bg-gray-600" />
                  <span>⭐ 4.9/5 rating</span>
                </div>
              </div>
            </header>

            {/* WHAT YOU'LL DISCOVER */}
            <section className="py-16 px-4" aria-label="Features">
              <div className="max-w-6xl mx-auto">
                <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-3 font-heading">
                  What You'll <span className="gold-text">Discover</span>
                </h2>
                <p className="text-gray-400 text-center mb-12 max-w-lg mx-auto text-sm">
                  Your complete numerology profile — calculated using the ancient Chaldean system
                </p>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {features.map((f, i) => (
                    <div
                      key={i}
                      className="nebula-card group hover:border-amber-500/20 transition-all duration-500 cursor-default"
                    >
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/15 to-orange-500/15 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition-transform duration-300">
                        {f.icon}
                      </div>
                      <h3 className="text-base font-semibold text-white mb-1.5">{f.title}</h3>
                      <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* HOW IT WORKS */}
            <section className="py-16 px-4" aria-label="How it works">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-12 font-heading">
                  How It <span className="gold-text">Works</span>
                </h2>

                <div className="grid md:grid-cols-3 gap-6">
                  {steps.map((s, i) => (
                    <div key={i} className="text-center relative">
                      <div className="text-5xl font-display font-bold gold-text-static opacity-20 mb-3">{s.step}</div>
                      <h3 className="text-lg font-semibold text-white mb-2">{s.title}</h3>
                      <p className="text-gray-400 text-sm">{s.desc}</p>
                      {i < steps.length - 1 && (
                        <div className="hidden md:block absolute top-8 -right-3 text-amber-500/30">
                          <ArrowRight className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* FORM SECTION */}
            <section className="py-12 px-4" id="get-report" aria-label="Get your report">
              <div className="max-w-6xl mx-auto space-y-8">
                <div className="text-center">
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 font-heading">
                    Get Your <span className="gold-text">Free</span> Cosmic Blueprint
                  </h2>
                  <p className="text-gray-400 text-sm max-w-lg mx-auto">
                    Unlock your personalized Chaldean numerology report and discover the cosmic forces shaping your entrepreneurial journey.
                  </p>
                </div>

                <NumerologyForm onSubmit={handleFormSubmit} isLoading={isLoading} />

                {/* Trust indicators */}
                <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-8 text-xs text-gray-500">
                  <span className="trust-badge">🔮 Ancient Chaldean System</span>
                  <span className="trust-badge">✨ 100% Personalized</span>
                  <span className="trust-badge">🛡️ Privacy Protected</span>
                </div>
              </div>
            </section>

            {/* FAQ */}
            <section className="py-16 px-4" aria-label="Frequently asked questions">
              <div className="max-w-3xl mx-auto">
                <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-10 font-heading">
                  Frequently <span className="gold-text">Asked</span>
                </h2>
                <div className="space-y-3">
                  {[
                    { q: 'What is Chaldean Numerology?', a: 'Chaldean numerology is the oldest and most accurate system of numerology, originating from ancient Babylon. Unlike the Pythagorean system, it assigns values 1-8 to letters based on sound vibrations, making it deeply aligned with the energy of your name.' },
                    { q: 'Why is this free?', a: 'We believe everyone deserves access to their cosmic blueprint. This free report gives you comprehensive insights into your 9 core numbers. For deeper guidance on building a soul-aligned business, you can book a personalized consultation.' },
                    { q: 'What data do I need to enter?', a: 'Just your full name at birth and your birth date. These two pieces of information contain all the cosmic data needed to calculate your complete numerology profile.' },
                    { q: 'Are Master Numbers supported?', a: 'Yes! We fully support all Master Numbers (11, 22, 33, 44, 55, 66, 77, 88, 99) with specialized interpretations and career paths unique to each master vibration.' },
                  ].map((faq, i) => (
                    <FaqItem key={i} question={faq.q} answer={faq.a} />
                  ))}
                </div>
              </div>
            </section>
          </>
        ) : (
          /* REPORT VIEW */
          <main className="py-10 px-4">
            <div className="max-w-7xl mx-auto">
              {/* Save to Dashboard button */}
              {reportData && !reportSaved && (
                <div className="max-w-4xl mx-auto mb-6">
                  <Button
                    onClick={handleSaveReport}
                    className="cosmic-button-secondary w-full sm:w-auto"
                    id="save-to-dashboard"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isAuthenticated ? 'Save to Dashboard' : 'Sign In to Save Report'}
                  </Button>
                </div>
              )}
              {reportData && reportSaved && (
                <div className="max-w-4xl mx-auto mb-6">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
                    <Save className="w-4 h-4" />
                    Saved to your dashboard
                  </div>
                </div>
              )}
              {reportData && <NumerologyReport data={reportData} onBack={handleBack} />}
            </div>
          </main>
        )}

        {/* Upsell Banner */}
        {!showForm && <UpsellBanner bookingUrl="https://cal.com/luthor-sparks-costello" />}

        {/* Footer */}
        <footer className="py-8 text-center text-gray-600 text-xs border-t border-white/5 px-4">
          <p>© {new Date().getFullYear()} Luthor Sparks Costello AI Studio 508C1A Church ® ™ All Rights Reserved and Retained. None Waived.</p>
        </footer>
      </div>
    </div>
  );
};

/** Collapsible FAQ item */
const FaqItem = ({ question, answer }: { question: string; answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="glass-morphism rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 sm:p-5 text-left hover:bg-white/[0.02] transition-colors"
        aria-expanded={isOpen}
      >
        <span className="text-white font-medium text-sm sm:text-base pr-4">{question}</span>
        <ChevronDown className={`w-4 h-4 text-amber-400 transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ease-out ${isOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'}`}>
        <p className="px-4 sm:px-5 pb-4 sm:pb-5 text-gray-400 text-sm leading-relaxed">{answer}</p>
      </div>
    </div>
  );
};

export default Index;
