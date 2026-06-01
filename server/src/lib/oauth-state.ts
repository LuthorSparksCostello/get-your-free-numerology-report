import { createHmac, timingSafeEqual, randomBytes } from 'node:crypto';

const TTL_MS = 10 * 60 * 1000; // 10 minutes

function secret(): string {
  const s = process.env.CALENDAR_STATE_SECRET;
  if (!s) throw new Error('CALENDAR_STATE_SECRET is not set');
  return s;
}

interface StatePayload {
  sub: string;
  nonce: string;
  exp: number;
}

/** Sign an OAuth `state` carrying the Auth0 sub, tamper-proof and short-lived. */
export function signState(data: { sub: string }): string {
  const payload: StatePayload = {
    sub: data.sub,
    nonce: randomBytes(8).toString('hex'),
    exp: Date.now() + TTL_MS,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = createHmac('sha256', secret()).update(body).digest('base64url');
  return `${body}.${sig}`;
}

/** Verify a signed state; returns the sub or throws. */
export function verifyState(state: string): { sub: string } {
  const [body, sig] = state.split('.');
  if (!body || !sig) throw new Error('Malformed state');

  const expected = createHmac('sha256', secret()).update(body).digest('base64url');
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    throw new Error('Bad state signature');
  }

  const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as StatePayload;
  if (Date.now() > payload.exp) throw new Error('State expired');
  return { sub: payload.sub };
}
