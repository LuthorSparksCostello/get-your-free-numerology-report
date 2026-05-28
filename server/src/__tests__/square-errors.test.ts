import { describe, it, expect } from 'vitest';
import { mapSquareError, getKnownErrorCodes } from '../lib/square-errors.js';

describe('Square error mapping', () => {
  const requiredCodes = [
    'CARD_DECLINED',
    'CVV_FAILURE',
    'ADDRESS_VERIFICATION_FAILURE',
    'INVALID_EXPIRATION',
    'INSUFFICIENT_FUNDS',
    'GENERIC_DECLINE',
    'PAYMENT_LIMIT_EXCEEDED',
    'RATE_LIMITED',
    'TEMPORARILY_UNAVAILABLE',
  ];

  it('maps all required error codes', () => {
    const knownCodes = getKnownErrorCodes();
    for (const code of requiredCodes) {
      expect(knownCodes).toContain(code);
    }
  });

  it('returns the correct code in the mapped error', () => {
    for (const code of requiredCodes) {
      const mapped = mapSquareError(code);
      expect(mapped.code).toBe(code);
    }
  });

  it('returns all required fields for each mapped error', () => {
    for (const code of requiredCodes) {
      const mapped = mapSquareError(code);
      expect(mapped).toHaveProperty('code');
      expect(mapped).toHaveProperty('category');
      expect(mapped).toHaveProperty('message');
      expect(mapped).toHaveProperty('retryable');
      expect(typeof mapped.code).toBe('string');
      expect(typeof mapped.category).toBe('string');
      expect(typeof mapped.message).toBe('string');
      expect(typeof mapped.retryable).toBe('boolean');
    }
  });

  it('returns a user-friendly message (not an internal code)', () => {
    for (const code of requiredCodes) {
      const mapped = mapSquareError(code);
      expect(mapped.message.length).toBeGreaterThan(10);
      // Should not contain raw error codes
      expect(mapped.message).not.toContain('_');
    }
  });

  it('marks declined cards as non-retryable', () => {
    expect(mapSquareError('CARD_DECLINED').retryable).toBe(false);
    expect(mapSquareError('GENERIC_DECLINE').retryable).toBe(false);
    expect(mapSquareError('INSUFFICIENT_FUNDS').retryable).toBe(false);
  });

  it('marks fixable errors as retryable', () => {
    expect(mapSquareError('CVV_FAILURE').retryable).toBe(true);
    expect(mapSquareError('ADDRESS_VERIFICATION_FAILURE').retryable).toBe(true);
    expect(mapSquareError('INVALID_EXPIRATION').retryable).toBe(true);
  });

  it('marks transient/rate-limit errors as retryable', () => {
    expect(mapSquareError('RATE_LIMITED').retryable).toBe(true);
    expect(mapSquareError('TEMPORARILY_UNAVAILABLE').retryable).toBe(true);
  });

  it('returns a default error for unknown codes', () => {
    const mapped = mapSquareError('SOME_FUTURE_CODE');
    expect(mapped.code).toBe('SOME_FUTURE_CODE');
    expect(mapped.category).toBe('UNKNOWN_ERROR');
    expect(mapped.retryable).toBe(true);
    expect(mapped.message.length).toBeGreaterThan(0);
  });
});
