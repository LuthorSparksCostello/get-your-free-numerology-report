import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, User, Sparkles, CheckCircle, AlertCircle } from 'lucide-react';

interface FormData {
  fullName: string;
  birthDate: string;
  email: string;
}

interface NumerologyFormProps {
  onSubmit: (data: FormData) => void;
  isLoading?: boolean;
}

/** Chaldean letter values for live preview */
const chaldeanValues: Record<string, number> = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 8, G: 3, H: 5, I: 1, J: 1, K: 2, L: 3, M: 4,
  N: 5, O: 7, P: 8, Q: 1, R: 2, S: 3, T: 4, U: 6, V: 6, W: 6, X: 5, Y: 1, Z: 7
};

const NumerologyForm = ({ onSubmit, isLoading = false }: NumerologyFormProps) => {
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    birthDate: '',
    email: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [validFields, setValidFields] = useState<Partial<Record<keyof FormData, boolean>>>({});
  const [isShaking, setIsShaking] = useState(false);

  /** Live Chaldean letter breakdown */
  const letterPreview = useMemo(() => {
    const cleanName = formData.fullName.toUpperCase().replace(/[^A-Z\s]/g, '');
    if (!cleanName.trim()) return [];
    return cleanName.split('').map((char) => ({
      letter: char,
      value: char === ' ' ? null : (chaldeanValues[char] || 0),
    }));
  }, [formData.fullName]);

  const totalValue = letterPreview.reduce((sum, l) => sum + (l.value || 0), 0);

  const validateField = (field: keyof FormData, value: string): string | undefined => {
    switch (field) {
      case 'fullName':
        if (!value.trim()) return 'Full name is required';
        if (value.trim().length < 2) return 'Name must be at least 2 characters';
        if (!/^[a-zA-Z0-9\s]+$/.test(value.trim())) return 'Letters, numbers, and spaces only';
        return undefined;
      case 'birthDate':
        if (!value) return 'Birth date is required';
        return undefined;
      case 'email':
        // Email is optional
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email format';
        return undefined;
      default:
        return undefined;
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    (['fullName', 'birthDate'] as const).forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });
    if (formData.email) {
      const emailErr = validateField('email', formData.email);
      if (emailErr) newErrors.email = emailErr;
    }
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
    if (validateForm()) onSubmit(formData);
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    const error = validateField(field, value);
    if (error) {
      setErrors((prev) => ({ ...prev, [field]: error }));
      setValidFields((prev) => ({ ...prev, [field]: false }));
    } else {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
      if (value.trim()) setValidFields((prev) => ({ ...prev, [field]: true }));
    }
  };

  const FieldIcon = ({ field }: { field: keyof FormData }) => {
    if (errors[field]) return <AlertCircle className="w-4 h-4 text-red-400" />;
    if (validFields[field]) return <CheckCircle className="w-4 h-4 text-emerald-400" />;
    return null;
  };

  return (
    <div className={`glass-morphism-elevated p-6 sm:p-8 max-w-2xl mx-auto transition-all duration-500 ${isShaking ? 'shake-error' : ''}`}>
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 mb-5 pulse-glow">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white font-heading mb-2">
          Unlock Your <span className="gold-text">Cosmic Blueprint</span>
        </h2>
        <p className="text-gray-400 text-sm">Enter your birth details for a complete Chaldean numerology analysis</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {/* Full Name */}
        <div className="space-y-2">
          <Label htmlFor="fullName" className="flex items-center gap-2 text-amber-400 font-semibold text-sm uppercase tracking-wider">
            <User className="w-4 h-4" />
            Full Name at Birth
          </Label>
          <div className="relative">
            <Input
              id="fullName"
              type="text"
              placeholder="e.g., John Michael Smith"
              value={formData.fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
              className={`bg-white/5 border-white/15 text-white placeholder:text-gray-500 focus:border-amber-400 focus:ring-amber-400/20 h-13 text-base transition-all duration-300 pr-10 ${
                errors.fullName ? 'border-red-400 bg-red-500/5' : validFields.fullName ? 'border-emerald-400/50 bg-emerald-500/5' : ''
              }`}
              autoComplete="name"
              aria-describedby={errors.fullName ? 'fullName-error' : undefined}
              aria-invalid={!!errors.fullName}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <FieldIcon field="fullName" />
            </div>
          </div>
          {errors.fullName && (
            <p id="fullName-error" className="text-red-400 text-xs flex items-center gap-1.5" role="alert">
              <AlertCircle className="w-3 h-3" />
              {errors.fullName}
            </p>
          )}

          {/* Live Chaldean letter preview */}
          {letterPreview.length > 0 && (
            <div className="flex flex-wrap gap-1 p-3 rounded-lg bg-white/[0.02] border border-white/5">
              {letterPreview.map((l, i) =>
                l.value === null ? (
                  <span key={i} className="w-2" />
                ) : (
                  <span
                    key={i}
                    className="inline-flex flex-col items-center px-1.5 py-0.5 rounded bg-amber-500/10 text-xs transition-all duration-200"
                    style={{ animationDelay: `${i * 30}ms` }}
                  >
                    <span className="text-white/70 font-medium">{l.letter}</span>
                    <span className="text-amber-400 font-bold text-[10px]">{l.value}</span>
                  </span>
                )
              )}
              <span className="inline-flex items-center px-2 py-0.5 rounded bg-amber-500/20 text-xs text-amber-300 font-semibold ml-auto">
                Σ = {totalValue}
              </span>
            </div>
          )}
        </div>

        {/* Birth Date */}
        <div className="space-y-2">
          <Label htmlFor="birthDate" className="flex items-center gap-2 text-amber-400 font-semibold text-sm uppercase tracking-wider">
            <Calendar className="w-4 h-4" />
            Birth Date
          </Label>
          <div className="relative">
            <Input
              id="birthDate"
              type="date"
              value={formData.birthDate}
              onChange={(e) => handleChange('birthDate', e.target.value)}
              className={`bg-white/5 border-white/15 text-white focus:border-amber-400 focus:ring-amber-400/20 h-13 text-base transition-all duration-300 pr-10 ${
                errors.birthDate ? 'border-red-400 bg-red-500/5' : validFields.birthDate ? 'border-emerald-400/50 bg-emerald-500/5' : ''
              }`}
              aria-describedby={errors.birthDate ? 'birthDate-error' : undefined}
              aria-invalid={!!errors.birthDate}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <FieldIcon field="birthDate" />
            </div>
          </div>
          {errors.birthDate && (
            <p id="birthDate-error" className="text-red-400 text-xs flex items-center gap-1.5" role="alert">
              <AlertCircle className="w-3 h-3" />
              {errors.birthDate}
            </p>
          )}
        </div>

        {/* Email (optional) */}
        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center gap-2 text-gray-400 font-semibold text-sm uppercase tracking-wider">
            <span className="text-gray-500">✉</span>
            Email <span className="text-gray-600 font-normal normal-case">(optional — to save your report)</span>
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="your@email.com"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className={`bg-white/5 border-white/15 text-white placeholder:text-gray-500 focus:border-amber-400 focus:ring-amber-400/20 h-13 text-base transition-all duration-300 ${
              errors.email ? 'border-red-400 bg-red-500/5' : ''
            }`}
            autoComplete="email"
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
          {errors.email && (
            <p id="email-error" className="text-red-400 text-xs flex items-center gap-1.5" role="alert">
              <AlertCircle className="w-3 h-3" />
              {errors.email}
            </p>
          )}
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full cosmic-button h-14 text-lg font-bold"
          id="submit-form"
        >
          {isLoading ? (
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-deepspace-900 border-t-transparent rounded-full loading-spinner" />
              <span className="animate-pulse">Calculating Your Numbers...</span>
            </div>
          ) : (
            <span className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Get My Free Numerology Report
              <Sparkles className="w-5 h-5" />
            </span>
          )}
        </Button>
      </form>

      <p className="mt-5 text-center text-xs text-gray-500">
        🔮 Your information is completely secure and will never be shared
      </p>
    </div>
  );
};

export default NumerologyForm;
