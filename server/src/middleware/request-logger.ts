import pino from 'pino';
import type { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'node:crypto';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport:
    process.env.NODE_ENV !== 'production'
      ? { target: 'pino-pretty', options: { colorize: true } }
      : undefined,
  redact: {
    paths: [
      'req.headers.authorization',
      'req.body.sourceId',
      'req.body.cardNumber',
      'req.body.cvv',
      'req.body.expiration',
      'accessToken',
    ],
    censor: '[REDACTED]',
  },
});

/**
 * Structured request logging middleware.
 * Assigns a unique request ID, logs request start and completion with latency.
 */
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const requestId = (req.headers['x-request-id'] as string) || randomUUID();
  const startTime = Date.now();

  // Attach request ID to response headers and request object
  res.setHeader('x-request-id', requestId);
  (req as any).requestId = requestId;

  // Create a child logger with request context
  (req as any).log = logger.child({ requestId });

  (req as any).log.info({
    msg: 'request_start',
    method: req.method,
    url: req.originalUrl,
    userAgent: req.headers['user-agent'],
  });

  res.on('finish', () => {
    const latencyMs = Date.now() - startTime;
    (req as any).log.info({
      msg: 'request_complete',
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      latencyMs,
    });
  });

  next();
}
