import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Star, 
  Heart, 
  DollarSign, 
  Users, 
  Lightbulb, 
  Target,
  Download,
  ArrowLeft,
  Calendar,
  User,
  Calculator,
  Zap,
  AlertTriangle
} from 'lucide-react';
import jsPDF from 'jspdf';

interface ReportData {
  name: string;
  email: string;
  birthDate: string;
  lifePathNumber: number;
  lifePathBreakdown: string[];
  expressionNumber: number;
  expressionBreakdown: string[];
  soulUrgeNumber: number;
  soulUrgeBreakdown: string[];
  personalityNumber: number;
  personalityBreakdown: string[];
  birthdayNumber: number;
  birthdayBreakdown: string[];
  maturityNumber: number;
  maturityBreakdown: string[];
  achievementNumber: number;
  achievementBreakdown: string[];
  hiddenPassionNumbers: number[];
  hiddenPassionBreakdown: string[];
  hiddenPassionCareers: string[];
  karmicLessonNumbers: number[];
  karmicLessonBreakdown: string[];
}

interface NumerologyReportProps {
  data: ReportData;
  onBack: () => void;
}

const numberMeanings = {
  1: {
    title: "The Leader",
    description: "Independent, pioneering, and ambitious. Natural born leaders who create their own path.",
    strengths: ["Leadership", "Innovation", "Independence", "Determination", "Initiative", "Confidence"],
    challenges: ["Impatience", "Stubbornness", "Self-centeredness", "Dominance", "Intolerance"],
    careers: ["CEO/Executive", "Entrepreneur", "Sales Leader", "Military Officer", "Politician", "Director", "Consultant", "Team Leader", "Project Manager", "Department Head", "Business Owner", "Marketing Director", "Operations Manager", "Creative Director", "Branch Manager"]
  },
  2: {
    title: "The Diplomat",
    description: "Cooperative, sensitive, and peace-loving. Excel at bringing people together.",
    strengths: ["Cooperation", "Sensitivity", "Diplomacy", "Intuition", "Patience", "Teamwork"],
    challenges: ["Indecisiveness", "Over-sensitivity", "Dependency", "Passivity", "Self-doubt"],
    careers: ["Mediator", "Counselor", "Therapist", "HR Specialist", "Social Worker", "Teacher", "Nurse", "Customer Service", "Administrative Assistant", "Event Coordinator", "Relationship Coach", "Support Staff", "Community Organizer", "Diplomat", "Receptionist"]
  },
  3: {
    title: "The Creative",
    description: "Artistic, expressive, and optimistic. Natural entertainers and communicators.",
    strengths: ["Creativity", "Communication", "Optimism", "Inspiration", "Artistic talent", "Charisma"],
    challenges: ["Scattered energy", "Superficiality", "Mood swings", "Inconsistency", "Lack of focus"],
    careers: ["Artist", "Writer", "Actor", "Designer", "Marketing Specialist", "Public Speaker", "Entertainer", "Journalist", "Creative Director", "Social Media Manager", "Content Creator", "Photographer", "Musician", "Event Planner", "Communications Manager"]
  },
  4: {
    title: "The Builder",
    description: "Practical, hardworking, and reliable. Excel at creating stable foundations.",
    strengths: ["Organization", "Reliability", "Hard work", "Practicality", "Discipline", "Persistence"],
    challenges: ["Rigidity", "Pessimism", "Resistance to change", "Narrow-mindedness", "Stubbornness"],
    careers: ["Engineer", "Accountant", "Project Manager", "Construction Manager", "Financial Planner", "Systems Analyst", "Quality Controller", "Operations Manager", "Architect", "Contractor", "Database Administrator", "Process Improvement Specialist", "Logistics Coordinator", "Technical Specialist", "Administrative Manager"]
  },
  5: {
    title: "The Adventurer",
    description: "Freedom-loving, versatile, and progressive. Thrive on change and variety.",
    strengths: ["Adaptability", "Freedom", "Curiosity", "Progressive thinking", "Versatility", "Adventure"],
    challenges: ["Restlessness", "Irresponsibility", "Inconsistency", "Impatience", "Lack of commitment"],
    careers: ["Travel Agent", "Sales Representative", "Journalist", "Marketing Manager", "Event Coordinator", "Freelancer", "Consultant", "Tour Guide", "Flight Attendant", "Real Estate Agent", "Public Relations", "Social Media Influencer", "Adventure Guide", "Import/Export Specialist", "Change Management Consultant"]
  },
  6: {
    title: "The Nurturer",
    description: "Caring, responsible, and community-minded. Natural healers and teachers.",
    strengths: ["Nurturing", "Responsibility", "Healing", "Service", "Compassion", "Family-oriented"],
    challenges: ["Interference", "Worry", "Self-sacrifice", "Perfectionism", "Overprotectiveness"],
    careers: ["Teacher", "Healthcare Worker", "Social Worker", "Counselor", "Childcare Provider", "Veterinarian", "Non-profit Director", "Community Leader", "Family Therapist", "Nutritionist", "Elder Care Specialist", "School Administrator", "Mental Health Professional", "Charity Worker", "Home Designer"]
  },
  7: {
    title: "The Seeker",
    description: "Analytical, spiritual, and introspective. Deep thinkers who seek truth.",
    strengths: ["Analysis", "Spirituality", "Intuition", "Research", "Wisdom", "Independence"],
    challenges: ["Aloofness", "Perfectionism", "Skepticism", "Isolation", "Overthinking"],
    careers: ["Researcher", "Scientist", "Analyst", "Spiritual Advisor", "Writer", "Professor", "Investigator", "Philosopher", "Psychologist", "Data Scientist", "Librarian", "Technical Writer", "Quality Assurance", "Strategic Planner", "Market Research Analyst"]
  },
  8: {
    title: "The Achiever",
    description: "Ambitious, material-focused, and authoritative. Natural business leaders.",
    strengths: ["Business acumen", "Organization", "Material success", "Authority", "Ambition", "Management"],
    challenges: ["Materialism", "Workaholism", "Impatience", "Ruthahlessness", "Power struggles"],
    careers: ["Business Executive", "Financial Advisor", "Investment Banker", "Real Estate Developer", "Corporate Lawyer", "Management Consultant", "Business Owner", "Sales Director", "Banking Executive", "Wealth Manager", "Commercial Real Estate", "Venture Capitalist", "Business Analyst", "Corporate Strategist", "Mergers & Acquisitions"]
  },
  9: {
    title: "The Humanitarian",
    description: "Compassionate, generous, and globally-minded. Serve the greater good.",
    strengths: ["Compassion", "Generosity", "Universal love", "Wisdom", "Humanitarian spirit", "Tolerance"],
    challenges: ["Idealism", "Emotional volatility", "Impracticality", "Martyrdom", "Disappointment"],
    careers: ["Non-profit Leader", "International Aid Worker", "Environmental Activist", "Human Rights Advocate", "Global Health Worker", "Peace Corps Volunteer", "Charity Director", "Social Justice Lawyer", "Community Organizer", "Philanthropist", "Cultural Ambassador", "Humanitarian Coordinator", "Policy Advocate", "Global Development Specialist", "Environmental Consultant"]
  },
  11: {
    title: "The Master Intuitive",
    description: "Highly intuitive, spiritual, and inspirational. Master number with extraordinary potential for enlightenment and leadership.",
    strengths: ["Intuition", "Inspiration", "Spiritual insight", "Visionary leadership", "Psychic abilities", "Enlightenment"],
    challenges: ["Nervous tension", "Impracticality", "Emotional extremes", "Overwhelm", "Self-doubt"],
    careers: ["Spiritual Teacher", "Inspirational Speaker", "Healer", "Psychic Advisor", "Life Coach", "Motivational Speaker", "Spiritual Counselor", "Energy Healer", "Meditation Instructor", "Wellness Coach", "Intuitive Consultant", "Transformational Leader", "Consciousness Coach", "Spiritual Writer", "Enlightenment Teacher"]
  },
  22: {
    title: "The Master Builder",
    description: "Combines vision with practical skills to create lasting impact. Master number with potential to build something of great significance.",
    strengths: ["Visionary building", "Practical idealism", "Large-scale thinking", "Material mastery", "System building", "Global impact"],
    challenges: ["Overwhelming pressure", "Self-doubt", "Scattered focus", "Burnout", "Unrealistic expectations"],
    careers: ["Visionary CEO", "Social Entrepreneur", "Global Organization Leader", "Large Project Director", "Systems Architect", "International Business Leader", "Social Impact Investor", "Transformational Change Agent", "Global Initiative Director", "Master Builder", "Social Innovation Leader", "International Development Director", "Large-Scale Consultant", "Global Strategy Director", "World-Changing Entrepreneur"]
  },
  33: {
    title: "The Spiritual Teacher",
    description: "The most influential of all numbers, with extraordinary healing and teaching abilities. Dedicated to uplifting humanity through spiritual service.",
    strengths: ["Spiritual healing", "Universal teaching", "Compassionate service", "Divine guidance", "Unconditional love", "Enlightened wisdom"],
    challenges: ["Overwhelming responsibility", "Emotional sacrifice", "Burnout from giving", "Perfectionism", "Martyrdom complex"],
    careers: ["Spiritual Healer", "Master Teacher", "Humanitarian Leader", "Spiritual Guide", "Divine Channel", "Compassionate Healer", "Universal Teacher", "Enlightened Leader", "Spiritual Counselor", "Sacred Service Provider", "Divine Messenger", "Transformational Healer", "Spiritual Mentor", "Consciousness Facilitator", "Divine Service Leader"]
  },
  44: {
    title: "The Master Teacher",
    description: "Combines spiritual wisdom with material mastery to create transformational systems that benefit humanity on a global scale.",
    strengths: ["System mastery", "Transformational teaching", "Global influence", "Practical spirituality", "Material-spiritual balance", "Universal impact"],
    challenges: ["Overwhelming expectations", "Material-spiritual conflict", "System limitations", "Global pressure", "Perfectionist standards"],
    careers: ["Global Systems Leader", "Transformational Educator", "Universal Teacher", "Master Architect", "Global Change Agent", "System Transformer", "World Teacher", "Universal Builder", "Global Healer", "Master Facilitator", "System Innovator", "Global Mentor", "Universal Guide", "Master Strategist", "Global Visionary"]
  },
  55: {
    title: "The Master Liberator", 
    description: "Represents ultimate freedom and liberation, breaking through all limitations to achieve complete spiritual and material mastery.",
    strengths: ["Ultimate freedom", "Liberation mastery", "Limitless potential", "Revolutionary change", "Transcendent wisdom", "Universal liberation"],
    challenges: ["Restless energy", "Revolutionary extremes", "Freedom addiction", "Responsibility avoidance", "Scattered focus"],
    careers: ["Revolutionary Leader", "Freedom Fighter", "Liberation Teacher", "Change Revolutionary", "Freedom Advocate", "Liberation Guide", "Revolutionary Healer", "Freedom Coach", "Liberation Consultant", "Change Catalyst", "Freedom Facilitator", "Revolutionary Mentor", "Liberation Leader", "Freedom Visionary", "Revolutionary Guide"]
  }
};

