import { useState, useEffect, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Calculator, ChevronDown, DollarSign } from 'lucide-react';
import { isMasterNumber } from '@/utils/numerology';
import type { NumberMeaning } from '@/utils/numerologyMeanings';

interface NumberCardProps {
  number: number;
  compound?: number | null;  // Chaldean double-digit inner influence
  label: string;
  meaning: NumberMeaning;
  breakdown: string[];
  icon: React.ReactNode;
  colorClass: string;       // e.g. "emerald", "rose", "amber"
  description?: string;     // extra context line before the meaning description
}

const colorMap: Record<string, { bg: string; border: string; text: string; badge: string; badgeBorder: string; glow: string }> = {
  emerald:  { bg: 'from-emerald-500/10 to-green-500/10',  border: 'border-emerald-500/20',  text: 'text-emerald-400',  badge: 'bg-emerald-500/20 text-emerald-300', badgeBorder: 'border-emerald-500/30', glow: 'rgba(16,185,129,0.15)' },
  cyan:     { bg: 'from-cyan-500/10 to-blue-500/10',      border: 'border-cyan-500/20',      text: 'text-cyan-400',     badge: 'bg-cyan-500/20 text-cyan-300',    badgeBorder: 'border-cyan-500/30',    glow: 'rgba(6,182,212,0.15)' },
  rose:     { bg: 'from-rose-500/10 to-pink-500/10',      border: 'border-rose-500/20',      text: 'text-rose-400',     badge: 'bg-rose-500/20 text-rose-300',    badgeBorder: 'border-rose-500/30',    glow: 'rgba(244,63,94,0.15)' },
  purple:   { bg: 'from-purple-500/10 to-indigo-500/10',  border: 'border-purple-500/20',    text: 'text-purple-400',   badge: 'bg-purple-500/20 text-purple-300', badgeBorder: 'border-purple-500/30', glow: 'rgba(168,85,247,0.15)' },
  amber:    { bg: 'from-amber-500/10 to-orange-500/10',   border: 'border-amber-500/20',     text: 'text-amber-400',    badge: 'bg-amber-500/20 text-amber-300',  badgeBorder: 'border-amber-500/30',  glow: 'rgba(245,158,11,0.15)' },
  indigo:   { bg: 'from-indigo-500/10 to-violet-500/10',  border: 'border-indigo-500/20',    text: 'text-indigo-400',   badge: 'bg-indigo-500/20 text-indigo-300', badgeBorder: 'border-indigo-500/30', glow: 'rgba(99,102,241,0.15)' },
  yellow:   { bg: 'from-yellow-500/10 to-amber-500/10',   border: 'border-yellow-500/20',    text: 'text-yellow-400',   badge: 'bg-yellow-500/20 text-yellow-300', badgeBorder: 'border-yellow-500/30', glow: 'rgba(234,179,8,0.15)' },
  orange:   { bg: 'from-orange-500/10 to-red-500/10',     border: 'border-orange-500/20',    text: 'text-orange-400',   badge: 'bg-orange-500/20 text-orange-300', badgeBorder: 'border-orange-500/30', glow: 'rgba(249,115,22,0.15)' },
  red:      { bg: 'from-red-500/10 to-pink-500/10',       border: 'border-red-500/20',       text: 'text-red-400',      badge: 'bg-red-500/20 text-red-300',      badgeBorder: 'border-red-500/30',    glow: 'rgba(239,68,68,0.15)' },
  teal:     { bg: 'from-teal-500/10 to-cyan-500/10',      border: 'border-teal-500/20',      text: 'text-teal-400',     badge: 'bg-teal-500/20 text-teal-300',    badgeBorder: 'border-teal-500/30',   glow: 'rgba(20,184,166,0.15)' },
};

