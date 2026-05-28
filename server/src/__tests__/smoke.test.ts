import { describe, it, expect } from 'vitest';

/**
 * End-to-end smoke test for subscription flow.
 *
 * Boots the server, calls /config, then /subscribe with a sandbox nonce,
 * checks subscription-status, and verifies the full flow.
 *
 * Run with: SQUARE_ENV=sandbox npm test
 */

const API_URL = process.env.TEST_API_URL || 'http://localhost:3001';

describe.skipIf(!process.env.SQUARE_ACCESS_TOKEN)(
  'Smoke test — subscription flow',
  () => {
    it('completes a full config → subscribe → status flow', async () => {
      // Step 1: Fetch config
      const configRes = await fetch(`${API_URL}/api/payments/config`);
      expect(configRes.ok).toBe(true);

      const config = await configRes.json();
      expect(config.applicationId).toBeDefined();
      expect(config.locationId).toBeDefined();
      expect(config.environment).toBe('sandbox');
      console.log(`✅ Config: appId=${config.applicationId.substring(0, 20)}...`);

      // Step 2: Create subscription
      const userId = `auth0|smoke-${Date.now()}`;
      const subscribeRes = await fetch(`${API_URL}/api/payments/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceId: 'cnon:card-nonce-ok',
          email: `smoke-${Date.now()}@example.com`,
          name: 'Smoke Test User',
          userId,
          idempotencyKey: crypto.randomUUID(),
        }),
      });

      expect(subscribeRes.ok).toBe(true);
      const sub = await subscribeRes.json();
      expect(sub.success).toBe(true);
      expect(sub.subscriptionId).toBeDefined();

      // Step 3: Check subscription status
      const statusRes = await fetch(
        `${API_URL}/api/payments/subscription-status?userId=${encodeURIComponent(userId)}`
      );
      expect(statusRes.ok).toBe(true);
      const status = await statusRes.json();
      expect(status.hasActiveSubscription).toBe(true);
      expect(status.subscription.id).toBe(sub.subscriptionId);

      console.log(
        `✅ Smoke test passed!\n` +
        `   Subscription ID: ${sub.subscriptionId}\n` +
        `   Status: ${sub.status}\n` +
        `   Card: ${sub.cardBrand} ****${sub.last4}\n` +
        `   Customer: ${sub.customerId}`
      );
    }, 45_000);

    it('health check returns ok', async () => {
      const res = await fetch(`${API_URL}/health`);
      expect(res.ok).toBe(true);
      const data = await res.json();
      expect(data.status).toBe('ok');
    });
  }
);
