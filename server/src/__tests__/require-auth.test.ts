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