const NumerologyReport = ({ data, onBack }: NumerologyReportProps) => {
  const lifePathMeaning = numberMeanings[data.lifePathNumber as keyof typeof numberMeanings];
  const expressionMeaning = numberMeanings[data.expressionNumber as keyof typeof numberMeanings];
  const soulUrgeMeaning = numberMeanings[data.soulUrgeNumber as keyof typeof numberMeanings];
  const personalityMeaning = numberMeanings[data.personalityNumber as keyof typeof numberMeanings];
  const birthdayMeaning = numberMeanings[data.birthdayNumber as keyof typeof numberMeanings];
  const maturityMeaning = numberMeanings[data.maturityNumber as keyof typeof numberMeanings];
  const achievementMeaning = numberMeanings[data.achievementNumber as keyof typeof numberMeanings];

  const handleDownload = () => {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.width;
    const margin = 20;
    const lineHeight = 6;
    let yPosition = 30;

    // Helper function to add text with word wrapping
    const addText = (text: string, fontSize = 10, isBold = false) => {
      pdf.setFontSize(fontSize);
      if (isBold) {
        pdf.setFont(undefined, 'bold');
      } else {
        pdf.setFont(undefined, 'normal');
      }
      
      const lines = pdf.splitTextToSize(text, pageWidth - 2 * margin);
      
      // Check if we need a new page
      if (yPosition + (lines.length * lineHeight) > pdf.internal.pageSize.height - margin) {
        pdf.addPage();
        yPosition = 30;
      }
      
      pdf.text(lines, margin, yPosition);
      yPosition += lines.length * lineHeight + 3;
    };

    // Title
    addText('Your Complete Cosmic Blueprint', 20, true);
    addText(`Generated for ${data.name}`, 14, true);
    addText(`Date: ${new Date().toLocaleDateString()}`, 12);
    yPosition += 10;

    // Core Numbers
    addText('CORE NUMEROLOGY NUMBERS', 16, true);
    addText(`• Birthday Number: ${data.birthdayNumber} (${birthdayMeaning.title})`);
    addText(`• Personality Number: ${data.personalityNumber} (${personalityMeaning.title})`);
    addText(`• Heart's Desire Number: ${data.soulUrgeNumber} (${soulUrgeMeaning.title})`);
    addText(`• Expression Number: ${data.expressionNumber} (${expressionMeaning.title})`);
    addText(`• Life Path Number: ${data.lifePathNumber} (${lifePathMeaning.title})`);
    addText(`• Maturity Number: ${data.maturityNumber} (${maturityMeaning.title})`);
    addText(`• Achievement Number: ${data.achievementNumber} (${achievementMeaning.title})`);
    addText(`• Hidden Passion Number${data.hiddenPassionNumbers.length > 1 ? 's' : ''}: ${data.hiddenPassionNumbers.join(', ')}`);
    addText(`• Karmic Lesson Number${data.karmicLessonNumbers.length > 1 ? 's' : ''}: ${data.karmicLessonNumbers.length > 0 ? data.karmicLessonNumbers.join(', ') : 'None'}`);
    yPosition += 10;

    // Calculation Breakdowns
    addText('CALCULATION BREAKDOWNS', 16, true);
    
    addText('Birthday Number Calculation:', 12, true);
    data.birthdayBreakdown.forEach(step => addText(step));
    yPosition += 5;

    addText('Personality Number Calculation:', 12, true);
    data.personalityBreakdown.forEach(step => addText(step));
    yPosition += 5;

    addText("Heart's Desire Number Calculation:", 12, true);
    data.soulUrgeBreakdown.forEach(step => addText(step));
    yPosition += 5;

    addText('Expression Number Calculation:', 12, true);
    data.expressionBreakdown.forEach(step => addText(step));
    yPosition += 5;

    addText('Life Path Number Calculation:', 12, true);
    data.lifePathBreakdown.forEach(step => addText(step));
    yPosition += 5;

    addText('Maturity Number Calculation:', 12, true);
    data.maturityBreakdown.forEach(step => addText(step));
    yPosition += 5;

    addText('Achievement Number Calculation:', 12, true);
    data.achievementBreakdown.forEach(step => addText(step));
    yPosition += 5;

    addText('Hidden Passion Number Calculation:', 12, true);
    data.hiddenPassionBreakdown.forEach(step => addText(step));
    yPosition += 5;

    addText('Karmic Lesson Numbers Calculation:', 12, true);
    data.karmicLessonBreakdown.forEach(step => addText(step));
    yPosition += 10;

    // Detailed Analysis
    addText('DETAILED ANALYSIS', 16, true);

    // Birthday Number Analysis
    addText(`BIRTHDAY NUMBER - ${birthdayMeaning.title}`, 14, true);
    addText(birthdayMeaning.description);
    addText(`Natural Talents: ${birthdayMeaning.strengths.join(', ')}`);
    addText(`Areas to Develop: ${birthdayMeaning.challenges.join(', ')}`);
    yPosition += 5;

    // Personality Number Analysis
    addText(`PERSONALITY NUMBER - ${personalityMeaning.title}`, 14, true);
    addText(personalityMeaning.description);
    addText(`Natural Talents: ${personalityMeaning.strengths.join(', ')}`);
    addText(`Areas to Develop: ${personalityMeaning.challenges.join(', ')}`);
    yPosition += 5;

    // Heart's Desire Number Analysis
    addText(`HEART'S DESIRE NUMBER - ${soulUrgeMeaning.title}`, 14, true);
    addText(soulUrgeMeaning.description);
    addText(`Natural Talents: ${soulUrgeMeaning.strengths.join(', ')}`);
    addText(`Areas to Develop: ${soulUrgeMeaning.challenges.join(', ')}`);
    yPosition += 5;

    // Expression Number Analysis
    addText(`EXPRESSION NUMBER - ${expressionMeaning.title}`, 14, true);
    addText(expressionMeaning.description);
    addText(`Natural Talents: ${expressionMeaning.strengths.join(', ')}`);
    addText(`Areas to Develop: ${expressionMeaning.challenges.join(', ')}`);
    yPosition += 5;

    // Life Path Number Analysis
    addText(`LIFE PATH NUMBER - ${lifePathMeaning.title}`, 14, true);
    addText(lifePathMeaning.description);
    addText(`Natural Talents: ${lifePathMeaning.strengths.join(', ')}`);
    addText(`Areas to Develop: ${lifePathMeaning.challenges.join(', ')}`);
    yPosition += 5;

    // Maturity Number Analysis
    addText(`MATURITY NUMBER - ${maturityMeaning.title}`, 14, true);
    addText(maturityMeaning.description);
    addText(`Natural Talents: ${maturityMeaning.strengths.join(', ')}`);
    addText(`Areas to Develop: ${maturityMeaning.challenges.join(', ')}`);
    yPosition += 5;

    // Achievement Number Analysis
    addText(`ACHIEVEMENT NUMBER - ${achievementMeaning.title}`, 14, true);
    addText(achievementMeaning.description);
    addText(`Natural Talents: ${achievementMeaning.strengths.join(', ')}`);
    addText(`Areas to Develop: ${achievementMeaning.challenges.join(', ')}`);
    yPosition += 5;

    // Hidden Passion Numbers Analysis
    addText(`HIDDEN PASSION NUMBER${data.hiddenPassionNumbers.length > 1 ? 'S' : ''}`, 14, true);
    data.hiddenPassionNumbers.forEach(num => {
      const meaning = numberMeanings[num as keyof typeof numberMeanings];
      addText(`Number ${num} - ${meaning.title}`);
      addText(meaning.description);
      addText(`Natural Talents: ${meaning.strengths.join(', ')}`);
      addText(`Areas to Develop: ${meaning.challenges.join(', ')}`);
      yPosition += 3;
    });
    yPosition += 5;

    // Karmic Lesson Numbers Analysis
    addText(`KARMIC LESSON NUMBERS`, 14, true);
    if (data.karmicLessonNumbers.length > 0) {
      data.karmicLessonNumbers.forEach(num => {
        const meaning = numberMeanings[num as keyof typeof numberMeanings];
        addText(`Number ${num} - Develop ${meaning.title} Qualities`);
        addText(`Focus on developing: ${meaning.strengths.join(', ')}`);
        yPosition += 3;
      });
    } else {
      addText('You have no Karmic Lesson Numbers - all numbers 1-8 are present in your name.');
      addText('This indicates a complete spiritual foundation and well-rounded development.');
    }
    yPosition += 10;

    // Career Paths
    addText('IDEAL CAREER PATHS', 16, true);

    addText(`Birthday Number ${data.birthdayNumber} Careers:`, 12, true);
    birthdayMeaning.careers.forEach(career => addText(`• ${career}`));
    yPosition += 5;

    addText(`Personality Number ${data.personalityNumber} Careers:`, 12, true);
    personalityMeaning.careers.forEach(career => addText(`• ${career}`));
    yPosition += 5;

    addText(`Heart's Desire Number ${data.soulUrgeNumber} Careers:`, 12, true);
    soulUrgeMeaning.careers.forEach(career => addText(`• ${career}`));
    yPosition += 5;

    addText(`Expression Number ${data.expressionNumber} Careers:`, 12, true);
    expressionMeaning.careers.forEach(career => addText(`• ${career}`));
    yPosition += 5;

    addText(`Life Path Number ${data.lifePathNumber} Careers:`, 12, true);
    lifePathMeaning.careers.forEach(career => addText(`• ${career}`));
    yPosition += 5;

    addText(`Maturity Number ${data.maturityNumber} Careers:`, 12, true);
    maturityMeaning.careers.forEach(career => addText(`• ${career}`));
    yPosition += 5;

    addText(`Achievement Number ${data.achievementNumber} Careers:`, 12, true);
    achievementMeaning.careers.forEach(career => addText(`• ${career}`));
    yPosition += 5;

    addText(`Hidden Passion Number${data.hiddenPassionNumbers.length > 1 ? 's' : ''} ${data.hiddenPassionNumbers.join(', ')} Specialized Careers:`, 12, true);
    data.hiddenPassionCareers.slice(0, 15).forEach(career => addText(`• ${career}`));
    yPosition += 10;

    // Footer
    addText(`© ${new Date().getFullYear()} Dangelo Ali Ministry All Rights Reserved and Retained.`, 8);

    // Save the PDF
    pdf.save(`${data.name.replace(/\s+/g, '_')}_Complete_Cosmic_Blueprint_Report.pdf`);
    
    console.log('Complete numerology report downloaded as PDF successfully');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <Button
          onClick={onBack}
          variant="ghost"
          className="mb-4 text-amber-400 hover:text-amber-300"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Form
        </Button>
        
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 mb-4">
          <Star className="w-10 h-10 text-white" />
        </div>
        
        <h1 className="text-4xl font-bold text-white cosmic-text">
          Your Complete <span className="gold-text">Cosmic Blueprint</span>
        </h1>
        
        <p className="text-xl text-gray-300">
          Generated for <span className="text-amber-400 font-semibold">{data.name}</span>
        </p>
        
        <div className="flex justify-center mt-6">
          <Button onClick={handleDownload} className="cosmic-button">
            <Download className="w-4 h-4 mr-2" />
            Download Complete Report
          </Button>
        </div>
      </div>

      {/* Core Numbers Overview */}
      <Card className="report-card">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <Target className="w-6 h-6 text-amber-400" />
          Your Seven Core Numbers
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <div className="text-center p-4 rounded-xl bg-gradient-to-b from-green-500/10 to-transparent border border-green-500/20">
            <div className="text-3xl font-bold text-green-400 mb-2">{data.birthdayNumber}</div>
            <div className="text-sm text-gray-300">Birthday</div>
            {(data.birthdayNumber === 11 || data.birthdayNumber === 22 || data.birthdayNumber === 33 || data.birthdayNumber === 44 || data.birthdayNumber === 55) && (
              <div className="text-xs text-green-300 mt-1">Master Number</div>
            )}
          </div>
          <div className="text-center p-4 rounded-xl bg-gradient-to-b from-blue-500/10 to-transparent border border-blue-500/20">
            <div className="text-3xl font-bold text-blue-400 mb-2">{data.personalityNumber}</div>
            <div className="text-sm text-gray-300">Personality</div>
            {(data.personalityNumber === 11 || data.personalityNumber === 22 || data.personalityNumber === 33 || data.personalityNumber === 44 || data.personalityNumber === 55) && (
              <div className="text-xs text-blue-300 mt-1">Master Number</div>
            )}
          </div>
          <div className="text-center p-4 rounded-xl bg-gradient-to-b from-pink-500/10 to-transparent border border-pink-500/20">
            <div className="text-3xl font-bold text-pink-400 mb-2">{data.soulUrgeNumber}</div>
            <div className="text-sm text-gray-300">Heart's Desire</div>
            {(data.soulUrgeNumber === 11 || data.soulUrgeNumber === 22 || data.soulUrgeNumber === 33 || data.soulUrgeNumber === 44 || data.soulUrgeNumber === 55) && (
              <div className="text-xs text-pink-300 mt-1">Master Number</div>
            )}
          </div>
          <div className="text-center p-4 rounded-xl bg-gradient-to-b from-purple-500/10 to-transparent border border-purple-500/20">
            <div className="text-3xl font-bold text-purple-400 mb-2">{data.expressionNumber}</div>
            <div className="text-sm text-gray-300">Expression</div>
            {(data.expressionNumber === 11 || data.expressionNumber === 22 || data.expressionNumber === 33 || data.expressionNumber === 44 || data.expressionNumber === 55) && (
              <div className="text-xs text-purple-300 mt-1">Master Number</div>
            )}
          </div>
          <div className="text-center p-4 rounded-xl bg-gradient-to-b from-amber-500/10 to-transparent border border-amber-500/20">
            <div className="text-3xl font-bold text-amber-400 mb-2">{data.lifePathNumber}</div>
            <div className="text-sm text-gray-300">Life Path</div>
            {(data.lifePathNumber === 11 || data.lifePathNumber === 22 || data.lifePathNumber === 33 || data.lifePathNumber === 44 || data.lifePathNumber === 55) && (
              <div className="text-xs text-amber-300 mt-1">Master Number</div>
            )}
          </div>
          <div className="text-center p-4 rounded-xl bg-gradient-to-b from-indigo-500/10 to-transparent border border-indigo-500/20">
            <div className="text-3xl font-bold text-indigo-400 mb-2">{data.maturityNumber}</div>
            <div className="text-sm text-gray-300">Maturity</div>
            {(data.maturityNumber === 11 || data.maturityNumber === 22 || data.maturityNumber === 33 || data.maturityNumber === 44 || data.maturityNumber === 55) && (
              <div className="text-xs text-indigo-300 mt-1">Master Number</div>
            )}
          </div>
          <div className="text-center p-4 rounded-xl bg-gradient-to-b from-yellow-500/10 to-transparent border border-yellow-500/20">
            <div className="text-3xl font-bold text-yellow-400 mb-2">{data.achievementNumber}</div>
            <div className="text-sm text-gray-300">Achievement</div>
            {(data.achievementNumber === 11 || data.achievementNumber === 22 || data.achievementNumber === 33 || data.achievementNumber === 44 || data.achievementNumber === 55) && (
              <div className="text-xs text-yellow-300 mt-1">Master Number</div>
            )}
          </div>
        </div>
      </Card>

      {/* Birthday Number Analysis */}
      <Card className="report-card">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-emerald-400" />
          Birthday Number {data.birthdayNumber}: {birthdayMeaning.title}
          {(data.birthdayNumber === 11 || data.birthdayNumber === 22 || data.birthdayNumber === 33 || data.birthdayNumber === 44 || data.birthdayNumber === 55) && (
            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 ml-2">
              Master Number
            </Badge>
          )}
        </h2>
        
        <div className="space-y-6">
          <p className="text-gray-300 text-lg leading-relaxed">
            Special talents and abilities you were born with. {birthdayMeaning.description}
          </p>

          {/* Calculation Breakdown */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/20">
            <h3 className="text-lg font-semibold text-emerald-400 mb-3 flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              How We Calculated Your Birthday Number
            </h3>
            <div className="space-y-1 text-gray-300 font-mono text-sm">
              {data.birthdayBreakdown.map((step, index) => (
                <div key={index}>{step}</div>
              ))}
            </div>
          </div>

          {/* Natural Talents and Development Areas */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/20">
              <h3 className="text-lg font-semibold text-emerald-400 mb-3">Natural Talents</h3>
              <div className="flex flex-wrap gap-2">
                {birthdayMeaning.strengths.map((strength, index) => (
                  <Badge key={index} className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                    {strength}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="p-4 rounded-xl bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20">
              <h3 className="text-lg font-semibold text-orange-400 mb-3">Areas to Develop</h3>
              <div className="flex flex-wrap gap-2">
                {birthdayMeaning.challenges.map((challenge, index) => (
                  <Badge key={index} className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                    {challenge}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Career Paths */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
            <h3 className="text-lg font-semibold text-emerald-400 mb-3 flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              15 Ideal Career Paths
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {birthdayMeaning.careers.map((career, index) => (
                <div key={index} className="text-sm text-gray-300 bg-emerald-500/10 rounded px-2 py-1">
                  {career}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Personality Number */}
      <Card className="report-card">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <User className="w-6 h-6 text-cyan-400" />
          Personality Number {data.personalityNumber}: {personalityMeaning.title}
          {(data.personalityNumber === 11 || data.personalityNumber === 22 || data.personalityNumber === 33 || data.personalityNumber === 44 || data.personalityNumber === 55) && (
            <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 ml-2">
              Master Number
            </Badge>
          )}
        </h2>
        
        <div className="space-y-6">
          <p className="text-gray-300 text-lg leading-relaxed">
            How others perceive you and your outer personality. {personalityMeaning.description}
          </p>

          {/* Calculation Breakdown */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20">
            <h3 className="text-lg font-semibold text-cyan-400 mb-3 flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              How We Calculated Your Personality Number
            </h3>
            <div className="space-y-1 text-gray-300 font-mono text-sm">
              {data.personalityBreakdown.map((step, index) => (
                <div key={index}>{step}</div>
              ))}
            </div>
          </div>

          {/* Natural Talents and Development Areas */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20">
              <h3 className="text-lg font-semibold text-cyan-400 mb-3">Natural Talents</h3>
              <div className="flex flex-wrap gap-2">
                {personalityMeaning.strengths.map((strength, index) => (
                  <Badge key={index} className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                    {strength}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="p-4 rounded-xl bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20">
              <h3 className="text-lg font-semibold text-orange-400 mb-3">Areas to Develop</h3>
              <div className="flex flex-wrap gap-2">
                {personalityMeaning.challenges.map((challenge, index) => (
                  <Badge key={index} className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                    {challenge}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Career Paths */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-500/10 to-teal-500/10 border border-cyan-500/20">
            <h3 className="text-lg font-semibold text-cyan-400 mb-3 flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              15 Ideal Career Paths
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {personalityMeaning.careers.map((career, index) => (
                <div key={index} className="text-sm text-gray-300 bg-cyan-500/10 rounded px-2 py-1">
                  {career}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Heart's Desire Number */}
      <Card className="report-card">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <Heart className="w-6 h-6 text-rose-400" />
          Heart's Desire Number {data.soulUrgeNumber}: {soulUrgeMeaning.title}
          {(data.soulUrgeNumber === 11 || data.soulUrgeNumber === 22 || data.soulUrgeNumber === 33 || data.soulUrgeNumber === 44 || data.soulUrgeNumber === 55) && (
            <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/30 ml-2">
              Master Number
            </Badge>
          )}
        </h2>
        
        <div className="space-y-6">
          <p className="text-gray-300 text-lg leading-relaxed">
            Your Heart's Desire - what motivates you at the deepest level. {soulUrgeMeaning.description}
          </p>

          {/* Calculation Breakdown */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-rose-500/10 to-pink-500/10 border border-rose-500/20">
            <h3 className="text-lg font-semibold text-rose-400 mb-3 flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              How We Calculated Your Heart's Desire Number
            </h3>
            <div className="space-y-1 text-gray-300 font-mono text-sm">
              {data.soulUrgeBreakdown.map((step, index) => (
                <div key={index}>{step}</div>
              ))}
            </div>
          </div>

          {/* Natural Talents and Development Areas */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-gradient-to-r from-rose-500/10 to-pink-500/10 border border-rose-500/20">
              <h3 className="text-lg font-semibold text-rose-400 mb-3">Natural Talents</h3>
              <div className="flex flex-wrap gap-2">
                {soulUrgeMeaning.strengths.map((strength, index) => (
                  <Badge key={index} className="bg-rose-500/20 text-rose-300 border-rose-500/30">
                    {strength}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="p-4 rounded-xl bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20">
              <h3 className="text-lg font-semibold text-orange-400 mb-3">Areas to Develop</h3>
              <div className="flex flex-wrap gap-2">
                {soulUrgeMeaning.challenges.map((challenge, index) => (
                  <Badge key={index} className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                    {challenge}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Career Paths */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-rose-500/10 to-pink-500/10 border border-rose-500/20">
            <h3 className="text-lg font-semibold text-rose-400 mb-3 flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              15 Ideal Career Paths
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {soulUrgeMeaning.careers.map((career, index) => (
                <div key={index} className="text-sm text-gray-300 bg-rose-500/10 rounded px-2 py-1">
                  {career}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Expression Number Analysis */}
      <Card className="report-card">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <Users className="w-6 h-6 text-purple-400" />
          Expression Number {data.expressionNumber}: {expressionMeaning.title}
          {(data.expressionNumber === 11 || data.expressionNumber === 22 || data.expressionNumber === 33 || data.expressionNumber === 44 || data.expressionNumber === 55) && (
            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 ml-2">
              Master Number
            </Badge>
          )}
        </h2>
        
        <div className="space-y-6">
          <p className="text-gray-300 text-lg leading-relaxed">
            Your Expression Number reveals your life's work and the talents you're meant to develop. 
            {expressionMeaning.description}
          </p>

          {/* Calculation Breakdown */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/20">
            <h3 className="text-lg font-semibold text-purple-400 mb-3 flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              How We Calculated Your Expression Number
            </h3>
            <div className="space-y-1 text-gray-300 font-mono text-sm">
              {data.expressionBreakdown.map((step, index) => (
                <div key={index}>{step}</div>
              ))}
            </div>
          </div>
          
          {/* Natural Talents and Development Areas */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
              <h3 className="text-lg font-semibold text-purple-400 mb-3">Natural Talents</h3>
              <div className="flex flex-wrap gap-2">
                {expressionMeaning.strengths.map((strength, index) => (
                  <Badge key={index} className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                    {strength}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="p-4 rounded-xl bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20">
              <h3 className="text-lg font-semibold text-orange-400 mb-3">Areas to Develop</h3>
              <div className="flex flex-wrap gap-2">
                {expressionMeaning.challenges.map((challenge, index) => (
                  <Badge key={index} className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                    {challenge}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Career Paths */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/20">
            <h3 className="text-lg font-semibold text-purple-400 mb-3 flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              15 Ideal Career Paths
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {expressionMeaning.careers.map((career, index) => (
                <div key={index} className="text-sm text-gray-300 bg-purple-500/10 rounded px-2 py-1">
                  {career}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Life Path Analysis */}
      <Card className="report-card">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <Star className="w-6 h-6 text-amber-400" />
          Life Path Number {data.lifePathNumber}: {lifePathMeaning.title}
          {(data.lifePathNumber === 11 || data.lifePathNumber === 22 || data.lifePathNumber === 33 || data.lifePathNumber === 44 || data.lifePathNumber === 55) && (
            <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 ml-2">
              Master Number
            </Badge>
          )}
        </h2>
        
        <div className="space-y-6">
          <p className="text-gray-300 text-lg leading-relaxed">
            {lifePathMeaning.description}
          </p>
          
          {(data.lifePathNumber === 11 || data.lifePathNumber === 22 || data.lifePathNumber === 33 || data.lifePathNumber === 44 || data.lifePathNumber === 55) && (
            <div className="p-6 rounded-xl bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/20">
              <h3 className="text-lg font-semibold text-amber-400 mb-3">✨ Master Number Significance</h3>
              <p className="text-gray-300">
                {data.lifePathNumber === 11 
                  ? "As a Master 11, you carry the potential for profound spiritual insight and the ability to inspire others. Your path involves developing your intuitive gifts while staying grounded in practical reality."
                  : "As a Master 22, you have the rare combination of visionary insight and practical building skills. Your mission is to turn big dreams into tangible reality that benefits humanity."
                }
              </p>
            </div>
          )}

          {/* Calculation Breakdown */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
            <h3 className="text-lg font-semibold text-amber-400 mb-3 flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              How We Calculated Your Life Path Number
            </h3>
            <div className="space-y-1 text-gray-300 font-mono text-sm">
              {data.lifePathBreakdown.map((step, index) => (
                <div key={index}>{step}</div>
              ))}
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-amber-400 flex items-center gap-2">
                <Star className="w-5 h-5" />
                Natural Talents
              </h3>
              <div className="flex flex-wrap gap-2">
                {lifePathMeaning.strengths.map((strength, index) => (
                  <Badge key={index} className="bg-amber-500/20 text-amber-300 border-amber-500/30">
                    {strength}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-red-400 flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                Areas to Develop
              </h3>
              <div className="flex flex-wrap gap-2">
                {lifePathMeaning.challenges.map((challenge, index) => (
                  <Badge key={index} className="bg-red-500/20 text-red-300 border-red-500/30">
                    {challenge}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Career Paths */}
          <div className="p-6 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
            <h3 className="text-lg font-semibold text-amber-400 mb-3 flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              15 Ideal Career Paths
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {lifePathMeaning.careers.map((career, index) => (
                <div key={index} className="text-sm text-gray-300 bg-amber-500/10 rounded px-2 py-1">
                  {career}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Maturity Number Analysis */}
      <Card className="report-card">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <Target className="w-6 h-6 text-indigo-400" />
          Maturity Number {data.maturityNumber}: {maturityMeaning.title}
          {(data.maturityNumber === 11 || data.maturityNumber === 22 || data.maturityNumber === 33 || data.maturityNumber === 44 || data.maturityNumber === 55) && (
            <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 ml-2">
              Master Number
            </Badge>
          )}
        </h2>
        
        <div className="space-y-6">
          <p className="text-gray-300 text-lg leading-relaxed">
            Your Maturity Number reveals what you're growing toward in later life and represents your spiritual mission. {maturityMeaning.description}
          </p>

          {/* Calculation Breakdown */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-500/10 to-violet-500/10 border border-indigo-500/20">
            <h3 className="text-lg font-semibold text-indigo-400 mb-3 flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              How We Calculated Your Maturity Number
            </h3>
            <div className="space-y-1 text-gray-300 font-mono text-sm">
              {data.maturityBreakdown.map((step, index) => (
                <div key={index}>{step}</div>
              ))}
            </div>
          </div>

          {/* Natural Talents and Development Areas */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-500/10 to-violet-500/10 border border-indigo-500/20">
              <h3 className="text-lg font-semibold text-indigo-400 mb-3">Natural Talents</h3>
              <div className="flex flex-wrap gap-2">
                {maturityMeaning.strengths.map((strength, index) => (
                  <Badge key={index} className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30">
                    {strength}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="p-4 rounded-xl bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20">
              <h3 className="text-lg font-semibold text-orange-400 mb-3">Areas to Develop</h3>
              <div className="flex flex-wrap gap-2">
                {maturityMeaning.challenges.map((challenge, index) => (
                  <Badge key={index} className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                    {challenge}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Career Paths */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-500/10 to-violet-500/10 border border-indigo-500/20">
            <h3 className="text-lg font-semibold text-indigo-400 mb-3 flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              15 Ideal Career Paths
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {maturityMeaning.careers.map((career, index) => (
                <div key={index} className="text-sm text-gray-300 bg-indigo-500/10 rounded px-2 py-1">
                  {career}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Achievement Number Analysis */}
      <Card className="report-card">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <Star className="w-6 h-6 text-yellow-400" />
          Achievement Number {data.achievementNumber}: {achievementMeaning.title}
          {(data.achievementNumber === 11 || data.achievementNumber === 22 || data.achievementNumber === 33 || data.achievementNumber === 44 || data.achievementNumber === 55) && (
            <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 ml-2">
              Master Number
            </Badge>
          )}
        </h2>
        
        <div className="space-y-6">
          <p className="text-gray-300 text-lg leading-relaxed">
            Your Achievement Number shows what you can accomplish when you combine your month and day energies. {achievementMeaning.description}
          </p>

          {/* Calculation Breakdown */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/20">
            <h3 className="text-lg font-semibold text-yellow-400 mb-3 flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              How We Calculated Your Achievement Number
            </h3>
            <div className="space-y-1 text-gray-300 font-mono text-sm">
              {data.achievementBreakdown.map((step, index) => (
                <div key={index}>{step}</div>
              ))}
            </div>
          </div>

          {/* Natural Talents and Development Areas */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/20">
              <h3 className="text-lg font-semibold text-yellow-400 mb-3">Natural Talents</h3>
              <div className="flex flex-wrap gap-2">
                {achievementMeaning.strengths.map((strength, index) => (
                  <Badge key={index} className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                    {strength}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="p-4 rounded-xl bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20">
              <h3 className="text-lg font-semibold text-orange-400 mb-3">Areas to Develop</h3>
              <div className="flex flex-wrap gap-2">
                {achievementMeaning.challenges.map((challenge, index) => (
                  <Badge key={index} className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                    {challenge}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Career Paths */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/20">
            <h3 className="text-lg font-semibold text-yellow-400 mb-3 flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              15 Ideal Career Paths
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {achievementMeaning.careers.map((career, index) => (
                <div key={index} className="text-sm text-gray-300 bg-yellow-500/10 rounded px-2 py-1">
                  {career}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Hidden Passion Number Analysis */}
      <Card className="report-card">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <Zap className="w-6 h-6 text-orange-400" />
          Hidden Passion Number{data.hiddenPassionNumbers.length > 1 ? 's' : ''}: {data.hiddenPassionNumbers.join(', ')}
        </h2>
        
        <div className="space-y-6">
          <p className="text-gray-300 text-lg leading-relaxed">
            Your Hidden Passion Number{data.hiddenPassionNumbers.length > 1 ? 's reveal' : ' reveals'} your dominant trait{data.hiddenPassionNumbers.length > 1 ? 's' : ''} or talent{data.hiddenPassionNumbers.length > 1 ? 's' : ''} based on the most frequent number{data.hiddenPassionNumbers.length > 1 ? 's' : ''} in your name.
          </p>

          {/* Calculation Breakdown */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20">
            <h3 className="text-lg font-semibold text-orange-400 mb-3 flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              How We Calculated Your Hidden Passion Number{data.hiddenPassionNumbers.length > 1 ? 's' : ''}
            </h3>
            <div className="space-y-1 text-gray-300 font-mono text-sm">
              {data.hiddenPassionBreakdown.map((step, index) => (
                <div key={index}>{step}</div>
              ))}
            </div>
          </div>

          {/* Hidden Passion Meanings */}
          <div className="space-y-4">
            {data.hiddenPassionNumbers.map((num, index) => {
              const meaning = numberMeanings[num as keyof typeof numberMeanings];
              return (
                <div key={index} className="p-4 rounded-xl bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border border-orange-500/20">
                  <h3 className="text-lg font-semibold text-orange-400 mb-3">
                    Hidden Passion Number {num}: {meaning.title}
                  </h3>
                  <p className="text-gray-300 mb-3">{meaning.description}</p>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-md font-semibold text-orange-400 mb-2">Natural Talents</h4>
                      <div className="flex flex-wrap gap-2">
                        {meaning.strengths.slice(0, 3).map((strength, idx) => (
                          <Badge key={idx} className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                            {strength}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-md font-semibold text-orange-400 mb-2">Areas to Develop</h4>
                      <div className="flex flex-wrap gap-2">
                        {meaning.challenges.slice(0, 3).map((challenge, idx) => (
                          <Badge key={idx} className="bg-red-500/20 text-red-300 border-red-500/30">
                            {challenge}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Comprehensive Career Paths for Hidden Passion */}
          <div className="p-6 rounded-xl bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/20">
            <h3 className="text-xl font-semibold text-amber-400 mb-4 flex items-center gap-2">
              <DollarSign className="w-6 h-6" />
              15 Specialized Career Paths for Your Hidden Passion
            </h3>
            <p className="text-gray-300 mb-4">
              These career paths are specifically aligned with your dominant number{data.hiddenPassionNumbers.length > 1 ? 's' : ''}, 
              representing areas where your natural talents and passions can flourish most powerfully.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {data.hiddenPassionCareers.slice(0, 15).map((career, index) => (
                <div key={index} className="text-sm text-gray-300 bg-amber-500/20 rounded-lg px-3 py-2 border border-amber-500/30">
                  {career}
                </div>
              ))}
            </div>
            {data.hiddenPassionCareers.length > 15 && (
              <p className="text-amber-400 text-sm mt-3 italic">
                + {data.hiddenPassionCareers.length - 15} more specialized paths aligned with your Hidden Passion number{data.hiddenPassionNumbers.length > 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Karmic Lesson Numbers Analysis */}
      <Card className="report-card">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-red-400" />
          Karmic Lesson Numbers: {data.karmicLessonNumbers.length > 0 ? data.karmicLessonNumbers.join(', ') : 'None'}
        </h2>
        
        <div className="space-y-6">
          <p className="text-gray-300 text-lg leading-relaxed">
            {data.karmicLessonNumbers.length > 0 
              ? `Your Karmic Lesson Numbers reveal areas where you may face challenges or lessons to grow spiritually and emotionally. These are the numbers missing from your name.`
              : `Congratulations! You have no Karmic Lesson Numbers, meaning all numbers 1-8 are present in your name. This indicates a well-rounded spiritual foundation.`
            }
          </p>

          {/* Calculation Breakdown */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20">
            <h3 className="text-lg font-semibold text-red-400 mb-3 flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              How We Identified Your Karmic Lesson Numbers
            </h3>
            <div className="space-y-1 text-gray-300 font-mono text-sm">
              {data.karmicLessonBreakdown.map((step, index) => (
                <div key={index}>{step}</div>
              ))}
            </div>
          </div>

          {/* Karmic Lesson Meanings */}
          {data.karmicLessonNumbers.length > 0 ? (
            <div className="space-y-4">
              {data.karmicLessonNumbers.map((num, index) => {
                const meaning = numberMeanings[num as keyof typeof numberMeanings];
                return (
                  <div key={index} className="p-4 rounded-xl bg-gradient-to-r from-red-500/10 to-pink-500/10 border border-red-500/20">
                    <h3 className="text-lg font-semibold text-red-400 mb-3">
                      Karmic Lesson {num}: Develop {meaning.title} Qualities
                    </h3>
                    <p className="text-gray-300 mb-3">
                      You're here to learn and develop qualities related to {meaning.title.toLowerCase()}. {meaning.description}
                    </p>
                    
                    <div>
                      <h4 className="text-md font-semibold text-red-400 mb-2">Qualities to Develop</h4>
                      <div className="flex flex-wrap gap-2">
                        {meaning.strengths.slice(0, 4).map((strength, idx) => (
                          <Badge key={idx} className="bg-red-500/20 text-red-300 border-red-500/30">
                            {strength}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-6 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
              <h3 className="text-lg font-semibold text-green-400 mb-3">✨ Complete Spiritual Foundation</h3>
              <p className="text-gray-300">
                Having all numbers 1-8 present in your name indicates you have access to all the fundamental spiritual energies. 
                This is quite rare and suggests you've developed these qualities in past experiences or lifetimes. 
                Your challenge now is to balance and harmonize these energies effectively.
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Business & Money Insights */}
      <Card className="report-card">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <DollarSign className="w-6 h-6 text-green-400" />
          Soul-Aligned Business Insights
        </h2>
        
        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
            <h3 className="text-lg font-semibold text-purple-400 mb-3">🌟 Your Cosmic Business Blueprint</h3>
            <ul className="space-y-2 text-gray-300">
              <li>• Use your Birthday gift of {birthdayMeaning.strengths[0].toLowerCase()} as a unique selling point</li>
              <li>• Let your {personalityMeaning.strengths[0].toLowerCase()} personality attract ideal clients</li>
              <li>• Follow your Heart's Desire for {soulUrgeMeaning.strengths[0].toLowerCase()} as your core mission</li>
              <li>• Express your natural {expressionMeaning.strengths[0].toLowerCase()} through your business model</li>
              <li>• Leverage your Life Path {lifePathMeaning.strengths[0].toLowerCase()} abilities in your marketing</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Call to Action */}
      <Card className="report-card text-center">
        <h2 className="text-2xl font-bold text-white mb-4">
          Ready to Build Your <span className="gold-text">Soul-Aligned Business</span>?
        </h2>
        <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
          This complete cosmic blueprint reveals all five of your core numbers with detailed calculations, 
          natural talents, and 15 career paths for each number. Book a consultation today to transform 
          these insights into a thriving, soul urged business that flows with your natural energy.
        </p>
        <a 
          href="https://cal.com/dangeloali/unlock-abundance-with-ai-intuition-a-soul-urged-business-strategy-call" 
          target="_blank" 
          rel="noopener noreferrer"
        >
          <Button className="cosmic-button text-lg px-8 py-3">
            <Calendar className="w-5 h-5 mr-2" />
            Book a Consultation
          </Button>
        </a>
      </Card>
    </div>
  );
};

export default NumerologyReport;
