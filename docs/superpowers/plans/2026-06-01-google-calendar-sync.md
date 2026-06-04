# Google Calendar Sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let a signed-in user push their current-month numerology Personal Day cycles into a dedicated "Numerology Cycles" Google Calendar via server-side Google OAuth.

**Architecture:** The Express backend (Render) owns the Google OAuth flow and Calendar API calls; Google refresh tokens are AES-GCM-encrypted and stored in Supabase keyed to the Auth0 user `sub`. The React frontend (Vercel) computes the per-day numerology payload from existing utils and POSTs it; the backend only does Google mechanics. Sync is idempotent per month (replace, never duplicate).

**Tech Stack:** Express + TypeScript (ESM), `googleapis`, `jose` (Auth0 JWT verification), `zod`, Supabase service-role client, Vitest. Frontend: React + Auth0 + Vitest (added in this plan).

**Design spec:** `docs/superpowers/specs/2026-05-31-google-calendar-sync-design.md`

---

## File Structure

**Backend (`server/`)**
- `src/config/google.config.ts` — validated Google OAuth env (create)
- `src/config/auth0.config.ts` — validated Auth0 env (create)
- `src/lib/oauth-state.ts` — sign/verify CSRF state (create)
- `src/lib/token-crypto.ts` — AES-256-GCM encrypt/decrypt (create)
- `src/lib/calendar-events.ts` — pure day→Google-event mapping (create)
- `src/lib/verify-access-token.ts` — Auth0 JWT verification via jose (create)
- `src/middleware/require-auth.ts` — Bearer auth middleware (create)
- `src/lib/calendar-token-store.ts` — Supabase token CRUD (create)
- `src/lib/google-calendar.ts` — OAuth client + Calendar API (create)
- `src/routes/calendar.ts` — HTTP endpoints (create)
- `src/index.ts` — mount calendar router (modify)
- `db/google_calendar_tokens.sql` — table DDL (create)
- `.env.example` — new env vars (modify/create)
- `package.json` — add `googleapis`, `jose` (modify)
- Tests under `src/__tests__/`

**Frontend (`src/`)**
- `utils/numerology.ts` — export `reduceToSingleDigit` (modify, one word)
- `utils/calendarCycles.ts` — pure `buildMonthlyCycleEvents` (create)
- `utils/calendarCycles.test.ts` — test (create)
- `hooks/useGoogleCalendar.ts` — API hook (create)
- `App.tsx` — add Auth0 `audience`/`scope` (modify)
- `auth/auth0-config.ts` — expose audience (modify)
- `pages/Dashboard.tsx` — connect card + per-report sync button (modify)
- `package.json` — add `vitest` + `test` script (modify)
- `.env.example` — `VITE_AUTH0_AUDIENCE`, `VITE_API_URL` (modify/create)

---

## Task 1: Add backend dependencies

**Files:**
- Modify: `server/package.json`

- [ ] **Step 1: Add dependencies**

Edit the `dependencies` block in `server/package.json` to add two entries (keep alphabetical-ish ordering with the rest):

```json
    "googleapis": "^144.0.0",
    "jose": "^5.9.6",
```

- [ ] **Step 2: Install**

Run: `cd server; npm install`
Expected: installs without errors; `googleapis` and `jose` appear in `node_modules`.

- [ ] **Step 3: Commit**

```bash
git add server/package.json server/package-lock.json
git commit -m "build(server): add googleapis and jose for calendar sync"
```

---

## Task 2: Config modules (Google + Auth0)

**Files:**
- Create: `server/src/config/google.config.ts`
- Create: `server/src/config/auth0.config.ts`

No tests — matches the existing untested `square.config.ts` boot-validation pattern.

- [ ] **Step 1: Create `server/src/config/google.config.ts`**

```ts
import { z } from 'zod';
import 'dotenv/config';

/**
 * Google OAuth + calendar-sync configuration.
 * Validates required environment variables at boot and FAILS LOUDLY if missing.
 */
const googleConfigSchema = z.object({
  clientId: z.string().min(1, 'GOOGLE_CLIENT_ID is required'),
  clientSecret: z.string().min(1, 'GOOGLE_CLIENT_SECRET is required'),
  redirectUri: z.string().url('GOOGLE_OAUTH_REDIRECT_URI must be a valid URL'),
  stateSecret: z.string().min(16, 'CALENDAR_STATE_SECRET must be at least 16 chars'),
  // 32-byte key, hex-encoded (64 hex chars) for AES-256-GCM
  tokenKey: z.string().regex(/^[0-9a-fA-F]{64}$/, 'CALENDAR_TOKEN_KEY must be 64 hex chars (32 bytes)'),
  appUrl: z.string().url('APP_URL must be a valid URL'),
});

export type GoogleConfig = z.infer<typeof googleConfigSchema>;

function loadGoogleConfig(): GoogleConfig {
  const result = googleConfigSchema.safeParse({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_OAUTH_REDIRECT_URI,
    stateSecret: process.env.CALENDAR_STATE_SECRET,
    tokenKey: process.env.CALENDAR_TOKEN_KEY,
    appUrl: process.env.APP_URL,
  });

  if (!result.success) {
    const errors = result.error.issues
      .map((issue) => `  ✗ ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    console.error(
      '\n╔══════════════════════════════════════════════════════╗\n' +
      '║  FATAL: Google calendar configuration is invalid     ║\n' +
      '╚══════════════════════════════════════════════════════╝\n\n' +
      errors + '\n\n' +
      'Copy server/.env.example to server/.env and fill in the values.\n'
    );
    process.exit(1);
  }

  return result.data;
}

export const googleConfig = loadGoogleConfig();
```

- [ ] **Step 2: Create `server/src/config/auth0.config.ts`**

```ts
import { z } from 'zod';
import 'dotenv/config';

/**
 * Auth0 configuration used to verify incoming access-token JWTs.
 */
const auth0ConfigSchema = z.object({
  domain: z.string().min(1, 'AUTH0_DOMAIN is required'),
  audience: z.string().min(1, 'AUTH0_AUDIENCE is required'),
});

export type Auth0Config = z.infer<typeof auth0ConfigSchema>;

