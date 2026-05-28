import { z } from 'zod';
import 'dotenv/config';

/**
 * Square configuration schema.
 * Validates all required environment variables at boot and FAILS LOUDLY
 * if any are missing or malformed.
 */
const squareConfigSchema = z.object({
  accessToken: z
    .string()
    .min(1, 'SQUARE_ACCESS_TOKEN is required'),
  applicationId: z
    .string()
    .min(1, 'SQUARE_APPLICATION_ID is required'),
  locationId: z
    .string()
    .min(1, 'SQUARE_LOCATION_ID is required'),
  webhookSignatureKey: z
    .string()
    .min(1, 'SQUARE_WEBHOOK_SIGNATURE_KEY is required'),
  environment: z
    .enum(['sandbox', 'production'])
    .default('sandbox'),
});

export type SquareConfig = z.infer<typeof squareConfigSchema>;

function loadSquareConfig(): SquareConfig {
  const result = squareConfigSchema.safeParse({
    accessToken: process.env.SQUARE_ACCESS_TOKEN,
    applicationId: process.env.SQUARE_APPLICATION_ID,
    locationId: process.env.SQUARE_LOCATION_ID,
    webhookSignatureKey: process.env.SQUARE_WEBHOOK_SIGNATURE_KEY,
    environment: process.env.SQUARE_ENV || 'sandbox',
  });

  if (!result.success) {
    const errors = result.error.issues
      .map((issue) => `  ✗ ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    console.error(
      '\n╔══════════════════════════════════════════════════════╗\n' +
      '║  FATAL: Square configuration is missing or invalid  ║\n' +
      '╚══════════════════════════════════════════════════════╝\n\n' +
      errors + '\n\n' +
      'Copy server/.env.example to server/.env and fill in the values.\n'
    );
    process.exit(1);
  }

  if (result.data.environment === 'production') {
    console.warn(
      '\n⚠️  SQUARE_ENV=production — live payments are ENABLED.\n' +
      '   Ensure SQUARE_ACCESS_TOKEN is a production token.\n'
    );
  }

  return result.data;
}

export const squareConfig = loadSquareConfig();
