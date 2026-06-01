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
