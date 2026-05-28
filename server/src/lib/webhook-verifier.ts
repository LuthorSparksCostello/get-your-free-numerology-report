import { createHmac } from 'node:crypto';

/**
 * Verifies a Square webhook signature using HMAC-SHA256.
 *
 * IMPORTANT: The signature must be verified against the RAW request body,
 * not a re-serialized JSON string. If your framework auto-parses JSON,
 * you must capture the raw body first.
 *
 * @param rawBody     - The raw request body as a string or Buffer
 * @param signature   - The value of the `x-square-hmacsha256-signature` header
 * @param signingKey  - Your webhook signature key from Square Dashboard
 * @param webhookUrl  - The notification URL registered in Square Dashboard
 * @returns true if the signature is valid
 *
 * Reference: https://developer.squareup.com/docs/webhooks/step3validate
 */
export function verifyWebhookSignature(
  rawBody: string | Buffer,
  signature: string,
  signingKey: string,
  webhookUrl: string
): boolean {
  if (!rawBody || !signature || !signingKey || !webhookUrl) {
    return false;
  }

  // Square's verification: HMAC-SHA256(signingKey, webhookUrl + rawBody)
  const payload = webhookUrl + rawBody.toString();
  const expectedSignature = createHmac('sha256', signingKey)
    .update(payload)
    .digest('base64');

  // Constant-time comparison to prevent timing attacks
  if (signature.length !== expectedSignature.length) {
    return false;
  }

  const sigBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  try {
    return sigBuffer.length === expectedBuffer.length &&
      constantTimeEqual(sigBuffer, expectedBuffer);
  } catch {
    return false;
  }
}

/**
 * Constant-time comparison of two buffers to prevent timing attacks.
 */
function constantTimeEqual(a: Buffer, b: Buffer): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a[i]! ^ b[i]!;
  }
  return result === 0;
}
