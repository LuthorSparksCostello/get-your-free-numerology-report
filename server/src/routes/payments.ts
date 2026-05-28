import { Router, type Request, type Response } from 'express';
import { Client, Environment, ApiError } from 'square';
import { z } from 'zod';
import { randomUUID } from 'node:crypto';
import { squareConfig } from '../config/square.config.js';
import { supabase } from '../config/supabase.config.js';
import { mapSquareError } from '../lib/square-errors.js';

const router = Router();

// Initialize Square client
const squareClient = new Client({
  accessToken: squareConfig.accessToken,
  environment:
    squareConfig.environment === 'production'
      ? Environment.Production
      : Environment.Sandbox,
});

// ─── GET /api/payments/config ────────────────────────────
// Returns public config for the frontend to initialize the Square Web Payments SDK.
// Never returns secrets.
router.get('/config', (_req: Request, res: Response) => {
  res.json({
    applicationId: squareConfig.applicationId,
    locationId: squareConfig.locationId,
    environment: squareConfig.environment,
  });
});

// ─── POST /api/payments/subscribe ────────────────────────
// Creates a Square Customer, stores card on file, and creates a subscription.

const subscribeSchema = z.object({
  sourceId: z
    .string()
    .min(1, 'sourceId (card token) is required'),
  email: z
    .string()
    .email('A valid email is required'),
  name: z
    .string()
    .min(1, 'Name is required'),
  userId: z
    .string()
    .min(1, 'userId (Auth0 sub) is required'),
  idempotencyKey: z
    .string()
    .uuid('idempotencyKey must be a valid UUID v4'),
});

router.post('/subscribe', async (req: Request, res: Response) => {
  const log = (req as any).log || console;

  // ── Validate input ──
  const parsed = subscribeSchema.safeParse(req.body);
  if (!parsed.success) {
    const errors = parsed.error.issues.map((i) => ({
      field: i.path.join('.'),
      message: i.message,
    }));
    log.warn({ msg: 'subscribe_validation_failed', errors });
    res.status(400).json({ success: false, errors });
    return;
  }

  const { sourceId, email, name, userId, idempotencyKey } = parsed.data;

  try {
    log.info({ msg: 'subscribe_initiated', email, userId });

    // ── Step 1: Create or find Square Customer ──
    let customerId: string;

    // Search for existing customer by email
    const { result: searchResult } = await squareClient.customersApi.searchCustomers({
      query: {
        filter: {
          emailAddress: { exact: email },
        },
      },
    });

    if (searchResult.customers && searchResult.customers.length > 0) {
      customerId = searchResult.customers[0].id!;
      log.info({ msg: 'customer_found', customerId });
    } else {
      // Create new customer
      const nameParts = name.split(' ');
      const { result: createResult } = await squareClient.customersApi.createCustomer({
        idempotencyKey: `cust-${idempotencyKey}`,
        givenName: nameParts[0],
        familyName: nameParts.slice(1).join(' ') || undefined,
        emailAddress: email,
        referenceId: userId,
      });
      customerId = createResult.customer!.id!;
      log.info({ msg: 'customer_created', customerId });
    }

    // ── Step 2: Store card on file ──
    const { result: cardResult } = await squareClient.cardsApi.createCard({
      idempotencyKey: `card-${idempotencyKey}`,
      sourceId,
      card: {
        customerId,
      },
    });

    const card = cardResult.card!;
    const cardId = card.id!;
    const last4 = card.last4 || null;
    const cardBrand = card.cardBrand || null;

    log.info({ msg: 'card_stored', cardId, last4, cardBrand });

    // ── Step 3: Ensure subscription plan exists in catalog ──
    const planId = await ensureSubscriptionPlan(log);

    // ── Step 4: Create the subscription ──
    const { result: subResult } = await squareClient.subscriptionsApi.createSubscription({
      idempotencyKey: `sub-${idempotencyKey}`,
      locationId: squareConfig.locationId,
      planVariationId: planId,
      customerId,
      cardId,
      timezone: 'America/Chicago',
    });

    const subscription = subResult.subscription!;

    log.info({
      msg: 'subscription_created',
      subscriptionId: subscription.id,
      status: subscription.status,
    });

    // ── Step 5: Persist to Supabase ──
    const { error: dbError } = await supabase.from('subscriptions').insert({
      square_subscription_id: subscription.id,
      square_customer_id: customerId,
      square_card_id: cardId,
      user_id: userId,
      user_email: email,
      status: subscription.status,
      plan_name: 'premium_monthly',
      amount_cents: 900,
      currency: 'USD',
      last4,
      card_brand: cardBrand,
      current_period_start: subscription.startDate,
    });

    if (dbError) {
      log.error({ msg: 'subscribe_db_persist_failed', error: dbError });
    }

    res.json({
      success: true,
      subscriptionId: subscription.id,
      status: subscription.status,
      last4,
      cardBrand,
      customerId,
    });
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      const squareErrors = err.errors || [];
      const firstError = squareErrors[0];
      const errorCode = firstError?.code || 'UNKNOWN';
      const mapped = mapSquareError(errorCode);

      log.warn({
        msg: 'subscribe_square_error',
        squareErrorCode: errorCode,
        squareCategory: firstError?.category,
        detail: firstError?.detail,
      });

      res.status(err.statusCode || 400).json({
        success: false,
        error: mapped,
      });
      return;
    }

    log.error({ msg: 'subscribe_unexpected_error', error: String(err) });
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        category: 'API_ERROR',
        message: 'An internal error occurred. Please try again.',
        retryable: true,
      },
    });
  }
});

