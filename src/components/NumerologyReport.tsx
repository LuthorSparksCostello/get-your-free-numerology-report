import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Star, Heart, DollarSign, Users, Target,
  Download, ArrowLeft, Calendar, User,
  Zap, AlertTriangle, Compass, Shield,
} from 'lucide-react';
import jsPDF from 'jspdf';
import { numberMeanings, masterNumberSignificance, challengeMeanings } from '@/utils/numerologyMeanings';
import { isMasterNumber } from '@/utils/numerology';
import type { ReportData } from '@/hooks/useReportStore';
import NumberCard from './NumberCard';
import CosmicChart from './CosmicChart';
import PinnacleTimeline from './PinnacleTimeline';
import PersonalCyclePanel from './PersonalCyclePanel';
import EmailCapture from './EmailCapture';

interface NumerologyReportProps {
  data: ReportData;
  onBack: () => void;
}

const NumerologyReport = ({ data, onBack }: NumerologyReportProps) => {
  const lifePathMeaning = numberMeanings[data.lifePathNumber as keyof typeof numberMeanings];
  const expressionMeaning = numberMeanings[data.expressionNumber as keyof typeof numberMeanings];
  const soulUrgeMeaning = numberMeanings[data.soulUrgeNumber as keyof typeof numberMeanings];
  const personalityMeaning = numberMeanings[data.personalityNumber as keyof typeof numberMeanings];
  const birthdayMeaning = numberMeanings[data.birthdayNumber as keyof typeof numberMeanings];
  const maturityMeaning = numberMeanings[data.maturityNumber as keyof typeof numberMeanings];
  const achievementMeaning = numberMeanings[data.achievementNumber as keyof typeof numberMeanings];

  const birthYear = parseInt(data.birthDate.split('-')[0], 10);

  const chartNumbers = [
    { label: 'Birthday', value: data.birthdayNumber, color: '#34d399' },
    { label: 'Personality', value: data.personalityNumber, color: '#22d3ee' },
    { label: "Heart's Desire", value: data.soulUrgeNumber, color: '#fb7185' },
    { label: 'Expression', value: data.expressionNumber, color: '#a78bfa' },
    { label: 'Life Path', value: data.lifePathNumber, color: '#fbbf24' },
    { label: 'Maturity', value: data.maturityNumber, color: '#818cf8' },
    { label: 'Achievement', value: data.achievementNumber, color: '#facc15' },
  ];

  const handleChartClick = (index: number) => {
    const ids = ['birthday', 'personality', 'hearts-desire', 'expression', 'life-path', 'maturity', 'achievement'];
    const el = document.getElementById(`number-card-${ids[index]}`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleDownload = () => {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.width;
    const margin = 20;
    const lineHeight = 6;
    let yPosition = 30;

    const addText = (text: string, fontSize = 10, isBold = false) => {
      pdf.setFontSize(fontSize);
      pdf.setFont(undefined as unknown as string, isBold ? 'bold' : 'normal');
      const lines = pdf.splitTextToSize(text, pageWidth - 2 * margin);
      if (yPosition + (lines.length * lineHeight) > pdf.internal.pageSize.height - margin) {
        pdf.addPage();
        yPosition = 30;
      }
      pdf.text(lines, margin, yPosition);
      yPosition += lines.length * lineHeight + 3;
    };

    addText('Your Complete Cosmic Blueprint', 20, true);
    addText(`Generated for ${data.name}`, 14, true);
    addText(`Date: ${new Date().toLocaleDateString()}`, 12);
    yPosition += 10;

    addText('CORE NUMEROLOGY NUMBERS', 16, true);
    addText(`• Birthday Number: ${data.birthdayNumber} (${birthdayMeaning.title})`);
    addText(`• Personality Number: ${data.personalityNumber} (${personalityMeaning.title})`);
    addText(`• Heart's Desire Number: ${data.soulUrgeNumber} (${soulUrgeMeaning.title})`);
    addText(`• Expression Number: ${data.expressionNumber} (${expressionMeaning.title})`);
    addText(`• Life Path Number: ${data.lifePathNumber} (${lifePathMeaning.title})`);
    addText(`• Maturity Number: ${data.maturityNumber} (${maturityMeaning.title})`);
    addText(`• Achievement Number: ${data.achievementNumber} (${achievementMeaning.title})`);
    addText(`• Hidden Passion: ${data.hiddenPassionNumbers.join(', ')}`);
    addText(`• Karmic Lessons: ${data.karmicLessonNumbers.length > 0 ? data.karmicLessonNumbers.join(', ') : 'None'}`);
    addText(`• Personal Year: ${data.personalYearNumber}`);
    yPosition += 10;

    addText('PERSONAL CYCLES', 16, true);
    addText(`Personal Year: ${data.personalYearNumber} | Personal Month: ${data.personalMonthNumber} | Personal Day: ${data.personalDayNumber}`);
    yPosition += 5;

    addText('PINNACLE NUMBERS', 16, true);
    data.pinnacleNumbers.forEach((p, i) => {
      addText(`Pinnacle ${i + 1} (${p.period}): ${p.number}`);
    });
    yPosition += 5;

    addText('CHALLENGE NUMBERS', 16, true);
    data.challengeNumbers.forEach((ch) => {
      addText(`${ch.period}: ${ch.number}`);
    });
    yPosition += 10;

    const sections = [
      { label: 'BIRTHDAY', meaning: birthdayMeaning, number: data.birthdayNumber, breakdown: data.birthdayBreakdown },
      { label: 'PERSONALITY', meaning: personalityMeaning, number: data.personalityNumber, breakdown: data.personalityBreakdown },
      { label: "HEART'S DESIRE", meaning: soulUrgeMeaning, number: data.soulUrgeNumber, breakdown: data.soulUrgeBreakdown },
      { label: 'EXPRESSION', meaning: expressionMeaning, number: data.expressionNumber, breakdown: data.expressionBreakdown },
      { label: 'LIFE PATH', meaning: lifePathMeaning, number: data.lifePathNumber, breakdown: data.lifePathBreakdown },
      { label: 'MATURITY', meaning: maturityMeaning, number: data.maturityNumber, breakdown: data.maturityBreakdown },
      { label: 'ACHIEVEMENT', meaning: achievementMeaning, number: data.achievementNumber, breakdown: data.achievementBreakdown },
    ];

    addText('DETAILED ANALYSIS', 16, true);
    sections.forEach(({ label, meaning, number, breakdown }) => {
      addText(`${label} NUMBER ${number} — ${meaning.title}`, 14, true);
      addText(meaning.description);
      addText(`Strengths: ${meaning.strengths.join(', ')}`);
      addText(`Challenges: ${meaning.challenges.join(', ')}`);
      addText('Calculation:');
      breakdown.forEach(step => addText(`  ${step}`));
      addText(`Career Paths: ${meaning.careers.join(', ')}`);
      yPosition += 5;
    });

    addText(`© ${new Date().getFullYear()} Luthor Sparks Costello AI Studio 508C1A Church All Rights Reserved and Retained. None Waived.`, 8);
    pdf.save(`${data.name.replace(/\s+/g, '_')}_Cosmic_Blueprint.pdf`);
  };

  return (
    <article className="max-w-4xl mx-auto space-y-8 pb-24">
      {/* Header */}
      <header className="text-center space-y-4">
        <Button
          onClick={onBack}
          variant="ghost"
          className="mb-2 text-amber-400 hover:text-amber-300 hover:bg-amber-500/10"
          id="back-to-form"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          New Report
        </Button>

        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 mb-3 glow-gold">
          <Star className="w-8 h-8 text-white" />
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-white font-heading">
          Your Complete <span className="gold-text">Cosmic Blueprint</span>
        </h1>

        <p className="text-lg text-gray-400">
          Generated for <span className="text-amber-400 font-semibold">{data.name}</span>
        </p>

        <div className="flex justify-center gap-3">
          <Button onClick={handleDownload} className="cosmic-button" id="download-report">
            <Download className="w-4 h-4 mr-2" />
            Download Report
          </Button>
        </div>
      </header>

      {/* Cosmic Chart */}
      <section className="report-card" aria-label="Core numbers overview">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2 font-heading">
          <Target className="w-5 h-5 text-amber-400" />
          Your Seven Core Numbers
        </h2>
        <CosmicChart numbers={chartNumbers} onSegmentClick={handleChartClick} />
        <p className="text-center text-xs text-gray-500 mt-4">Click a segment to jump to that number's analysis</p>
      </section>

      {/* Personal Cycles */}
      <section className="report-card" aria-label="Personal cycles">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2 font-heading">
          <Calendar className="w-5 h-5 text-amber-400" />
          Your Current Cycles
        </h2>
        <PersonalCyclePanel
          personalYear={data.personalYearNumber}
          personalYearBreakdown={data.personalYearBreakdown}
          personalMonth={data.personalMonthNumber}
          personalMonthBreakdown={data.personalMonthBreakdown}
          personalDay={data.personalDayNumber}
          personalDayBreakdown={data.personalDayBreakdown}
        />
      </section>

      {/* Individual Number Cards */}
      <NumberCard number={data.birthdayNumber} label="Birthday" meaning={birthdayMeaning} breakdown={data.birthdayBreakdown} icon={<Calendar className="w-4 h-4" />} colorClass="emerald" description="Special talents and abilities you were born with." />
      <NumberCard number={data.personalityNumber} label="Personality" meaning={personalityMeaning} breakdown={data.personalityBreakdown} icon={<User className="w-4 h-4" />} colorClass="cyan" description="How others perceive you and your outer personality." />
      <NumberCard number={data.soulUrgeNumber} label="Heart's Desire" meaning={soulUrgeMeaning} breakdown={data.soulUrgeBreakdown} icon={<Heart className="w-4 h-4" />} colorClass="rose" description="What motivates you at the deepest level." />

      {/* Email capture after core numbers */}
      <EmailCapture onCapture={() => {}} variant="card" heading="Save Your Cosmic Blueprint" subtext="Enter your email to save this report and receive personalized cosmic insights." />

      <NumberCard number={data.expressionNumber} label="Expression" meaning={expressionMeaning} breakdown={data.expressionBreakdown} icon={<Users className="w-4 h-4" />} colorClass="purple" description="Your life's work and the talents you're meant to develop." />
      <NumberCard number={data.lifePathNumber} label="Life Path" meaning={lifePathMeaning} breakdown={data.lifePathBreakdown} icon={<Star className="w-4 h-4" />} colorClass="amber" description="Your most important number — your cosmic mission." />

      {/* Master Number significance */}
      {isMasterNumber(data.lifePathNumber) && (
        <div className="p-5 rounded-xl bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/20">
          <h3 className="text-base font-semibold text-amber-400 mb-2">✨ Master Number Significance</h3>
          <p className="text-gray-300 text-sm leading-relaxed">
            {masterNumberSignificance[data.lifePathNumber]}
          </p>
        </div>
      )}

      <NumberCard number={data.maturityNumber} label="Maturity" meaning={maturityMeaning} breakdown={data.maturityBreakdown} icon={<Target className="w-4 h-4" />} colorClass="indigo" description="What you're growing toward in later life — your spiritual mission." />
      <NumberCard number={data.achievementNumber} label="Achievement" meaning={achievementMeaning} breakdown={data.achievementBreakdown} icon={<Star className="w-4 h-4" />} colorClass="yellow" description="What you can accomplish by combining your month and day energies." />

      {/* Pinnacle Numbers */}
      <section className="report-card" aria-label="Pinnacle numbers">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2 font-heading">
          <Compass className="w-5 h-5 text-teal-400" />
          Pinnacle Numbers — Your Life Periods
        </h2>
        <p className="text-gray-400 text-sm mb-6">
          Your four Pinnacle periods represent major phases of personal growth, each lasting several years and carrying its own cosmic energy.
        </p>
        <PinnacleTimeline pinnacles={data.pinnacleNumbers} birthYear={birthYear} />
      </section>

      {/* Challenge Numbers */}
      <section className="report-card" aria-label="Challenge numbers">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2 font-heading">
          <Shield className="w-5 h-5 text-orange-400" />
          Challenge Numbers — Your Growth Path
        </h2>
        <p className="text-gray-400 text-sm mb-6">
          Challenge numbers reveal the obstacles you'll face and the lessons you need to learn for spiritual growth.
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          {data.challengeNumbers.map((ch, i) => (
            <div key={i} className="p-4 rounded-xl bg-gradient-to-r from-orange-500/8 to-red-500/8 border border-orange-500/15">
              <div className="flex items-center gap-3 mb-2">
                <span className="w-9 h-9 rounded-lg bg-orange-500/15 flex items-center justify-center text-orange-400 font-display font-bold text-sm">
                  {ch.number}
                </span>
                <div>
                  <div className="text-sm font-semibold text-orange-400">{ch.period}</div>
                  <div className="text-[10px] text-gray-500 font-mono">{ch.breakdown[0]}</div>
                </div>
              </div>
              <p className="text-gray-400 text-xs leading-relaxed">
                {challengeMeanings[ch.number] || challengeMeanings[0]}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Hidden Passion */}
      <section className="report-card" aria-label="Hidden passion numbers">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2 font-heading">
          <Zap className="w-5 h-5 text-orange-400" />
          Hidden Passion: {data.hiddenPassionNumbers.join(', ')}
        </h2>
        <p className="text-gray-400 text-sm mb-5">
          Your dominant trait{data.hiddenPassionNumbers.length > 1 ? 's' : ''} based on the most frequent number{data.hiddenPassionNumbers.length > 1 ? 's' : ''} in your name.
        </p>

        {data.hiddenPassionNumbers.map((num, i) => {
          const meaning = numberMeanings[num as keyof typeof numberMeanings];
          return (
            <div key={i} className="p-4 rounded-xl bg-gradient-to-r from-orange-500/8 to-yellow-500/8 border border-orange-500/15 mb-3">
              <h3 className="text-base font-semibold text-orange-400 mb-2">
                Number {num}: {meaning.title}
              </h3>
              <p className="text-gray-300 text-sm mb-3">{meaning.description}</p>
              <div className="flex flex-wrap gap-1.5">
                {meaning.strengths.slice(0, 4).map((s, si) => (
                  <Badge key={si} className="bg-orange-500/15 text-orange-300 border-orange-500/20 border text-xs">{s}</Badge>
                ))}
              </div>
            </div>
          );
        })}

        {/* Specialized Careers */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/8 to-yellow-500/8 border border-amber-500/15 mt-4">
          <h3 className="text-sm font-semibold text-amber-400 mb-3 flex items-center gap-2 uppercase tracking-wider">
            <DollarSign className="w-4 h-4" />
            Specialized Career Paths
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {data.hiddenPassionCareers.slice(0, 15).map((career, i) => (
              <div key={i} className="text-xs text-gray-300 bg-amber-500/10 rounded-md px-2.5 py-1.5 border border-amber-500/10">
                {career}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Karmic Lessons */}
      <section className="report-card" aria-label="Karmic lesson numbers">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2 font-heading">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          Karmic Lessons: {data.karmicLessonNumbers.length > 0 ? data.karmicLessonNumbers.join(', ') : 'None'}
        </h2>
        <p className="text-gray-400 text-sm mb-5">
          {data.karmicLessonNumbers.length > 0
            ? 'Areas where you may face challenges or lessons for spiritual growth — the numbers missing from your name.'
            : 'All numbers 1-8 are present in your name. This indicates a complete spiritual foundation.'}
        </p>

        {data.karmicLessonNumbers.length > 0 ? (
          <div className="space-y-3">
            {data.karmicLessonNumbers.map((num, i) => {
              const meaning = numberMeanings[num as keyof typeof numberMeanings];
              return (
                <div key={i} className="p-4 rounded-xl bg-gradient-to-r from-red-500/8 to-pink-500/8 border border-red-500/15">
                  <h3 className="text-sm font-semibold text-red-400 mb-2">
                    Lesson {num}: Develop {meaning.title} Qualities
                  </h3>
                  <p className="text-gray-400 text-xs mb-2">{meaning.description}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {meaning.strengths.slice(0, 4).map((s, si) => (
                      <Badge key={si} className="bg-red-500/15 text-red-300 border-red-500/20 border text-xs">{s}</Badge>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-5 rounded-xl bg-gradient-to-r from-emerald-500/8 to-teal-500/8 border border-emerald-500/15">
            <h3 className="text-sm font-semibold text-emerald-400 mb-2">✨ Complete Spiritual Foundation</h3>
            <p className="text-gray-400 text-xs leading-relaxed">
              Having all numbers 1-8 present in your name indicates access to all fundamental spiritual energies.
              Your challenge is to balance and harmonize these energies effectively.
            </p>
          </div>
        )}
      </section>

      {/* Business Insights */}
      <section className="report-card" aria-label="Business insights">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2 font-heading">
          <DollarSign className="w-5 h-5 text-emerald-400" />
          Soul-Aligned Business Insights
        </h2>
        <div className="p-5 rounded-xl bg-gradient-to-br from-purple-500/8 to-pink-500/8 border border-purple-500/15">
          <h3 className="text-sm font-semibold text-purple-400 mb-3 uppercase tracking-wider">🌟 Your Cosmic Business Blueprint</h3>
          <ul className="space-y-2 text-gray-300 text-sm">
            <li>• Use your Birthday gift of <strong className="text-emerald-400">{birthdayMeaning.strengths[0].toLowerCase()}</strong> as a unique selling point</li>
            <li>• Let your <strong className="text-cyan-400">{personalityMeaning.strengths[0].toLowerCase()}</strong> personality attract ideal clients</li>
            <li>• Follow your Heart's Desire for <strong className="text-rose-400">{soulUrgeMeaning.strengths[0].toLowerCase()}</strong> as your core mission</li>
            <li>• Express your natural <strong className="text-purple-400">{expressionMeaning.strengths[0].toLowerCase()}</strong> through your business model</li>
            <li>• Leverage your Life Path <strong className="text-amber-400">{lifePathMeaning.strengths[0].toLowerCase()}</strong> abilities in your marketing</li>
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="report-card text-center" aria-label="Call to action">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 font-heading">
          Ready to Build Your <span className="gold-text">Soul-Aligned Business</span>?
        </h2>
        <p className="text-gray-400 text-sm mb-6 max-w-xl mx-auto">
          This cosmic blueprint reveals your core numbers with detailed calculations, natural talents,
          and career paths. Book a consultation to transform these insights into a thriving business.
        </p>
        <a
          href="https://cal.com/dangeloali/unlock-abundance-with-ai-intuition-a-soul-urged-business-strategy-call"
          target="_blank"
          rel="noopener noreferrer"
          id="book-consultation"
        >
          <Button className="cosmic-button text-base px-8 py-3">
            <Calendar className="w-5 h-5 mr-2" />
            Book a Consultation
          </Button>
        </a>
      </section>
    </article>
  );
};

export default NumerologyReport;
