import { describe, it, expect } from 'vitest';

/**
 * Integration tests against the Square Sandbox.
 *
 * These tests require a running server with valid SQUARE_* env vars pointing
 * to the Square Sandbox. They use the documented sandbox test nonces:
 *
 * - cnon:card-nonce-ok          → Successful subscription
 * - cnon:card-nonce-declined    → Declined card
 *
 * Run with: SQUARE_ENV=sandbox npm test
 */

const API_URL = process.env.TEST_API_URL || 'http://localhost:3001';

async function subscribe(payload: Record<string, unknown>) {
  const res = await fetch(`${API_URL}/api/payments/subscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return { status: res.status, data: await res.json() };
}

describe.skipIf(!process.env.SQUARE_ACCESS_TOKEN)(
  'Square Sandbox subscription integration',
  () => {
    it('successfully creates a subscription with the sandbox success nonce', async () => {
      const idempotencyKey = crypto.randomUUID();
      const { status, data } = await subscribe({
        sourceId: 'cnon:card-nonce-ok',
        email: `test-${Date.now()}@example.com`,
        name: 'Test User',
        userId: `auth0|test-${Date.now()}`,
        idempotencyKey,
      });

      expect(status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.subscriptionId).toBeDefined();
      expect(data.last4).toBeDefined();
      console.log(`✅ Subscription created: id=${data.subscriptionId}`);
    }, 30_000);

    it('fails subscription with the sandbox declined nonce', async () => {
      const idempotencyKey = crypto.randomUUID();
      const { status, data } = await subscribe({
        sourceId: 'cnon:card-nonce-declined',
        email: `test-declined-${Date.now()}@example.com`,
        name: 'Test Declined',
        userId: `auth0|test-declined-${Date.now()}`,
        idempotencyKey,
      });

      expect(status).toBeGreaterThanOrEqual(400);
      expect(data.success).toBe(false);
      console.log(`✅ Declined path: code=${data.error?.code}`);
    }, 30_000);

    it('returns original subscription on idempotency key replay', async () => {
      const idempotencyKey = crypto.randomUUID();
      const email = `test-idemp-${Date.now()}@example.com`;
      const userId = `auth0|test-idemp-${Date.now()}`;

      const first = await subscribe({
        sourceId: 'cnon:card-nonce-ok',
        email,
        name: 'Test Idempotency',
        userId,
        idempotencyKey,
      });

      expect(first.data.success).toBe(true);

      const second = await subscribe({
        sourceId: 'cnon:card-nonce-ok',
        email,
        name: 'Test Idempotency',
        userId,
        idempotencyKey,
      });

      expect(second.data.success).toBe(true);
      expect(second.data.customerId).toBe(first.data.customerId);
      console.log(`✅ Idempotency verified: customerId=${first.data.customerId}`);
    }, 30_000);
  }
);