function loadAuth0Config(): Auth0Config {
  const result = auth0ConfigSchema.safeParse({
    domain: process.env.AUTH0_DOMAIN,
    audience: process.env.AUTH0_AUDIENCE,
  });

  if (!result.success) {
    const errors = result.error.issues
      .map((issue) => `  ✗ ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    console.error(
      '\n╔══════════════════════════════════════════════════════╗\n' +
      '║  FATAL: Auth0 configuration is invalid               ║\n' +
      '╚══════════════════════════════════════════════════════╝\n\n' +
      errors + '\n'
    );
    process.exit(1);
  }

  return result.data;
}

export const auth0Config = loadAuth0Config();
```

- [ ] **Step 3: Commit**

```bash
git add server/src/config/google.config.ts server/src/config/auth0.config.ts
git commit -m "feat(server): add google and auth0 config modules"
```

---

## Task 3: OAuth state sign/verify

**Files:**
- Create: `server/src/lib/oauth-state.ts`
- Test: `server/src/__tests__/oauth-state.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd server; npm test -- oauth-state`
Expected: FAIL — cannot find module `../lib/oauth-state.js`.

- [ ] **Step 3: Implement `server/src/lib/oauth-state.ts`**

```ts
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd server; npm test -- oauth-state`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add server/src/lib/oauth-state.ts server/src/__tests__/oauth-state.test.ts
git commit -m "feat(server): add signed OAuth state helper"
```

---

## Task 4: Token encryption (AES-256-GCM)

**Files:**
- Create: `server/src/lib/token-crypto.ts`
- Test: `server/src/__tests__/token-crypto.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd server; npm test -- token-crypto`
Expected: FAIL — cannot find module `../lib/token-crypto.js`.

- [ ] **Step 3: Implement `server/src/lib/token-crypto.ts`**

```ts
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

function key(): Buffer {
  const hex = process.env.CALENDAR_TOKEN_KEY;
  if (!hex) throw new Error('CALENDAR_TOKEN_KEY is not set');
  return Buffer.from(hex, 'hex'); // 32 bytes for AES-256
}

/** Encrypt a string with AES-256-GCM. Returns `iv.tag.ciphertext` (base64 parts). */
export function encryptToken(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key(), iv);
  const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv.toString('base64'), tag.toString('base64'), enc.toString('base64')].join('.');
}

/** Decrypt an `iv.tag.ciphertext` payload produced by `encryptToken`. */
export function decryptToken(payload: string): string {
  const [ivB64, tagB64, encB64] = payload.split('.');
  if (!ivB64 || !tagB64 || !encB64) throw new Error('Malformed ciphertext');
  const decipher = createDecipheriv('aes-256-gcm', key(), Buffer.from(ivB64, 'base64'));
  decipher.setAuthTag(Buffer.from(tagB64, 'base64'));
  return Buffer.concat([
    decipher.update(Buffer.from(encB64, 'base64')),
    decipher.final(),
  ]).toString('utf8');
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd server; npm test -- token-crypto`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add server/src/lib/token-crypto.ts server/src/__tests__/token-crypto.test.ts
git commit -m "feat(server): add AES-256-GCM token encryption"
```

---

## Task 5: Calendar event mapping (pure)

**Files:**
- Create: `server/src/lib/calendar-events.ts`
- Test: `server/src/__tests__/calendar-events.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest';
import { buildGoogleEvent, EVENT_SOURCE, type CycleDay } from '../lib/calendar-events.js';

const day: CycleDay = {
  date: '2026-06-07',
  dayNumber: 7,
  title: 'The Seeker',
  description: 'Reflection and wisdom.',
};

describe('buildGoogleEvent', () => {
  it('builds an all-day event with exclusive end date', () => {
    const ev = buildGoogleEvent(day, '2026-06');
    expect(ev.summary).toBe('✨ Personal Day 7 — The Seeker');
    expect(ev.description).toBe('Reflection and wisdom.');
    expect(ev.start).toEqual({ date: '2026-06-07' });
    expect(ev.end).toEqual({ date: '2026-06-08' }); // exclusive
    expect(ev.transparency).toBe('transparent');
  });

  it('tags the event for idempotent cleanup', () => {
    const ev = buildGoogleEvent(day, '2026-06');
    expect(ev.extendedProperties?.private).toEqual({
      source: EVENT_SOURCE,
      syncMonth: '2026-06',
    });
  });

  it('rolls over month boundaries for the end date', () => {
    const ev = buildGoogleEvent({ ...day, date: '2026-06-30' }, '2026-06');
    expect(ev.end).toEqual({ date: '2026-07-01' });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd server; npm test -- calendar-events`
Expected: FAIL — cannot find module `../lib/calendar-events.js`.

- [ ] **Step 3: Implement `server/src/lib/calendar-events.ts`**

```ts
import type { calendar_v3 } from 'googleapis';

export const EVENT_SOURCE = 'cosmic-blueprint';

export interface CycleDay {
  date: string;        // YYYY-MM-DD
  dayNumber: number;   // 1-9
  title: string;
  description: string;
}

/** Add one day to a YYYY-MM-DD string (UTC), returning YYYY-MM-DD. */
function nextDate(isoDate: string): string {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

/** Map one numerology day to a Google all-day event resource. */
export function buildGoogleEvent(day: CycleDay, syncMonth: string): calendar_v3.Schema$Event {
  return {
    summary: `✨ Personal Day ${day.dayNumber} — ${day.title}`,
    description: day.description,
    start: { date: day.date },
    end: { date: nextDate(day.date) }, // all-day end is exclusive
    transparency: 'transparent',
    extendedProperties: {
      private: { source: EVENT_SOURCE, syncMonth },
    },
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd server; npm test -- calendar-events`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add server/src/lib/calendar-events.ts server/src/__tests__/calendar-events.test.ts
git commit -m "feat(server): add numerology day to Google event mapping"
```

---

## Task 6: Auth0 access-token verification + middleware

**Files:**
- Create: `server/src/lib/verify-access-token.ts`
- Create: `server/src/middleware/require-auth.ts`
- Test: `server/src/__tests__/require-auth.test.ts`

- [ ] **Step 1: Implement `server/src/lib/verify-access-token.ts`**

```ts
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { auth0Config } from '../config/auth0.config.js';

const JWKS = createRemoteJWKSet(
  new URL(`https://${auth0Config.domain}/.well-known/jwks.json`)
);

/** Verify an Auth0 access-token JWT and return its subject. Throws on invalid. */
export async function verifyAccessToken(token: string): Promise<{ sub: string }> {
  const { payload } = await jwtVerify(token, JWKS, {
    issuer: `https://${auth0Config.domain}/`,
    audience: auth0Config.audience,
  });
  if (!payload.sub) throw new Error('Token missing sub');
  return { sub: payload.sub };
}
```

- [ ] **Step 2: Write the failing middleware test**

The middleware is tested with `verifyAccessToken` mocked so no live Auth0 tenant is needed.

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response } from 'express';

vi.mock('../lib/verify-access-token.js', () => ({
  verifyAccessToken: vi.fn(),
}));

import { verifyAccessToken } from '../lib/verify-access-token.js';
import { requireAuth } from '../middleware/require-auth.js';

function mockRes() {
  const res = {} as Response & { _status?: number; _json?: unknown };
  res.status = vi.fn().mockImplementation((c: number) => { res._status = c; return res; });
  res.json = vi.fn().mockImplementation((b: unknown) => { res._json = b; return res; });
  return res;
}

describe('requireAuth', () => {
  beforeEach(() => vi.clearAllMocks());

  it('401s when Authorization header is missing', async () => {
    const req = { headers: {} } as Request;
    const res = mockRes();
    const next = vi.fn();
    await requireAuth(req, res, next);
    expect((res as any)._status).toBe(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('401s on an invalid token', async () => {
    (verifyAccessToken as any).mockRejectedValue(new Error('bad'));
    const req = { headers: { authorization: 'Bearer xyz' } } as Request;
    const res = mockRes();
    const next = vi.fn();
    await requireAuth(req, res, next);
    expect((res as any)._status).toBe(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('sets userSub and calls next on a valid token', async () => {
    (verifyAccessToken as any).mockResolvedValue({ sub: 'auth0|abc' });
    const req = { headers: { authorization: 'Bearer good' } } as Request;
    const res = mockRes();
    const next = vi.fn();
    await requireAuth(req, res, next);
    expect((req as any).userSub).toBe('auth0|abc');
    expect(next).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `cd server; npm test -- require-auth`
Expected: FAIL — cannot find module `../middleware/require-auth.js`.

- [ ] **Step 4: Implement `server/src/middleware/require-auth.ts`**

```ts
import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../lib/verify-access-token.js';

/**
 * Express middleware: requires a valid Auth0 Bearer access token.
 * On success attaches `req.userSub`; otherwise responds 401.
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing bearer token' });
    return;
  }
  try {
    const { sub } = await verifyAccessToken(header.slice('Bearer '.length));
    (req as any).userSub = sub;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd server; npm test -- require-auth`
Expected: PASS (3 tests).

- [ ] **Step 6: Commit**

```bash
git add server/src/lib/verify-access-token.ts server/src/middleware/require-auth.ts server/src/__tests__/require-auth.test.ts
git commit -m "feat(server): add Auth0 bearer auth middleware"
```

---

## Task 7: Supabase token store

**Files:**
- Create: `server/src/lib/calendar-token-store.ts`
- Create: `server/db/google_calendar_tokens.sql`
- Test: `server/src/__tests__/calendar-token-store.test.ts`

- [ ] **Step 1: Create the SQL DDL `server/db/google_calendar_tokens.sql`**

```sql
-- Stores Google Calendar OAuth refresh tokens, keyed to the Auth0 user sub.
create table if not exists google_calendar_tokens (
  user_sub               text primary key,
  refresh_token_enc      text not null,
  numerology_calendar_id text,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);
```

(Run this in the Supabase SQL editor, or via the Supabase MCP `apply_migration`, before deploying. Accessed only by the service-role key — no RLS policy needed.)

- [ ] **Step 2: Write the failing test**

`supabase` is mocked so the test never hits the network. The store builds a small fluent mock matching the calls it makes.

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

const single = vi.fn();
const upsert = vi.fn();
const update = vi.fn();
const del = vi.fn();
const eq = vi.fn();

vi.mock('../config/supabase.config.js', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({ eq: vi.fn(() => ({ maybeSingle: single })) })),
      upsert,
      update: vi.fn(() => ({ eq: update })),
      delete: vi.fn(() => ({ eq: del })),
    })),
  },
}));

import { getToken, saveRefreshToken, saveCalendarId, deleteToken } from '../lib/calendar-token-store.js';

describe('calendar-token-store', () => {
  beforeEach(() => vi.clearAllMocks());

  it('getToken returns the row when present', async () => {
    single.mockResolvedValue({ data: { user_sub: 'auth0|abc', refresh_token_enc: 'enc', numerology_calendar_id: 'cal1' }, error: null });
    const row = await getToken('auth0|abc');
    expect(row?.refresh_token_enc).toBe('enc');
  });

  it('getToken returns null when absent', async () => {
    single.mockResolvedValue({ data: null, error: null });
    expect(await getToken('nobody')).toBeNull();
  });

  it('saveRefreshToken upserts', async () => {
    upsert.mockResolvedValue({ error: null });
    await saveRefreshToken('auth0|abc', 'enc');
    expect(upsert).toHaveBeenCalled();
  });

  it('saveCalendarId updates', async () => {
    update.mockResolvedValue({ error: null });
    await saveCalendarId('auth0|abc', 'cal1');
    expect(update).toHaveBeenCalledWith('user_sub', 'auth0|abc');
  });

  it('deleteToken deletes', async () => {
    del.mockResolvedValue({ error: null });
    await deleteToken('auth0|abc');
    expect(del).toHaveBeenCalledWith('user_sub', 'auth0|abc');
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `cd server; npm test -- calendar-token-store`
Expected: FAIL — cannot find module `../lib/calendar-token-store.js`.

- [ ] **Step 4: Implement `server/src/lib/calendar-token-store.ts`**

```ts
import { supabase } from '../config/supabase.config.js';

const TABLE = 'google_calendar_tokens';

export interface CalendarTokenRow {
  user_sub: string;
  refresh_token_enc: string;
  numerology_calendar_id: string | null;
}

/** Fetch the stored token row for a user, or null if none. */
export async function getToken(userSub: string): Promise<CalendarTokenRow | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('user_sub, refresh_token_enc, numerology_calendar_id')
    .eq('user_sub', userSub)
    .maybeSingle();
  if (error) throw new Error(`Failed to load calendar token: ${error.message}`);
  return (data as CalendarTokenRow) ?? null;
}

/** Insert or replace the encrypted refresh token for a user. */
export async function saveRefreshToken(userSub: string, refreshTokenEnc: string): Promise<void> {
  const { error } = await supabase
    .from(TABLE)
    .upsert(
      { user_sub: userSub, refresh_token_enc: refreshTokenEnc, updated_at: new Date().toISOString() },
      { onConflict: 'user_sub' }
    );
  if (error) throw new Error(`Failed to save refresh token: ${error.message}`);
}

/** Cache the dedicated calendar id for a user. */
export async function saveCalendarId(userSub: string, calendarId: string): Promise<void> {
  const { error } = await supabase
    .from(TABLE)
    .update({ numerology_calendar_id: calendarId, updated_at: new Date().toISOString() })
    .eq('user_sub', userSub);
  if (error) throw new Error(`Failed to save calendar id: ${error.message}`);
}

/** Remove the stored token (on disconnect). */
export async function deleteToken(userSub: string): Promise<void> {
  const { error } = await supabase.from(TABLE).delete().eq('user_sub', userSub);
  if (error) throw new Error(`Failed to delete calendar token: ${error.message}`);
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd server; npm test -- calendar-token-store`
Expected: PASS (5 tests).

- [ ] **Step 6: Commit**

```bash
git add server/src/lib/calendar-token-store.ts server/db/google_calendar_tokens.sql server/src/__tests__/calendar-token-store.test.ts
git commit -m "feat(server): add Supabase calendar token store"
```

---

## Task 8: Google Calendar service

**Files:**
- Create: `server/src/lib/google-calendar.ts`
- Test: `server/src/__tests__/google-calendar.test.ts`

`ensureNumerologyCalendar` and `replaceMonthEvents` accept a `calendar_v3.Calendar`-shaped client so they can be tested with a hand-rolled fake (no `googleapis` mocking).

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect, vi } from 'vitest';

// google.config.ts calls process.exit(1) at import when Google env vars are
// unset. Mock it so the module under test imports cleanly without real env.
// (vi.mock is hoisted above the imports below.)
vi.mock('../config/google.config.js', () => ({
  googleConfig: {
    clientId: 'test-client-id',
    clientSecret: 'test-client-secret',
    redirectUri: 'http://localhost:3001/api/calendar/callback',
    stateSecret: 'test-state-secret-1234567890',
    tokenKey: 'a'.repeat(64),
    appUrl: 'http://localhost:8080',
  },
}));

import { ensureNumerologyCalendar, replaceMonthEvents } from '../lib/google-calendar.js';
import type { CycleDay } from '../lib/calendar-events.js';

function fakeCalendar(overrides: any = {}) {
  return {
    calendars: { insert: vi.fn().mockResolvedValue({ data: { id: 'new-cal' } }) },
    calendarList: { get: vi.fn().mockResolvedValue({ data: { id: 'existing' } }) },
    events: {
      list: vi.fn().mockResolvedValue({ data: { items: [] } }),
      delete: vi.fn().mockResolvedValue({}),
      insert: vi.fn().mockResolvedValue({}),
    },
    ...overrides,
  } as any;
}

describe('ensureNumerologyCalendar', () => {
  it('returns the existing id when it still resolves', async () => {
    const cal = fakeCalendar();
    const id = await ensureNumerologyCalendar(cal, 'existing');
    expect(id).toBe('existing');
    expect(cal.calendars.insert).not.toHaveBeenCalled();
  });

  it('creates a calendar when none cached', async () => {
    const cal = fakeCalendar();
    const id = await ensureNumerologyCalendar(cal, null);
    expect(id).toBe('new-cal');
    expect(cal.calendars.insert).toHaveBeenCalled();
  });

  it('recreates when the cached id 404s', async () => {
    const cal = fakeCalendar({
      calendarList: { get: vi.fn().mockRejectedValue({ code: 404 }) },
    });
    const id = await ensureNumerologyCalendar(cal, 'gone');
    expect(id).toBe('new-cal');
    expect(cal.calendars.insert).toHaveBeenCalled();
  });
});

describe('replaceMonthEvents', () => {
  const days: CycleDay[] = [
    { date: '2026-06-01', dayNumber: 1, title: 'The Leader', description: 'x' },
    { date: '2026-06-02', dayNumber: 2, title: 'The Diplomat', description: 'y' },
  ];

  it('deletes existing tagged events then inserts the new ones', async () => {
    const cal = fakeCalendar({
      events: {
        list: vi.fn().mockResolvedValue({ data: { items: [{ id: 'old1' }, { id: 'old2' }] } }),
        delete: vi.fn().mockResolvedValue({}),
        insert: vi.fn().mockResolvedValue({}),
      },
    });
    const count = await replaceMonthEvents(cal, 'cal1', '2026-06', days);
    expect(cal.events.delete).toHaveBeenCalledTimes(2);
    expect(cal.events.insert).toHaveBeenCalledTimes(2);
    expect(count).toBe(2);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd server; npm test -- google-calendar`
Expected: FAIL — cannot find module `../lib/google-calendar.js`.

- [ ] **Step 3: Implement `server/src/lib/google-calendar.ts`**

```ts
import { google, calendar_v3 } from 'googleapis';
import type { OAuth2Client } from 'google-auth-library';
import { googleConfig } from '../config/google.config.js';
import { buildGoogleEvent, EVENT_SOURCE, type CycleDay } from './calendar-events.js';

const SCOPES = ['https://www.googleapis.com/auth/calendar'];
const CALENDAR_SUMMARY = 'Numerology Cycles';

/** Create a fresh OAuth2 client configured for this app. */
export function createOAuthClient(): OAuth2Client {
  return new google.auth.OAuth2(
    googleConfig.clientId,
    googleConfig.clientSecret,
    googleConfig.redirectUri
  );
}

/** Build the Google consent URL, embedding our signed state. */
export function getAuthUrl(state: string): string {
  return createOAuthClient().generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent', // force a refresh_token every time
    scope: SCOPES,
    state,
  });
}

/** Exchange an authorization code for a refresh token. */
export async function exchangeCodeForRefreshToken(code: string): Promise<string> {
  const client = createOAuthClient();
  const { tokens } = await client.getToken(code);
  if (!tokens.refresh_token) {
    throw new Error('Google did not return a refresh token');
  }
  return tokens.refresh_token;
}

/** A Calendar API client bound to a user's refresh token. */
export function calendarClientFor(refreshToken: string): calendar_v3.Calendar {
  const auth = createOAuthClient();
  auth.setCredentials({ refresh_token: refreshToken });
  return google.calendar({ version: 'v3', auth });
}

/** Revoke a refresh token at Google (best-effort). */
export async function revokeRefreshToken(refreshToken: string): Promise<void> {
  const auth = createOAuthClient();
  auth.setCredentials({ refresh_token: refreshToken });
  await auth.revokeCredentials();
}

/**
 * Ensure a dedicated "Numerology Cycles" calendar exists.
 * Reuses `existingId` if it still resolves; otherwise creates a new one.
 * Returns the calendar id to use.
 */
export async function ensureNumerologyCalendar(
  cal: calendar_v3.Calendar,
  existingId: string | null
): Promise<string> {
  if (existingId) {
    try {
      await cal.calendarList.get({ calendarId: existingId });
      return existingId;
    } catch (err: any) {
      if (err?.code !== 404) throw err;
      // fall through and recreate
    }
  }
  const created = await cal.calendars.insert({
    requestBody: { summary: CALENDAR_SUMMARY },
  });
  const id = created.data.id;
  if (!id) throw new Error('Failed to create numerology calendar');
  return id;
}

/**
 * Replace this month's numerology events: delete any previously-synced
 * (tagged) events in the month, then insert the new day set.
 * Returns the number of events created.
 */
export async function replaceMonthEvents(
  cal: calendar_v3.Calendar,
  calendarId: string,
  syncMonth: string, // YYYY-MM
  days: CycleDay[]
): Promise<number> {
  const existing = await cal.events.list({
    calendarId,
    privateExtendedProperty: [`source=${EVENT_SOURCE}`, `syncMonth=${syncMonth}`],
    showDeleted: false,
    maxResults: 2500,
  });
  for (const ev of existing.data.items ?? []) {
    if (ev.id) await cal.events.delete({ calendarId, eventId: ev.id });
  }
  for (const day of days) {
    await cal.events.insert({ calendarId, requestBody: buildGoogleEvent(day, syncMonth) });
  }
  return days.length;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd server; npm test -- google-calendar`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add server/src/lib/google-calendar.ts server/src/__tests__/google-calendar.test.ts
git commit -m "feat(server): add Google Calendar OAuth + sync service"
```

---

## Task 9: Calendar routes

**Files:**
- Create: `server/src/routes/calendar.ts`

Routes are kept thin (logic lives in tested libs), matching the untested-route pattern of `payments.ts`/`webhooks.ts`.

- [ ] **Step 1: Implement `server/src/routes/calendar.ts`**

```ts
import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/require-auth.js';
import { signState, verifyState } from '../lib/oauth-state.js';
import { encryptToken, decryptToken } from '../lib/token-crypto.js';
import {
  getToken, saveRefreshToken, saveCalendarId, deleteToken,
} from '../lib/calendar-token-store.js';
import {
  getAuthUrl, exchangeCodeForRefreshToken, calendarClientFor,
  ensureNumerologyCalendar, replaceMonthEvents, revokeRefreshToken,
} from '../lib/google-calendar.js';
import { googleConfig } from '../config/google.config.js';
import { logger } from '../middleware/request-logger.js';

const router = Router();

// ─── GET /api/calendar/status ────────────────────────────
router.get('/status', requireAuth, async (req: Request, res: Response) => {
  const sub = (req as any).userSub as string;
  const row = await getToken(sub);
  res.json({ connected: !!row });
});

// ─── GET /api/calendar/connect ───────────────────────────
// Returns the Google consent URL (frontend redirects the browser to it).
router.get('/connect', requireAuth, (req: Request, res: Response) => {
  const sub = (req as any).userSub as string;
  const url = getAuthUrl(signState({ sub }));
  res.json({ url });
});

// ─── GET /api/calendar/callback ──────────────────────────
// Google redirects here. No bearer token — identity comes from signed state.
router.get('/callback', async (req: Request, res: Response) => {
  const code = typeof req.query.code === 'string' ? req.query.code : '';
  const state = typeof req.query.state === 'string' ? req.query.state : '';
  try {
    const { sub } = verifyState(state);
    const refreshToken = await exchangeCodeForRefreshToken(code);
    await saveRefreshToken(sub, encryptToken(refreshToken));
    res.redirect(`${googleConfig.appUrl}/dashboard?calendar=connected`);
  } catch (err) {
    logger.error({ msg: 'calendar_callback_failed', err: String(err) });
    res.redirect(`${googleConfig.appUrl}/dashboard?calendar=error`);
  }
});

// ─── POST /api/calendar/sync ─────────────────────────────
const syncSchema = z.object({
  syncMonth: z.string().regex(/^\d{4}-\d{2}$/, 'syncMonth must be YYYY-MM'),
  days: z.array(z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    dayNumber: z.number().int().min(1).max(9),
    title: z.string().min(1),
    description: z.string().min(1),
  })).min(1).max(31),
});

