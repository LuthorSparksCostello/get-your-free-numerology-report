import { describe, it, expect } from 'vitest';
import { createHmac } from 'node:crypto';
import { verifyWebhookSignature } from '../lib/webhook-verifier.js';

describe('Webhook signature verification', () => {
  const signingKey = 'test-signing-key-abc123';
  const webhookUrl = 'https://example.com/api/payments/webhooks/square';
  const rawBody = '{"type":"payment.updated","data":{"id":"pay_123"}}';

  // Generate a valid signature for the test payload
  function generateSignature(body: string, key: string, url: string): string {
    return createHmac('sha256', key)
      .update(url + body)
      .digest('base64');
  }

  it('accepts a valid signature', () => {
    const signature = generateSignature(rawBody, signingKey, webhookUrl);
    const result = verifyWebhookSignature(rawBody, signature, signingKey, webhookUrl);
    expect(result).toBe(true);
  });

  it('rejects a tampered body', () => {
    const signature = generateSignature(rawBody, signingKey, webhookUrl);
    const tamperedBody = rawBody.replace('pay_123', 'pay_999');
    const result = verifyWebhookSignature(tamperedBody, signature, signingKey, webhookUrl);
    expect(result).toBe(false);
  });

  it('rejects an invalid signature', () => {
    const result = verifyWebhookSignature(
      rawBody,
      'completely-wrong-signature',
      signingKey,
      webhookUrl
    );
    expect(result).toBe(false);
  });

  it('rejects with wrong signing key', () => {
    const signature = generateSignature(rawBody, signingKey, webhookUrl);
    const result = verifyWebhookSignature(rawBody, signature, 'wrong-key', webhookUrl);
    expect(result).toBe(false);
  });

  it('rejects with wrong webhook URL', () => {
    const signature = generateSignature(rawBody, signingKey, webhookUrl);
    const result = verifyWebhookSignature(
      rawBody,
      signature,
      signingKey,
      'https://wrong-url.com/webhook'
    );
    expect(result).toBe(false);
  });

  it('rejects empty body', () => {
    const result = verifyWebhookSignature('', 'some-sig', signingKey, webhookUrl);
    expect(result).toBe(false);
  });

  it('rejects empty signature', () => {
    const result = verifyWebhookSignature(rawBody, '', signingKey, webhookUrl);
    expect(result).toBe(false);
  });

  it('rejects empty signing key', () => {
    const signature = generateSignature(rawBody, signingKey, webhookUrl);
    const result = verifyWebhookSignature(rawBody, signature, '', webhookUrl);
    expect(result).toBe(false);
  });

  it('handles Buffer input for raw body', () => {
    const bodyBuffer = Buffer.from(rawBody);
    const signature = generateSignature(rawBody, signingKey, webhookUrl);
    const result = verifyWebhookSignature(bodyBuffer, signature, signingKey, webhookUrl);
    expect(result).toBe(true);
  });

  it('rejects replayed/modified events (body changed but sig reused)', () => {
    const signature = generateSignature(rawBody, signingKey, webhookUrl);
    // Simulating a replay where an attacker modifies the amount
    const replayedBody = '{"type":"payment.updated","data":{"id":"pay_123","amount":999999}}';
    const result = verifyWebhookSignature(replayedBody, signature, signingKey, webhookUrl);
    expect(result).toBe(false);
  });
});
