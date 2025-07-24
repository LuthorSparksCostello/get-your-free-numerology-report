
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Calendar, User, Sparkles, CheckCircle, AlertCircle } from 'lucide-react';

interface FormData {
  fullName: string;
  birthDate: string;
}

interface NumerologyFormProps {
  onSubmit: (data: FormData) => void;
  isLoading?: boolean;
}

const NumerologyForm = ({ onSubmit, isLoading = false }: NumerologyFormProps) => {
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    birthDate: ''
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [validFields, setValidFields] = useState<Partial<FormData>>({});
  const [isShaking, setIsShaking] = useState(false);

  const validateField = (field: keyof FormData, value: string): string | undefined => {
    switch (field) {
      case 'fullName':
        if (!value.trim()) return 'Full name is required';
        if (value.trim().length < 2) return 'Name must be at least 2 characters';
        if (!/^[a-zA-Z0-9\s]+$/.test(value.trim())) return 'Name can only contain letters, numbers, and spaces';
        return undefined;
      case 'birthDate':
        if (!value) return 'Birth date is required';
        const date = new Date(value);
        const today = new Date();
        if (date > today) return 'Birth date cannot be in the future';
        return undefined;
      default:
        return undefined;
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    Object.keys(formData).forEach((key) => {
      const field = key as keyof FormData;
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
      }
    });

    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 600);
      return false;
    }
    
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Real-time validation
    const error = validateField(field, value);
    if (error) {
      setErrors(prev => ({ ...prev, [field]: error }));
      setValidFields(prev => ({ ...prev, [field]: undefined }));
    } else {
      setErrors(prev => ({ ...prev, [field]: undefined }));
      setValidFields(prev => ({ ...prev, [field]: 'valid' }));
    }
  };

  const getFieldIcon = (field: keyof FormData) => {
    if (errors[field]) return <AlertCircle className="w-4 h-4 text-red-400" />;
    if (validFields[field]) return <CheckCircle className="w-4 h-4 text-green-400" />;
    return null;
  };

  return (
    <Card className={`glass-morphism p-8 max-w-2xl mx-auto transition-all duration-500 ${isShaking ? 'shake-error' : ''}`}>
      <div className="text-center mb-8 fade-in-stagger">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 mb-6 pulse-glow">
          <Sparkles className="w-10 h-10 text-white animate-pulse" />
        </div>
        <h2 className="text-4xl font-bold text-white mb-3 cosmic-text glow-text">
          Unlock Your <span className="gold-text">Cosmic Blueprint</span>
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-3 fade-in-stagger">
          <Label htmlFor="fullName" className="flex items-center gap-2 text-amber-400 font-semibold text-base">
            <User className="w-5 h-5" />
            Full Name at Birth
          </Label>
          <div className="relative">
            <Input
              id="fullName"
              type="text"
              placeholder="e.g., John Michael Smith"
              value={formData.fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
              className={`bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-amber-400 focus:ring-amber-400/20 h-14 text-lg transition-all duration-300 ${
                errors.fullName ? 'border-red-400 bg-red-500/10' : validFields.fullName ? 'border-green-400 bg-green-500/10' : ''
              }`}
            />
            {getFieldIcon('fullName') && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                {getFieldIcon('fullName')}
              </div>
            )}
          </div>
          {errors.fullName && (
            <p className="text-red-400 text-sm flex items-center gap-2 animate-pulse">
              <AlertCircle className="w-4 h-4" />
              {errors.fullName}
            </p>
          )}
        </div>

        <div className="space-y-3 fade-in-stagger">
          <Label htmlFor="birthDate" className="flex items-center gap-2 text-amber-400 font-semibold text-base">
            <Calendar className="w-5 h-5" />
            Birth Date
          </Label>
          <div className="relative">
            <Input
              id="birthDate"
              type="date"
              value={formData.birthDate}
              onChange={(e) => handleChange('birthDate', e.target.value)}
              className={`bg-white/5 border-white/20 text-white focus:border-amber-400 focus:ring-amber-400/20 h-14 text-lg transition-all duration-300 ${
                errors.birthDate ? 'border-red-400 bg-red-500/10' : validFields.birthDate ? 'border-green-400 bg-green-500/10' : ''
              }`}
            />
            {getFieldIcon('birthDate') && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                {getFieldIcon('birthDate')}
              </div>
            )}
          </div>
          {errors.birthDate && (
            <p className="text-red-400 text-sm flex items-center gap-2 animate-pulse">
              <AlertCircle className="w-4 h-4" />
              {errors.birthDate}
            </p>
          )}
        </div>

        <div className="fade-in-stagger">
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full cosmic-button h-16 text-xl font-bold"
          >
            {isLoading ? (
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 border-3 border-slate-800 border-t-transparent rounded-full loading-spinner" />
                <span className="animate-pulse">Generating Your Cosmic Report...</span>
              </div>
            ) : (
              <span className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Get My Free Numerology Report
                <Sparkles className="w-5 h-5" />
              </span>
            )}
          </Button>
        </div>
      </form>

      <div className="mt-8 text-center text-sm text-gray-400 fade-in-stagger">
        <p className="flex items-center justify-center gap-2">
          🔮 Your information is completely secure and will never be shared
        </p>
      </div>
    </Card>
  );
};

export default NumerologyForm;