router.post('/sync', requireAuth, async (req: Request, res: Response) => {
  const sub = (req as any).userSub as string;
  const parsed = syncSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Invalid payload' });
    return;
  }

  const row = await getToken(sub);
  if (!row) {
    res.status(409).json({ error: 'Google Calendar not connected', code: 'NOT_CONNECTED' });
    return;
  }

  try {
    const cal = calendarClientFor(decryptToken(row.refresh_token_enc));
    const calendarId = await ensureNumerologyCalendar(cal, row.numerology_calendar_id);
    if (calendarId !== row.numerology_calendar_id) {
      await saveCalendarId(sub, calendarId);
    }
    const created = await replaceMonthEvents(cal, calendarId, parsed.data.syncMonth, parsed.data.days);
    res.json({ created, calendarId });
  } catch (err: any) {
    // invalid_grant => refresh token revoked/expired; force reconnect.
    if (String(err?.message ?? err).includes('invalid_grant')) {
      await deleteToken(sub);
      res.status(409).json({ error: 'Reconnect required', code: 'NOT_CONNECTED' });
      return;
    }
    logger.error({ msg: 'calendar_sync_failed', err: String(err) });
    res.status(502).json({ error: 'Calendar sync failed' });
  }
});

// ─── POST /api/calendar/disconnect ───────────────────────
router.post('/disconnect', requireAuth, async (req: Request, res: Response) => {
  const sub = (req as any).userSub as string;
  const row = await getToken(sub);
  if (row) {
    try {
      await revokeRefreshToken(decryptToken(row.refresh_token_enc));
    } catch (err) {
      logger.warn({ msg: 'calendar_revoke_failed', err: String(err) });
    }
    await deleteToken(sub);
  }
  res.json({ connected: false });
});

