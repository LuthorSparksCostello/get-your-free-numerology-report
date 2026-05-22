import { useEffect, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { isMasterNumber } from '@/utils/numerology';
import { pinnacleMeanings } from '@/utils/numerologyMeanings';
import type { PinnacleData } from '@/hooks/useReportStore';

interface PinnacleTimelineProps {
  pinnacles: PinnacleData[];
  birthYear: number;
}

/**
 * Horizontal timeline showing the 4 Pinnacle life periods.
 * Highlights the current period based on the user's age.
 */
const PinnacleTimeline = ({ pinnacles, birthYear }: PinnacleTimelineProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const currentAge = new Date().getFullYear() - birthYear;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const getStatus = (p: PinnacleData): 'past' | 'current' | 'future' => {
    if (currentAge < p.startAge) return 'future';
    if (p.endAge !== null && currentAge > p.endAge) return 'past';
    return 'current';
  };

  const colors = [
    { dot: 'bg-emerald-400', line: 'bg-emerald-500/30', text: 'text-emerald-400', bg: 'from-emerald-500/10 to-green-500/10', border: 'border-emerald-500/20' },
    { dot: 'bg-amber-400',   line: 'bg-amber-500/30',   text: 'text-amber-400',   bg: 'from-amber-500/10 to-orange-500/10', border: 'border-amber-500/20' },
    { dot: 'bg-purple-400',  line: 'bg-purple-500/30',  text: 'text-purple-400',  bg: 'from-purple-500/10 to-indigo-500/10', border: 'border-purple-500/20' },
    { dot: 'bg-rose-400',    line: 'bg-rose-500/30',    text: 'text-rose-400',    bg: 'from-rose-500/10 to-pink-500/10', border: 'border-rose-500/20' },
  ];

  return (
    <div ref={ref} className="space-y-6">
      {/* Timeline bar */}
      <div className="relative">
        {/* Connecting line */}
        <div className="absolute top-5 left-[5%] right-[5%] h-0.5 bg-white/10 rounded-full" />

        <div className="flex justify-between relative">
          {pinnacles.map((p, i) => {
            const status = getStatus(p);
            const c = colors[i];
            const isCurrent = status === 'current';

            return (
              <button
                key={i}
                onClick={() => setExpandedIndex(expandedIndex === i ? null : i)}
                className={`flex flex-col items-center gap-2 relative z-10 transition-all duration-500 group ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
                style={{ transitionDelay: `${i * 150}ms`, flex: '1 1 0' }}
                aria-label={`Pinnacle ${i + 1}: Number ${p.number}, ${p.period}`}
              >
                {/* Dot */}
                <div className={`relative`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-display font-bold transition-all duration-300 ${
                    isCurrent
                      ? `${c.dot} text-deepspace-950 ring-4 ring-offset-2 ring-offset-deepspace-950 ring-${c.dot.replace('bg-', '')}/50 scale-110`
                      : status === 'past'
                      ? 'bg-white/10 text-white/40'
                      : 'bg-white/5 text-white/25 border border-white/10'
                  } group-hover:scale-110`}>
                    {p.number}
                  </div>
                  {isCurrent && (
                    <div className={`absolute inset-0 rounded-full ${c.dot} opacity-30 animate-ping`} />
                  )}
                </div>

                {/* Period label */}
                <div className="text-center">
                  <div className={`text-xs font-semibold ${isCurrent ? c.text : 'text-gray-500'}`}>
                    Pinnacle {i + 1}
                  </div>
                  <div className="text-[10px] text-gray-500 mt-0.5 whitespace-nowrap">
                    {p.period}
                  </div>
                </div>

                {isMasterNumber(p.number) && (
                  <Badge className="text-[9px] bg-gold-500/20 text-gold-300 border-gold-500/30 border px-1 py-0">
                    Master
                  </Badge>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Expanded detail */}
      {expandedIndex !== null && (
        <div className={`p-5 rounded-xl bg-gradient-to-r ${colors[expandedIndex].bg} ${colors[expandedIndex].border} border transition-all duration-500 animate-fade-in-up`}>
          <div className="flex items-center justify-between mb-3">
            <h4 className={`font-semibold ${colors[expandedIndex].text}`}>
              Pinnacle {expandedIndex + 1} — Number {pinnacles[expandedIndex].number}
            </h4>
            <span className="text-xs text-gray-500">{pinnacles[expandedIndex].period}</span>
          </div>
          <p className="text-gray-300 text-sm leading-relaxed mb-3">
            {pinnacleMeanings[pinnacles[expandedIndex].number] || pinnacleMeanings[pinnacles[expandedIndex].number > 9 ? 9 : pinnacles[expandedIndex].number]}
          </p>
          <div className="text-xs text-gray-500 font-mono space-y-0.5">
            {pinnacles[expandedIndex].breakdown.map((step, i) => (
              <div key={i}>{step}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PinnacleTimeline;