// ─── POST /api/payments/cancel ───────────────────────────
// Cancels an active subscription.

const cancelSchema = z.object({
  subscriptionId: z.string().min(1, 'subscriptionId is required'),
  userId: z.string().min(1, 'userId is required'),
});

router.post('/cancel', async (req: Request, res: Response) => {
  const log = (req as any).log || console;

  const parsed = cancelSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, errors: parsed.error.issues });
    return;
  }

  const { subscriptionId, userId } = parsed.data;

  try {
    // Verify ownership
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('square_subscription_id')
      .eq('square_subscription_id', subscriptionId)
      .eq('user_id', userId)
      .single();

    if (!sub) {
      res.status(404).json({ success: false, error: { message: 'Subscription not found' } });
      return;
    }

    // Cancel at end of current billing period
    const { result } = await squareClient.subscriptionsApi.cancelSubscription(subscriptionId);

    await supabase
      .from('subscriptions')
      .update({
        status: result.subscription?.status || 'CANCELED',
        canceled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('square_subscription_id', subscriptionId);

    log.info({ msg: 'subscription_canceled', subscriptionId });

    res.json({
      success: true,
      status: result.subscription?.status,
      canceledDate: result.subscription?.canceledDate,
    });
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      const firstError = err.errors?.[0];
      log.error({ msg: 'cancel_square_error', detail: firstError?.detail });
      res.status(err.statusCode || 400).json({
        success: false,
        error: mapSquareError(firstError?.code || 'UNKNOWN'),
      });
      return;
    }
    log.error({ msg: 'cancel_unexpected_error', error: String(err) });
    res.status(500).json({
      success: false,
      error: { message: 'Failed to cancel subscription. Please try again.' },
    });
  }
});

// ─── GET /api/payments/subscription-status ───────────────
// Returns the current user's subscription status.

router.get('/subscription-status', async (req: Request, res: Response) => {
  const userId = req.query.userId as string;
  if (!userId) {
    res.status(400).json({ success: false, error: 'userId query param required' });
    return;
  }

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .in('status', ['ACTIVE', 'PENDING'])
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  res.json({
    success: true,
    hasActiveSubscription: !!sub,
    subscription: sub
      ? {
          id: sub.square_subscription_id,
          status: sub.status,
          planName: sub.plan_name,
          amountCents: sub.amount_cents,
          last4: sub.last4,
          cardBrand: sub.card_brand,
          currentPeriodEnd: sub.current_period_end,
          canceledAt: sub.canceled_at,
        }
      : null,
  });
});

// ─── Helper: Ensure subscription plan exists ─────────────

let cachedPlanVariationId: string | null = null;

async function ensureSubscriptionPlan(log: any): Promise<string> {
  if (cachedPlanVariationId) return cachedPlanVariationId;

  // Search for existing plan variation
  const { result: searchResult } = await squareClient.catalogApi.searchCatalogObjects({
    objectTypes: ['SUBSCRIPTION_PLAN_VARIATION'],
  });

  if (searchResult.objects && searchResult.objects.length > 0) {
    cachedPlanVariationId = searchResult.objects[0].id;
    log.info({ msg: 'plan_variation_found', planVariationId: cachedPlanVariationId });
    return cachedPlanVariationId!;
  }

  // Create plan + plan variation in a single batch
  // Square API v2024-12-18 requires `pricing.priceMoney` instead of `recurringPriceMoney`
  const { result: batchResult } = await squareClient.catalogApi.batchUpsertCatalogObjects({
    idempotencyKey: randomUUID(),
    batches: [
      {
        objects: [
          {
            type: 'SUBSCRIPTION_PLAN',
            id: '#cosmic-plan',
            subscriptionPlanData: {
              name: 'Cosmic Blueprint Premium',
              phases: [
                {
                  cadence: 'MONTHLY',
                  ordinal: BigInt(0),
                },
              ],
            },
          },
          {
            type: 'SUBSCRIPTION_PLAN_VARIATION',
            id: '#cosmic-variation',
            subscriptionPlanVariationData: {
              name: 'Monthly $9',
              subscriptionPlanId: '#cosmic-plan',
              phases: [
                {
                  cadence: 'MONTHLY',
                  ordinal: BigInt(0),
                  pricing: {
                    type: 'STATIC',
                    priceMoney: {
                      amount: BigInt(900),
                      currency: 'USD',
                    },
                  },
                },
              ],
            },
          },
        ],
      },
    ],
  });

  // Find the variation in the response
  const createdObjects = batchResult.objects || [];
  const variation = createdObjects.find((o) => o.type === 'SUBSCRIPTION_PLAN_VARIATION');

  if (variation) {
    cachedPlanVariationId = variation.id;
    log.info({ msg: 'plan_and_variation_created', planVariationId: cachedPlanVariationId });
  } else {
    // Fallback: search again
    const { result: fallbackSearch } = await squareClient.catalogApi.searchCatalogObjects({
      objectTypes: ['SUBSCRIPTION_PLAN_VARIATION'],
    });
    if (fallbackSearch.objects && fallbackSearch.objects.length > 0) {
      cachedPlanVariationId = fallbackSearch.objects[0].id;
      log.info({ msg: 'plan_variation_found_fallback', planVariationId: cachedPlanVariationId });
    } else {
      throw new Error('Failed to create subscription plan variation');
    }
  }

  return cachedPlanVariationId!;
}

export default router;