export default router;
```

- [ ] **Step 2: Type-check**

Run: `cd server; npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add server/src/routes/calendar.ts
git commit -m "feat(server): add calendar OAuth + sync routes"
```

---

## Task 10: Mount router and document env

**Files:**
- Modify: `server/src/index.ts`
- Modify/Create: `server/.env.example`

- [ ] **Step 1: Mount the router in `server/src/index.ts`**

Add the import alongside the other route imports (after line 6):

```ts
import calendarRouter from './routes/calendar.js';
```

Add the mount alongside the other routes (after the `webhooksRouter` line):

```ts
app.use('/api/calendar', calendarRouter);
```

- [ ] **Step 2: Append the new env vars to `server/.env.example`**

Add these lines (create the file if it does not exist):

```
# ── Google Calendar sync ──
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_OAUTH_REDIRECT_URI=http://localhost:3001/api/calendar/callback
CALENDAR_STATE_SECRET=change-me-to-a-long-random-string
# 32-byte key as 64 hex chars: generate with `openssl rand -hex 32`
CALENDAR_TOKEN_KEY=
APP_URL=http://localhost:8080

# ── Auth0 (access-token verification) ──
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_AUDIENCE=https://api.cosmic-blueprint
```

- [ ] **Step 3: Type-check and run the server test suite**

Run: `cd server; npx tsc --noEmit; npm test`
Expected: type-check clean; all tests (existing + new) pass.

- [ ] **Step 4: Commit**

```bash
git add server/src/index.ts server/.env.example
git commit -m "feat(server): mount calendar router and document env"
```

---

## Task 11: Add Vitest to the frontend

**Files:**
- Modify: `package.json` (root)

The frontend has no test runner yet; add Vitest (works with the existing Vite config).

- [ ] **Step 1: Add the dev dependency and script**

In root `package.json`, add to `devDependencies`:

```json
    "vitest": "^2.1.5",
