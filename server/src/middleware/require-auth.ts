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
