import { describe, it, expect, beforeAll } from 'vitest';
import { createHmac } from 'node:crypto';
import { signState, verifyState } from '../lib/oauth-state.js';

beforeAll(() => {
  process.env.CALENDAR_STATE_SECRET = 'test-state-secret-1234567890';
});

describe('OAuth state', () => {
  it('round-trips the sub', () => {
    const state = signState({ sub: 'auth0|abc' });
    expect(verifyState(state)).toEqual({ sub: 'auth0|abc' });
  });

  it('rejects a tampered body', () => {
    const state = signState({ sub: 'auth0|abc' });
    const [body, sig] = state.split('.');
    const tampered = `${body}x.${sig}`;
    expect(() => verifyState(tampered)).toThrow();
  });

  it('rejects a malformed state', () => {
    expect(() => verifyState('not-a-valid-state')).toThrow();
  });

  it('rejects an expired state', () => {
    const past = Date.now() - 1000;
    const body = Buffer.from(
      JSON.stringify({ sub: 'auth0|abc', nonce: 'x', exp: past })
    ).toString('base64url');
    // Re-sign the forged body with the real secret so only expiry fails.
    const sig = createHmac('sha256', process.env.CALENDAR_STATE_SECRET!)
      .update(body)
      .digest('base64url');
    expect(() => verifyState(`${body}.${sig}`)).toThrow(/expired/i);
  });
});