```

And add to `scripts`:

```json
    "test": "vitest run",
```

- [ ] **Step 2: Install**

Run: `npm install`
Expected: installs without errors.

- [ ] **Step 3: Sanity-check the runner**

Run: `npm test`
Expected: Vitest runs and reports "no test files found" (exit 0) — confirms the runner works.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "build: add vitest to frontend"
```

---

## Task 12: `buildMonthlyCycleEvents` helper

**Files:**
- Modify: `src/utils/numerology.ts` (export `reduceToSingleDigit`)
- Create: `src/utils/calendarCycles.ts`
- Test: `src/utils/calendarCycles.test.ts`

- [ ] **Step 1: Export the reduction helper**

In `src/utils/numerology.ts`, change line 70 from:

```ts
const reduceToSingleDigit = (num: number): { final: number; steps: string[] } => {
```

to:

```ts
export const reduceToSingleDigit = (num: number): { final: number; steps: string[] } => {
```

- [ ] **Step 2: Write the failing test**

```ts
import { describe, it, expect } from 'vitest';
import { buildMonthlyCycleEvents } from './calendarCycles';

describe('buildMonthlyCycleEvents', () => {
  // birthDate 1990-05-15, June 2026.
  // PY = reduce(5 + 15 + 2026) = reduce(2046) = 2+0+4+6=12 -> 3
  // PM = reduce(PY 3 + month 6) = 9
  // PD(day d) = reduce(9 + d)
  it('produces one entry per day of the month', () => {
    const events = buildMonthlyCycleEvents('1990-05-15', 2026, 6);
    expect(events).toHaveLength(30); // June has 30 days
  });

  it('computes Personal Day numbers in 1-9 with correct dates', () => {
    const events = buildMonthlyCycleEvents('1990-05-15', 2026, 6);
    expect(events[0].date).toBe('2026-06-01');
    expect(events[0].dayNumber).toBe(1);   // reduce(9+1)=10->1
    expect(events[8].dayNumber).toBe(9);   // reduce(9+9)=18->9
    events.forEach((e) => {
      expect(e.dayNumber).toBeGreaterThanOrEqual(1);
      expect(e.dayNumber).toBeLessThanOrEqual(9);
    });
  });

  it('attaches title and description from numberMeanings', () => {
    const events = buildMonthlyCycleEvents('1990-05-15', 2026, 6);
    expect(events[0].title).toBe('The Leader'); // dayNumber 1
    expect(events[0].description.length).toBeGreaterThan(0);
  });

  it('zero-pads months and days', () => {
    const events = buildMonthlyCycleEvents('1990-05-15', 2026, 1);
    expect(events[0].date).toBe('2026-01-01');
    expect(events).toHaveLength(31);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm test -- calendarCycles`
