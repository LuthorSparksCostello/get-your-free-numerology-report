import { useEffect, useRef, useState } from 'react';
import { Calendar, TrendingUp } from 'lucide-react';
import { personalYearMeanings } from '@/utils/numerologyMeanings';

interface PersonalCyclePanelProps {
  personalYear: number;
  personalYearBreakdown: string[];
  personalMonth: number;
  personalMonthBreakdown: string[];
  personalDay: number;
  personalDayBreakdown: string[];
}

/**
 * Displays the current Personal Year / Month / Day cycles
 * with animated number counters and interpretations.
 */
const PersonalCyclePanel = ({
  personalYear, personalYearBreakdown,
  personalMonth, personalMonthBreakdown,
  personalDay, personalDayBreakdown,
}: PersonalCyclePanelProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const yearMeaning = personalYearMeanings[personalYear] || personalYearMeanings[1];

  const cycles = [
    {
      label: 'Personal Year',
      number: personalYear,
      color: 'from-amber-500/15 to-orange-500/15',
      border: 'border-amber-500/25',
      text: 'text-amber-400',
      dot: 'bg-amber-400',
      breakdown: personalYearBreakdown,
    },
    {
      label: 'Personal Month',
      number: personalMonth,
      color: 'from-purple-500/15 to-indigo-500/15',
      border: 'border-purple-500/25',
      text: 'text-purple-400',
      dot: 'bg-purple-400',
      breakdown: personalMonthBreakdown,
    },
    {
      label: 'Personal Day',
      number: personalDay,
      color: 'from-teal-500/15 to-cyan-500/15',
      border: 'border-teal-500/25',
      text: 'text-teal-400',
      dot: 'bg-teal-400',
      breakdown: personalDayBreakdown,
    },
  ];

  return (
    <div ref={ref} className="space-y-6">
      {/* Cycle numbers row */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {cycles.map((c, i) => (
          <div
            key={i}
            className={`p-4 rounded-xl bg-gradient-to-br ${c.color} ${c.border} border text-center transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
            style={{ transitionDelay: `${i * 120}ms` }}
          >
            <div className={`text-3xl sm:text-4xl font-display font-bold ${c.text} mb-1`}>
              {c.number}
            </div>
            <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">
              {c.label}
            </div>
            <div className={`w-1.5 h-1.5 rounded-full ${c.dot} mx-auto mt-2 opacity-60`} />
          </div>
        ))}
      </div>

      {/* Year interpretation */}
      <div
        className={`p-5 rounded-xl bg-gradient-to-r from-amber-500/8 to-orange-500/8 border border-amber-500/15 transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}
        style={{ transitionDelay: '400ms' }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-4 h-4 text-amber-400" />
          <h4 className="font-semibold text-amber-400 text-sm uppercase tracking-wider">
            {new Date().getFullYear()} — Year of {yearMeaning.theme}
          </h4>
        </div>
        <p className="text-gray-300 text-sm leading-relaxed mb-3">
          {yearMeaning.focus}
        </p>
        <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/8 border border-amber-500/10">
          <TrendingUp className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
          <p className="text-gray-300 text-sm leading-relaxed">
            {yearMeaning.advice}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PersonalCyclePanel;
