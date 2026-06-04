/**
 * Emails that are always treated as premium, regardless of payment.
 *
 * `luthorsparks@gmail.com` is hard-coded so the guarantee holds in every
 * environment without extra config; `PREMIUM_EMAIL_ALLOWLIST` (comma-separated)
 * can add more.
 */
const ALWAYS_PREMIUM = ['luthorsparks@gmail.com'];

function loadAllowlist(): Set<string> {
  const fromEnv = (process.env.PREMIUM_EMAIL_ALLOWLIST ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return new Set([...ALWAYS_PREMIUM, ...fromEnv]);
}

/** True if the email is on the always-premium allowlist (case-insensitive). */
export function isPremiumEmail(email?: string | null): boolean {
  if (!email) return false;
  return loadAllowlist().has(email.trim().toLowerCase());
}
