import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { logger, requestLogger } from './middleware/request-logger.js';
import paymentsRouter from './routes/payments.js';
import webhooksRouter from './routes/webhooks.js';

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

// ── CORS ──
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:8080')
  .split(',')
  .map((o) => o.trim());

app.use(
  cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-request-id'],
  })
);

// ── Body parsing ──
// JSON parser that also captures the raw body for webhook signature verification.
app.use(
  express.json({
    verify: (req, _res, buf) => {
      // Store raw body for webhook signature verification
      (req as any).rawBody = buf.toString();
    },
  })
);

// ── Request logging ──
app.use(requestLogger);

// ── Routes ──
app.use('/api/payments', paymentsRouter);
app.use('/api/payments/webhooks', webhooksRouter);

// ── Health check ──
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Start ──
app.listen(PORT, () => {
  logger.info({ msg: 'server_started', port: PORT, origins: allowedOrigins });
});

export { app };
