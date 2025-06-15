
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
  Share2,
  ArrowLeft
} from 'lucide-react';

interface ReportData {
  name: string;
  email: string;
  birthDate: string;
  lifePathNumber: number;
  expressionNumber: number;
  soulUrgeNumber: number;
  personalityNumber: number;
  birthdayNumber: number;
}

interface NumerologyReportProps {
  data: ReportData;
  onBack: () => void;
}

const numberMeanings = {
  1: {
    title: "The Leader",
    description: "Independent, pioneering, and ambitious. Natural born leaders who create their own path.",
    strengths: ["Leadership", "Innovation", "Independence", "Determination"],
    challenges: ["Impatience", "Stubbornness", "Self-centeredness"]
  },
  2: {
    title: "The Diplomat",
    description: "Cooperative, sensitive, and peace-loving. Excel at bringing people together.",
    strengths: ["Cooperation", "Sensitivity", "Diplomacy", "Intuition"],
    challenges: ["Indecisiveness", "Over-sensitivity", "Dependency"]
  },
  3: {
    title: "The Creative",
    description: "Artistic, expressive, and optimistic. Natural entertainers and communicators.",
    strengths: ["Creativity", "Communication", "Optimism", "Inspiration"],
    challenges: ["Scattered energy", "Superficiality", "Mood swings"]
  },
  4: {
    title: "The Builder",
    description: "Practical, hardworking, and reliable. Excel at creating stable foundations.",
    strengths: ["Organization", "Reliability", "Hard work", "Practicality"],
    challenges: ["Rigidity", "Pessimism", "Resistance to change"]
  },
  5: {
    title: "The Adventurer",
    description: "Freedom-loving, versatile, and progressive. Thrive on change and variety.",
    strengths: ["Adaptability", "Freedom", "Curiosity", "Progressive thinking"],
    challenges: ["Restlessness", "Irresponsibility", "Inconsistency"]
  },
  6: {
    title: "The Nurturer",
    description: "Caring, responsible, and community-minded. Natural healers and teachers.",
    strengths: ["Nurturing", "Responsibility", "Healing", "Service"],
    challenges: ["Interference", "Worry", "Self-sacrifice"]
  },
  7: {
    title: "The Seeker",
    description: "Analytical, spiritual, and introspective. Deep thinkers who seek truth.",
    strengths: ["Analysis", "Spirituality", "Intuition", "Research"],
    challenges: ["Aloofness", "Perfectionism", "Skepticism"]
  },
  8: {
    title: "The Achiever",
    description: "Ambitious, material-focused, and authoritative. Natural business leaders.",
    strengths: ["Business acumen", "Organization", "Material success", "Authority"],
    challenges: ["Materialism", "Workaholism", "Impatience"]
  },
  9: {
    title: "The Humanitarian",
    description: "Compassionate, generous, and globally-minded. Serve the greater good.",
    strengths: ["Compassion", "Generosity", "Universal love", "Wisdom"],
    challenges: ["Idealism", "Emotional volatility", "Impracticality"]
  }
};