Expected: FAIL — cannot find module `./calendarCycles`.

- [ ] **Step 4: Implement `src/utils/calendarCycles.ts`**

```ts
import { reduceToSingleDigit } from './numerology';
import { numberMeanings } from './numerologyMeanings';

export interface CycleDay {
  date: string;        // YYYY-MM-DD
  dayNumber: number;   // 1-9
  title: string;
  description: string;
}

const pad = (n: number): string => String(n).padStart(2, '0');

/**
 * Build the per-day Personal Day payload for one calendar month.
 *
 * Personal Year  = reduce(birthMonth + birthDay + year)
 * Personal Month = reduce(personalYear + month)
 * Personal Day   = reduce(personalMonth + dayOfMonth)
 *
 * These formulas mirror src/utils/numerology.ts but take the year/month
 * explicitly (the calculate* helpers there read `new Date()` internally and
 * only ever yield "today").
 */
export function buildMonthlyCycleEvents(
  birthDate: string, // YYYY-MM-DD
  year: number,
  month: number // 1-12
): CycleDay[] {
  const [, bMonthStr, bDayStr] = birthDate.split('-');
  const bMonth = Number(bMonthStr);
  const bDay = Number(bDayStr);

  const personalYear = reduceToSingleDigit(bMonth + bDay + year).final;
  const personalMonth = reduceToSingleDigit(personalYear + month).final;

  const daysInMonth = new Date(year, month, 0).getDate();
  const events: CycleDay[] = [];

  for (let d = 1; d <= daysInMonth; d++) {
    const dayNumber = reduceToSingleDigit(personalMonth + d).final;
    const meaning = numberMeanings[dayNumber];
    events.push({
      date: `${year}-${pad(month)}-${pad(d)}`,
      dayNumber,
      title: meaning?.title ?? `Number ${dayNumber}`,
      description: meaning?.description ?? '',
    });
  }
  return events;
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test -- calendarCycles`
Expected: PASS (4 tests).

