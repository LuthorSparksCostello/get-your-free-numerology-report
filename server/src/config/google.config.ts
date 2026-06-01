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
