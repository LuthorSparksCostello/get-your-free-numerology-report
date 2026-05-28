import { Link } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import {
  ArrowLeft, Star, Sparkles, Crown, Zap,
  Shield, Target, BookOpen, TrendingUp, CheckCircle,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import CosmicBackground from '@/components/CosmicBackground';
import AuthNavbar from '@/components/AuthNavbar';
import PaymentForm from '@/components/PaymentForm';

const MONTHLY_PRICE_CENTS = 900; // $9.00/month

const premiumFeatures = [
  { icon: <Crown className="w-5 h-5" />, title: 'Extended 50+ Page Report', desc: 'Deep-dive analysis of every core number with expanded interpretations.' },
  { icon: <TrendingUp className="w-5 h-5" />, title: '12-Month Forecast', desc: 'Month-by-month energy forecast updated with your personal cycles.' },
  { icon: <Target className="w-5 h-5" />, title: 'Business Name Analysis', desc: 'Chaldean analysis of your business name\'s vibrational alignment.' },
  { icon: <BookOpen className="w-5 h-5" />, title: 'Compatibility Matrix', desc: 'Partner, business partner, and team compatibility scores.' },
  { icon: <Zap className="w-5 h-5" />, title: 'Lucky Days & Timing', desc: 'Optimal dates for launches, signings, and major decisions.' },
  { icon: <RefreshCw className="w-5 h-5" />, title: 'Monthly Updates', desc: 'Fresh forecasts and insights delivered every billing cycle.' },
];

const freeVsPremium = [
  { feature: 'Core Numbers (7)', free: true, premium: true },
  { feature: 'Step-by-Step Calculations', free: true, premium: true },
  { feature: 'Personal Cycles', free: true, premium: true },
  { feature: 'Pinnacle & Challenge Numbers', free: true, premium: true },
  { feature: 'Extended Interpretations', free: false, premium: true },
  { feature: '12-Month Forecast', free: false, premium: true },
  { feature: 'Business Name Analysis', free: false, premium: true },
  { feature: 'Compatibility Matrix', free: false, premium: true },
  { feature: 'Lucky Days & Timing', free: false, premium: true },
  { feature: 'Monthly Updated Insights', free: false, premium: true },
];

const Upgrade = () => {
  const { user } = useAuth0();

  return (
    <div className="min-h-screen relative overflow-hidden">
      <CosmicBackground />
      <AuthNavbar />

      {/* Floating orbs */}
      <div className="floating-orb w-32 h-32 bg-amber-500/15 top-32 -right-8" style={{ animationDelay: '0s' }} aria-hidden="true" />
      <div className="floating-orb w-24 h-24 bg-purple-500/15 bottom-40 left-10" style={{ animationDelay: '4s' }} aria-hidden="true" />

      <main className="relative z-10 pt-24 pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Back */}
          <Link to="/">
            <Button
              variant="ghost"
              className="mb-6 text-amber-400 hover:text-amber-300 hover:bg-amber-500/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Report
            </Button>
          </Link>

          {/* Hero */}
          <header className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium mb-6">
              <Star className="w-3.5 h-3.5" />
              Premium Cosmic Blueprint
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 font-heading leading-tight">
              Unlock Your Full{' '}
              <span className="gold-text">Cosmic Potential</span>
            </h1>

            <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Go beyond the basics. Get an extended 50+ page report with monthly forecasts,
              business name analysis, compatibility scores, and lucky timing insights — all
              updated monthly.
            </p>
          </header>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left: Features + Comparison */}
            <div className="space-y-8">
              {/* Feature Grid */}
              <section aria-label="Premium features">
                <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-2 font-heading">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  What's Included
                </h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {premiumFeatures.map((f, i) => (
                    <div
                      key={i}
                      className="nebula-card group hover:border-amber-500/20 transition-all duration-300"
                    >
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500/15 to-orange-500/15 flex items-center justify-center text-amber-400 mb-3 group-hover:scale-110 transition-transform duration-300">
                        {f.icon}
                      </div>
                      <h3 className="text-sm font-semibold text-white mb-1">{f.title}</h3>
                      <p className="text-gray-400 text-xs leading-relaxed">{f.desc}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Comparison Table */}
              <section className="report-card" aria-label="Free vs Premium comparison">
                <h2 className="text-lg font-bold text-white mb-4 font-heading">
                  Free vs <span className="gold-text">Premium</span>
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left text-gray-400 py-2 pr-4 font-medium">Feature</th>
                        <th className="text-center text-gray-400 py-2 px-3 font-medium">Free</th>
                        <th className="text-center text-amber-400 py-2 px-3 font-medium">Premium</th>
                      </tr>
                    </thead>
                    <tbody>
                      {freeVsPremium.map((row, i) => (
                        <tr key={i} className="border-b border-white/5">
                          <td className="text-gray-300 py-2.5 pr-4">{row.feature}</td>
                          <td className="text-center py-2.5 px-3">
                            {row.free ? (
                              <CheckCircle className="w-4 h-4 text-emerald-400 mx-auto" />
                            ) : (
                              <span className="text-gray-600">—</span>
                            )}
                          </td>
                          <td className="text-center py-2.5 px-3">
                            <CheckCircle className="w-4 h-4 text-amber-400 mx-auto" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>

            {/* Right: Payment Card */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              <div className="glass-morphism-elevated p-6 sm:p-8 rounded-2xl">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 mb-4 glow-gold">
                    <Crown className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white font-heading mb-1">
                    Premium Cosmic Blueprint
                  </h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-3xl font-display font-bold gold-text">$9</span>
                    <span className="text-gray-500 text-sm ml-1">/month</span>
                  </div>
                  <p className="text-gray-500 text-xs mt-1">
                    Cancel anytime · No long-term commitment
                  </p>
                </div>

                <div className="w-full h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent mb-6" />

                <PaymentForm
                  amountCents={MONTHLY_PRICE_CENTS}
                  currency="USD"
                  userEmail={user?.email || ''}
                  userName={user?.name || user?.given_name || 'Subscriber'}
                  userId={user?.sub || ''}
                  onSuccess={(result) => {
                    console.log('Subscription active:', result.subscriptionId);
                  }}
                  onError={(result) => {
                    console.warn('Subscription failed:', result.error?.code);
                  }}
                />

                {/* Guarantee */}
                <div className="mt-6 p-3 rounded-lg bg-emerald-500/8 border border-emerald-500/15 text-center">
                  <p className="text-emerald-400 text-xs font-medium mb-0.5">
                    ✨ Cancel Anytime, No Questions Asked
                  </p>
                  <p className="text-gray-500 text-[10px]">
                    Your subscription renews monthly. Cancel from your dashboard whenever you want.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-8 text-center text-gray-600 text-xs border-t border-white/5 px-4">
        <p>© {new Date().getFullYear()} Luthor Sparks Costello AI Studio 508C1A Church ® ™ All Rights Reserved and Retained. None Waived.</p>
      </footer>
    </div>
  );
};

export default Upgrade;