const NumberCard = ({ number, compound, label, meaning, breakdown, icon, colorClass, description }: NumberCardProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [showCareers, setShowCareers] = useState(false);
  const [displayNumber, setDisplayNumber] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const c = colorMap[colorClass] || colorMap.amber;

  // Intersection observer for scroll-triggered entrance
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.15 }
    );
    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  // Animated number counter
  useEffect(() => {
    if (!isVisible) return;
    const target = number;
    const duration = 800;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setDisplayNumber(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [isVisible, number]);

  return (
    <div
      ref={cardRef}
      id={`number-card-${label.toLowerCase().replace(/[^a-z]/g, '-')}`}
      className={`report-card transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      style={{ transitionDelay: isVisible ? '0ms' : '0ms' }}
    >
      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <div
          className={`flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br ${c.bg} ${c.border} border`}
          style={{ boxShadow: `0 0 24px ${c.glow}` }}
        >
          <span className={`text-2xl font-display font-bold ${c.text}`}>
            {displayNumber}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className={`text-xl sm:text-2xl font-bold text-white font-heading`}>
              {label} {number}: {meaning.title}
            </h2>
            {isMasterNumber(number) && (
              <Badge className={`${c.badge} ${c.badgeBorder} border text-xs`}>
                Master Number
              </Badge>
            )}
          </div>
          <div className={`flex items-center gap-1.5 mt-1 ${c.text} opacity-70`}>
            {icon}
            {compound && (
              <span className="text-xs text-gray-400 ml-1">
                Inner Influence: <span className={`${c.text} font-semibold`}>{compound}</span> → {number}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-300 text-base leading-relaxed mb-6">
        {description && <span className="text-gray-400">{description} </span>}
        {meaning.description}
      </p>

      {/* Strengths & Challenges */}
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div className={`p-4 rounded-xl bg-gradient-to-r ${c.bg} ${c.border} border`}>
          <h3 className={`text-sm font-semibold ${c.text} mb-2.5 uppercase tracking-wider`}>Natural Talents</h3>
          <div className="flex flex-wrap gap-1.5">
            {meaning.strengths.map((s, i) => (
              <Badge key={i} className={`${c.badge} ${c.badgeBorder} border text-xs`}>{s}</Badge>
            ))}
          </div>
        </div>
        <div className="p-4 rounded-xl bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20">
          <h3 className="text-sm font-semibold text-orange-400 mb-2.5 uppercase tracking-wider">Areas to Develop</h3>
          <div className="flex flex-wrap gap-1.5">
            {meaning.challenges.map((ch, i) => (
              <Badge key={i} className="bg-orange-500/20 text-orange-300 border-orange-500/30 border text-xs">{ch}</Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Expandable: Calculation Breakdown */}
      <button
        onClick={() => setShowBreakdown(!showBreakdown)}
        className={`w-full flex items-center justify-between p-3 rounded-lg ${c.border} border bg-white/[0.02] hover:bg-white/[0.04] transition-colors mb-2`}
        aria-expanded={showBreakdown}
        aria-controls={`breakdown-${label}`}
      >
        <span className={`flex items-center gap-2 text-sm font-medium ${c.text}`}>
          <Calculator className="w-4 h-4" />
          Calculation Breakdown
        </span>
        <ChevronDown className={`w-4 h-4 ${c.text} transition-transform duration-300 ${showBreakdown ? 'rotate-180' : ''}`} />
      </button>
      <div
        id={`breakdown-${label}`}
        className={`overflow-hidden transition-all duration-300 ease-out ${showBreakdown ? 'max-h-96 opacity-100 mb-2' : 'max-h-0 opacity-0'}`}
      >
        <div className={`p-4 rounded-xl bg-gradient-to-r ${c.bg} ${c.border} border`}>
          <div className="space-y-1 text-gray-300 font-mono text-sm">
            {breakdown.map((step, i) => <div key={i}>{step}</div>)}
          </div>
        </div>
      </div>

      {/* Expandable: Career Paths */}
      <button
        onClick={() => setShowCareers(!showCareers)}
        className={`w-full flex items-center justify-between p-3 rounded-lg ${c.border} border bg-white/[0.02] hover:bg-white/[0.04] transition-colors`}
        aria-expanded={showCareers}
        aria-controls={`careers-${label}`}
      >
        <span className={`flex items-center gap-2 text-sm font-medium ${c.text}`}>
          <DollarSign className="w-4 h-4" />
          15 Ideal Career Paths
        </span>
        <ChevronDown className={`w-4 h-4 ${c.text} transition-transform duration-300 ${showCareers ? 'rotate-180' : ''}`} />
      </button>
      <div
        id={`careers-${label}`}
        className={`overflow-hidden transition-all duration-300 ease-out ${showCareers ? 'max-h-[500px] opacity-100 mt-2' : 'max-h-0 opacity-0'}`}
      >
        <div className={`p-4 rounded-xl bg-gradient-to-r ${c.bg} ${c.border} border`}>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {meaning.careers.map((career, i) => (
              <div key={i} className={`text-sm text-gray-300 ${c.badge} rounded-md px-2.5 py-1.5`}>
                {career}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NumberCard;
