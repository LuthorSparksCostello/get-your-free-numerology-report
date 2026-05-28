import { describe, it, expect } from 'vitest';
import { z } from 'zod';

/**
 * Tests for the /subscribe endpoint input validation.
 */

const subscribeSchema = z.object({
  sourceId: z.string().min(1, 'sourceId (card token) is required'),
  email: z.string().email('A valid email is required'),
  name: z.string().min(1, 'Name is required'),
  userId: z.string().min(1, 'userId (Auth0 sub) is required'),
  idempotencyKey: z.string().uuid('idempotencyKey must be a valid UUID v4'),
});

describe('Subscribe input validation', () => {
  const validPayload = {
    sourceId: 'cnon:card-nonce-ok',
    email: 'cosmic@example.com',
    name: 'Cosmic Explorer',
    userId: 'auth0|abc123',
    idempotencyKey: '550e8400-e29b-41d4-a716-446655440000',
  };

  it('accepts a valid payload', () => {
    const result = subscribeSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it('rejects empty sourceId', () => {
    const result = subscribeSchema.safeParse({ ...validPayload, sourceId: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('sourceId');
    }
  });

  it('rejects missing sourceId', () => {
    const { sourceId, ...rest } = validPayload;
    const result = subscribeSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it('rejects invalid email', () => {
    const result = subscribeSchema.safeParse({ ...validPayload, email: 'not-an-email' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('email');
    }
  });

  it('rejects empty email', () => {
    const result = subscribeSchema.safeParse({ ...validPayload, email: '' });
    expect(result.success).toBe(false);
  });

  it('rejects empty name', () => {
    const result = subscribeSchema.safeParse({ ...validPayload, name: '' });
    expect(result.success).toBe(false);
  });

  it('rejects empty userId', () => {
    const result = subscribeSchema.safeParse({ ...validPayload, userId: '' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid idempotencyKey (not a UUID)', () => {
    const result = subscribeSchema.safeParse({
      ...validPayload,
      idempotencyKey: 'not-a-uuid',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('idempotencyKey');
    }
  });

  it('accepts a single-word name', () => {
    const result = subscribeSchema.safeParse({ ...validPayload, name: 'Cosmic' });
    expect(result.success).toBe(true);
  });

  it('accepts a multi-word name', () => {
    const result = subscribeSchema.safeParse({
      ...validPayload,
      name: 'Cosmic Blueprint Explorer III',
    });
    expect(result.success).toBe(true);
  });
});