- [ ] **Step 6: Commit**

```bash
git add src/utils/numerology.ts src/utils/calendarCycles.ts src/utils/calendarCycles.test.ts
git commit -m "feat: add monthly Personal Day cycle builder"
```

---

## Task 13: Auth0 audience config (frontend)

**Files:**
- Modify: `src/auth/auth0-config.ts`
- Modify: `src/App.tsx`
- Modify/Create: `.env.example` (root)

- [ ] **Step 1: Expose the audience in `src/auth/auth0-config.ts`**

Add an `audience` field to the exported `auth0Config` object (after the `clientId` line):

```ts
  audience: import.meta.env.VITE_AUTH0_AUDIENCE || '',
```

- [ ] **Step 2: Pass audience + scope in `src/App.tsx`**

Change the `authorizationParams` block (currently lines 46-48) to:

```tsx
            authorizationParams={{
              redirect_uri: auth0Config.callbackUrl,
              audience: auth0Config.audience || undefined,
              scope: 'openid profile email',
            }}
```

- [ ] **Step 3: Document the env var in root `.env.example`**

Add (create the file if absent):

```
VITE_AUTH0_AUDIENCE=https://api.cosmic-blueprint
VITE_API_URL=http://localhost:3001
```

- [ ] **Step 4: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/auth/auth0-config.ts src/App.tsx .env.example
git commit -m "feat: request Auth0 access token with API audience"
```

---

## Task 14: `useGoogleCalendar` hook

**Files:**
- Create: `src/hooks/useGoogleCalendar.ts`

- [ ] **Step 1: Implement `src/hooks/useGoogleCalendar.ts`**

```ts
import { useCallback } from 'react';
import { useOptionalAuth0 } from '@/auth/useOptionalAuth0';
import { auth0Config } from '@/auth/auth0-config';
import { buildMonthlyCycleEvents } from '@/utils/calendarCycles';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface SyncResult {
  created: number;
  calendarId: string;
}