const NumerologyReport = ({ data, onBack }: NumerologyReportProps) => {
  const lifePathMeaning = numberMeanings[data.lifePathNumber as keyof typeof numberMeanings];
  const expressionMeaning = numberMeanings[data.expressionNumber as keyof typeof numberMeanings];

  const handleDownload = () => {
    // In a real app, this would generate a PDF
    console.log('Downloading report...');
  };

  const handleShare = () => {
    // In a real app, this would open share dialog
    console.log('Sharing report...');
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
          Your Personal <span className="gold-text">Cosmic Blueprint</span>
        </h1>
        
        <p className="text-xl text-gray-300">
          Generated for <span className="text-amber-400 font-semibold">{data.name}</span>
        </p>
        
        <div className="flex justify-center gap-4 mt-6">
          <Button onClick={handleDownload} className="cosmic-button">
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
          <Button onClick={handleShare} variant="outline" className="border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-slate-900">
            <Share2 className="w-4 h-4 mr-2" />
            Share Report
          </Button>
        </div>
      </div>

      {/* Core Numbers Overview */}
      <Card className="report-card">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <Target className="w-6 h-6 text-amber-400" />
          Your Core Numbers
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center p-4 rounded-xl bg-gradient-to-b from-amber-500/10 to-transparent border border-amber-500/20">
            <div className="text-3xl font-bold text-amber-400 mb-2">{data.lifePathNumber}</div>
            <div className="text-sm text-gray-300">Life Path</div>
          </div>
          <div className="text-center p-4 rounded-xl bg-gradient-to-b from-purple-500/10 to-transparent border border-purple-500/20">
            <div className="text-3xl font-bold text-purple-400 mb-2">{data.expressionNumber}</div>
            <div className="text-sm text-gray-300">Expression</div>
          </div>
          <div className="text-center p-4 rounded-xl bg-gradient-to-b from-pink-500/10 to-transparent border border-pink-500/20">
            <div className="text-3xl font-bold text-pink-400 mb-2">{data.soulUrgeNumber}</div>
            <div className="text-sm text-gray-300">Soul Urge</div>
          </div>
          <div className="text-center p-4 rounded-xl bg-gradient-to-b from-blue-500/10 to-transparent border border-blue-500/20">
            <div className="text-3xl font-bold text-blue-400 mb-2">{data.personalityNumber}</div>
            <div className="text-sm text-gray-300">Personality</div>
          </div>
          <div className="text-center p-4 rounded-xl bg-gradient-to-b from-green-500/10 to-transparent border border-green-500/20">
            <div className="text-3xl font-bold text-green-400 mb-2">{data.birthdayNumber}</div>
            <div className="text-sm text-gray-300">Birthday</div>
          </div>
        </div>
      </Card>

      {/* Life Path Analysis */}
      <Card className="report-card">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <Heart className="w-6 h-6 text-pink-400" />
          Life Path Number {data.lifePathNumber}: {lifePathMeaning.title}
        </h2>
        
        <div className="space-y-6">
          <p className="text-gray-300 text-lg leading-relaxed">
            {lifePathMeaning.description}
          </p>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-amber-400 flex items-center gap-2">
                <Star className="w-5 h-5" />
                Your Strengths
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
                Growth Areas
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
        </div>
      </Card>

      {/* Expression Number Analysis */}
      <Card className="report-card">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <Users className="w-6 h-6 text-purple-400" />
          Expression Number {data.expressionNumber}: {expressionMeaning.title}
        </h2>
        
        <div className="space-y-4">
          <p className="text-gray-300 text-lg leading-relaxed">
            Your Expression Number reveals your life's work and the talents you're meant to develop. 
            {expressionMeaning.description}
          </p>
          
          <div className="p-6 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
            <h3 className="text-lg font-semibold text-purple-400 mb-3">Career & Life Purpose</h3>
            <p className="text-gray-300">
              As a {expressionMeaning.title}, you're naturally suited for roles that allow you to express your 
              {expressionMeaning.strengths.slice(0, 2).join(' and ').toLowerCase()} abilities. 
              Focus on developing your {expressionMeaning.strengths[0].toLowerCase()} skills for maximum success.
            </p>
          </div>
        </div>
      </Card>

      {/* Business & Money Insights */}
      <Card className="report-card">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <DollarSign className="w-6 h-6 text-green-400" />
          Soul-Aligned Business Insights
        </h2>
        
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20">
              <h3 className="text-lg font-semibold text-green-400 mb-3">Money Magnetism</h3>
              <p className="text-gray-300">
                Your {data.lifePathNumber} Life Path suggests you attract abundance through {lifePathMeaning.strengths[0].toLowerCase()}. 
                Focus on building systems that align with your natural {lifePathMeaning.strengths[1].toLowerCase()} abilities.
              </p>
            </div>
            
            <div className="p-6 rounded-xl bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border border-amber-500/20">
              <h3 className="text-lg font-semibold text-amber-400 mb-3">Ideal Business Model</h3>
              <p className="text-gray-300">
                As {expressionMeaning.title}, consider business models that emphasize {expressionMeaning.strengths[0].toLowerCase()} 
                and allow for {expressionMeaning.strengths[2]?.toLowerCase() || 'growth'}. Avoid ventures that conflict with your core values.
              </p>
            </div>
          </div>
          
          <div className="p-6 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
            <h3 className="text-lg font-semibold text-purple-400 mb-3">🌟 Your Cosmic Business Blueprint</h3>
            <ul className="space-y-2 text-gray-300">
              <li>• Leverage your natural {lifePathMeaning.strengths[0].toLowerCase()} abilities in your marketing</li>
              <li>• Build systems that support your {expressionMeaning.strengths[1]?.toLowerCase() || 'core strength'} nature</li>
              <li>• Partner with others who complement your {lifePathMeaning.challenges[0]?.toLowerCase() || 'growth areas'}</li>
              <li>• Focus on serving clients who value {expressionMeaning.strengths[0].toLowerCase()}</li>
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
          This is just the beginning of your cosmic journey. Join our 5-day live challenge to turn 
          your numerology insights into a thriving, soul-aligned business.
        </p>
        <Button className="cosmic-button text-lg px-8 py-3">
          Join the Challenge Now
        </Button>
      </Card>
    </div>
  );
};

export default NumerologyReport;
