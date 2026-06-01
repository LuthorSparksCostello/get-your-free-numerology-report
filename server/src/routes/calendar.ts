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
