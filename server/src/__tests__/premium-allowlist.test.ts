import { describe, it, expect } from 'vitest';
import { isPremiumEmail } from '../lib/premium-allowlist.js';

describe('isPremiumEmail', () => {
  it('always allows luthorsparks@gmail.com', () => {
    expect(isPremiumEmail('luthorsparks@gmail.com')).toBe(true);
  });

  it('is case-insensitive and trims whitespace', () => {
    expect(isPremiumEmail('  LuthorSparks@Gmail.com ')).toBe(true);
  });

  it('rejects non-allowlisted emails', () => {
    expect(isPremiumEmail('someone@example.com')).toBe(false);
  });

  it('rejects empty/undefined', () => {
    expect(isPremiumEmail(undefined)).toBe(false);
    expect(isPremiumEmail(null)).toBe(false);
    expect(isPremiumEmail('')).toBe(false);
  });
});
