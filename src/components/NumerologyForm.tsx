
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Calendar, User, Mail, Sparkles } from 'lucide-react';

interface FormData {
  fullName: string;
  email: string;
  birthDate: string;
}

interface NumerologyFormProps {
  onSubmit: (data: FormData) => void;
  isLoading?: boolean;
}

const NumerologyForm = ({ onSubmit, isLoading = false }: NumerologyFormProps) => {
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    birthDate: ''
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.birthDate) {
      newErrors.birthDate = 'Birth date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Card className="glass-morphism p-8 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 mb-4">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2 cosmic-text">
          Unlock Your <span className="gold-text">Cosmic Blueprint</span>
        </h2>
        <p className="text-gray-300">
          Enter your details to receive your personalized Chaldean numerology report
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="fullName" className="flex items-center gap-2 text-amber-400 font-medium">
            <User className="w-4 h-4" />
            Full Name at Birth
          </Label>
          <Input
            id="fullName"
            type="text"
            placeholder="e.g., John Michael Smith"
            value={formData.fullName}
            onChange={(e) => handleChange('fullName', e.target.value)}
            className={`bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-amber-400 focus:ring-amber-400/20 ${
              errors.fullName ? 'border-red-400' : ''
            }`}
          />
          {errors.fullName && (
            <p className="text-red-400 text-sm">{errors.fullName}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center gap-2 text-amber-400 font-medium">
            <Mail className="w-4 h-4" />
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="your@email.com"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className={`bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-amber-400 focus:ring-amber-400/20 ${
              errors.email ? 'border-red-400' : ''
            }`}
          />
          {errors.email && (
            <p className="text-red-400 text-sm">{errors.email}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="birthDate" className="flex items-center gap-2 text-amber-400 font-medium">
            <Calendar className="w-4 h-4" />
            Birth Date
          </Label>
          <Input
            id="birthDate"
            type="date"
            value={formData.birthDate}
            onChange={(e) => handleChange('birthDate', e.target.value)}
            className={`bg-white/5 border-white/20 text-white focus:border-amber-400 focus:ring-amber-400/20 ${
              errors.birthDate ? 'border-red-400' : ''
            }`}
          />
          {errors.birthDate && (
            <p className="text-red-400 text-sm">{errors.birthDate}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full cosmic-button h-12 text-lg font-semibold"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-slate-800 border-t-transparent rounded-full animate-spin" />
              Generating Your Report...
            </div>
          ) : (
            'Get My Free Numerology Report'
          )}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-400">
        <p>🔮 Your information is completely secure and will never be shared</p>
      </div>
    </Card>
  );
};

export default NumerologyForm;
