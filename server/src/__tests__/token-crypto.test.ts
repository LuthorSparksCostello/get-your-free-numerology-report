import { describe, it, expect, beforeAll } from 'vitest';
import { encryptToken, decryptToken } from '../lib/token-crypto.js';

beforeAll(() => {
  // 32 bytes hex
  process.env.CALENDAR_TOKEN_KEY = 'a'.repeat(64);
});

describe('token-crypto', () => {
  it('round-trips a refresh token', () => {
    const plain = '1//refresh-token-value';
    const enc = encryptToken(plain);
    expect(enc).not.toContain(plain);
    expect(decryptToken(enc)).toBe(plain);
  });

  it('produces different ciphertext each call (random IV)', () => {
    const a = encryptToken('same');
    const b = encryptToken('same');
    expect(a).not.toBe(b);
    expect(decryptToken(a)).toBe('same');
    expect(decryptToken(b)).toBe('same');
  });

  it('throws on tampered ciphertext', () => {
    const enc = encryptToken('secret');
    const parts = enc.split('.');
    parts[2] = Buffer.from('garbage').toString('base64'); // corrupt ciphertext
    expect(() => decryptToken(parts.join('.'))).toThrow();
  });
});