/** Client for the backend /api/calendar endpoints. */
export function useGoogleCalendar() {
  const { getAccessTokenSilently } = useOptionalAuth0();

  const authHeaders = useCallback(async (): Promise<Record<string, string>> => {
    const token = await getAccessTokenSilently({
      authorizationParams: { audience: auth0Config.audience },
    });
    return { Authorization: `Bearer ${token}` };
  }, [getAccessTokenSilently]);

  const status = useCallback(async (): Promise<boolean> => {
    const res = await fetch(`${API_URL}/api/calendar/status`, { headers: await authHeaders() });
    if (!res.ok) return false;
    const data = await res.json();
    return !!data.connected;
  }, [authHeaders]);

  const connect = useCallback(async (): Promise<void> => {
    const res = await fetch(`${API_URL}/api/calendar/connect`, { headers: await authHeaders() });
    if (!res.ok) throw new Error('Failed to start Google connection');
    const { url } = await res.json();
    window.location.href = url; // top-level redirect to Google consent
  }, [authHeaders]);

  const sync = useCallback(async (birthDate: string): Promise<SyncResult> => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const syncMonth = `${year}-${String(month).padStart(2, '0')}`;
    const days = buildMonthlyCycleEvents(birthDate, year, month);

    const res = await fetch(`${API_URL}/api/calendar/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(await authHeaders()) },
      body: JSON.stringify({ syncMonth, days }),
    });
    if (res.status === 409) {
      const err = new Error('Google Calendar not connected') as Error & { code?: string };
      err.code = 'NOT_CONNECTED';
      throw err;
    }
    if (!res.ok) throw new Error('Calendar sync failed');
    return res.json();
  }, [authHeaders]);

  const disconnect = useCallback(async (): Promise<void> => {
    const res = await fetch(`${API_URL}/api/calendar/disconnect`, {
      method: 'POST',
      headers: await authHeaders(),
    });
    if (!res.ok) throw new Error('Failed to disconnect');
  }, [authHeaders]);

  return { status, connect, sync, disconnect };
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useGoogleCalendar.ts
git commit -m "feat: add useGoogleCalendar hook"
```

---

## Task 15: Dashboard UI (connect card + per-report sync)

**Files:**
- Modify: `src/pages/Dashboard.tsx`

- [ ] **Step 1: Add imports**

Add to the lucide-react import (line 4-7), append `CalendarCheck`, `CalendarPlus`, `Link2Off`:

```tsx
  Sparkles, Trash2, Eye, Plus, Star,
  Calendar, Hash, LogOut, Crown,
  CalendarCheck, CalendarPlus, Link2Off,
```

Add after the existing imports:

```tsx
import { useGoogleCalendar } from '@/hooks/useGoogleCalendar';
import { toast } from 'sonner';
```

- [ ] **Step 2: Add calendar state + handlers inside the `Dashboard` component**

Insert after the `reports` state declaration (after line 19):

```tsx
  const calendar = useGoogleCalendar();
  const [calConnected, setCalConnected] = useState(false);
  const [syncingId, setSyncingId] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    calendar.status().then(setCalConnected).catch(() => setCalConnected(false));
    // Reflect the post-OAuth redirect (?calendar=connected|error).
    const params = new URLSearchParams(window.location.search);
    const cal = params.get('calendar');
    if (cal === 'connected') {
      setCalConnected(true);
      toast.success('Google Calendar connected');
    } else if (cal === 'error') {
      toast.error('Could not connect Google Calendar');
    }
  }, [userId]);

  const handleConnect = async () => {
    try {
      await calendar.connect();
    } catch {
      toast.error('Could not start Google connection');
    }
  };

  const handleDisconnect = async () => {
    try {
      await calendar.disconnect();
      setCalConnected(false);
      toast.success('Google Calendar disconnected');
    } catch {
      toast.error('Could not disconnect');
    }
  };

  const handleSync = async (report: SavedReport) => {
    setSyncingId(report.id);
    try {
      const { created } = await calendar.sync(report.birthDate);
      toast.success(`Synced ${created} day${created !== 1 ? 's' : ''} to your calendar`);
    } catch (err) {
      if ((err as { code?: string }).code === 'NOT_CONNECTED') {
        setCalConnected(false);
        toast.error('Reconnect Google Calendar and try again');
      } else {
        toast.error('Calendar sync failed');
      }
    } finally {
      setSyncingId(null);
    }
  };
```

- [ ] **Step 3: Add the connect card to the Account section**

Inside the `Account` section, immediately after the closing `</div>` of the `glass-morphism p-5` block (after line 230), add:

```tsx
            <div className="glass-morphism p-5 mt-4">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                    {calConnected
                      ? <CalendarCheck className="w-5 h-5 text-emerald-400" />
                      : <Calendar className="w-5 h-5 text-amber-400" />}
                  </div>
                  <div>
                    <div className="text-white text-sm font-semibold">Google Calendar</div>
                    <div className="text-xs text-gray-400">
                      {calConnected
                        ? 'Connected — sync any report below to your "Numerology Cycles" calendar.'
                        : 'Connect to sync your monthly Personal Day cycles.'}
                    </div>
                  </div>
                </div>
                {calConnected ? (
                  <Button
                    variant="ghost"
                    onClick={handleDisconnect}
                    className="text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                  >
                    <Link2Off className="w-4 h-4 mr-2" />
                    Disconnect
                  </Button>
                ) : (
                  <Button onClick={handleConnect} className="cosmic-button">
                    <CalendarPlus className="w-4 h-4 mr-2" />
                    Connect Google Calendar
                  </Button>
                )}
              </div>
            </div>
```

- [ ] **Step 4: Add a per-report "Sync this month" button**

In the report card, immediately after the "View Full Report" `<Button>` block (after line 198), add:

```tsx
                      {calConnected && (
                        <Button
                          onClick={() => handleSync(report)}
                          disabled={syncingId === report.id}
                          variant="ghost"
                          className="w-full text-teal-400 hover:text-teal-300 hover:bg-teal-500/10 text-sm mt-1"
                        >
                          <CalendarPlus className="w-4 h-4 mr-1.5" />
                          {syncingId === report.id ? 'Syncing…' : 'Sync this month to Calendar'}
                        </Button>
                      )}
```

- [ ] **Step 5: Type-check and lint**

Run: `npx tsc --noEmit; npm run lint`
Expected: no type errors; lint passes (or only pre-existing warnings).

- [ ] **Step 6: Commit**

```bash
git add src/pages/Dashboard.tsx
git commit -m "feat: add Google Calendar connect + sync UI to dashboard"
```

---

## Task 16: External setup + manual verification

**Files:** none (configuration + manual QA)

- [ ] **Step 1: Provision Google Cloud OAuth**

In Google Cloud Console: create/select a project → enable the **Google Calendar API** → configure the **OAuth consent screen** (External, add yourself as a **test user**, add the `.../auth/calendar` scope) → create an **OAuth Client ID** (type: Web application) → add the redirect URI for each environment:
- `http://localhost:3001/api/calendar/callback`
- `https://<render-app>/api/calendar/callback`

Copy the client id/secret into `server/.env` (and Render env vars).

- [ ] **Step 2: Register the Auth0 API (audience)**

In the Auth0 dashboard: **Applications → APIs → Create API**. Set an identifier (e.g. `https://api.cosmic-blueprint`). Use that value for `AUTH0_AUDIENCE` (server) and `VITE_AUTH0_AUDIENCE` (frontend).

- [ ] **Step 3: Generate secrets and create the Supabase table**

Generate the token key: `openssl rand -hex 32` → `CALENDAR_TOKEN_KEY`. Set a long random `CALENDAR_STATE_SECRET`. Run `server/db/google_calendar_tokens.sql` in the Supabase SQL editor (or via the Supabase MCP `apply_migration`).

- [ ] **Step 4: Add `Authorization` to CORS (verify)**

Confirm `server/src/index.ts` CORS `allowedHeaders` already includes `Authorization` (it does). No change needed unless missing.

- [ ] **Step 5: Manual end-to-end test (local)**

Start backend (`cd server; npm run dev`) and frontend (`npm run dev`). Sign in, go to **Dashboard**:
1. Click **Connect Google Calendar** → complete Google consent → redirected back with "connected" toast.
2. On a saved report, click **Sync this month to Calendar** → success toast with day count.
3. In Google Calendar, confirm a **"Numerology Cycles"** calendar exists with one all-day event per day this month, titled `✨ Personal Day N — <archetype>`.
4. Click sync again → confirm **no duplicates** (events replaced).
5. Click **Disconnect** → status flips; a later sync prompts to reconnect.

- [ ] **Step 6: Final regression**

Run: `cd server; npm test; cd ..; npm test; npx tsc --noEmit`
Expected: all suites green, no type errors.

---

## Notes / Known limitations (v1, by design)

- Sync covers the **current month only**; re-run next month for the next set.
- The dedicated calendar holds one person's cycle at a time: syncing a second report **replaces** the month's events (idempotency keys on `syncMonth`, not on person). Multi-person months are out of scope.
- The feature is gated by **Google OAuth verification** for public use (see spec). In Testing mode it works for added test users with an "unverified app" warning.
