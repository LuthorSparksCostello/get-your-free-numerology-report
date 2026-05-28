import { Router, type Request, type Response } from 'express';
import { squareConfig } from '../config/square.config.js';
import { supabase } from '../config/supabase.config.js';
import { verifyWebhookSignature } from '../lib/webhook-verifier.js';

const router = Router();

/**
 * POST /api/payments/webhooks/square
 *
 * Receives webhook events from Square. Verifies the HMAC-SHA256 signature
 * against the RAW request body before processing.
 *
 * Handles:
 * - subscription.created
 * - subscription.updated
 * - invoice.payment_made
 * - payment.updated
 */
router.post('/square', async (req: Request, res: Response) => {
  const log = (req as any).log || console;

  // ── Verify signature ──
  const signature = req.headers['x-square-hmacsha256-signature'] as string;
  const rawBody = (req as any).rawBody as string;
  const webhookUrl = `${process.env.SERVER_URL || 'http://localhost:3001'}/api/payments/webhooks/square`;

  if (!signature || !rawBody) {
    log.warn({ msg: 'webhook_missing_signature_or_body' });
    res.status(400).json({ error: 'Missing signature or body' });
    return;
  }

  const isValid = verifyWebhookSignature(
    rawBody,
    signature,
    squareConfig.webhookSignatureKey,
    webhookUrl
  );

  if (!isValid) {
    log.warn({ msg: 'webhook_signature_invalid' });
    res.status(403).json({ error: 'Invalid signature' });
    return;
  }

  // ── Process event ──
  const event = req.body;
  const eventType = event?.type;

  log.info({
    msg: 'webhook_received',
    eventType,
    eventId: event?.event_id,
  });

  try {
    switch (eventType) {
      case 'subscription.created':
      case 'subscription.updated': {
        const subData = event?.data?.object?.subscription;
        if (!subData?.id) break;

        await supabase
          .from('subscriptions')
          .update({
            status: subData.status,
            current_period_start: subData.startDate || undefined,
            canceled_at: subData.canceledDate || undefined,
            updated_at: new Date().toISOString(),
          })
          .eq('square_subscription_id', subData.id);

        log.info({
          msg: 'webhook_subscription_updated',
          subscriptionId: subData.id,
          status: subData.status,
        });
        break;
      }

      case 'invoice.payment_made': {
        const invoiceData = event?.data?.object?.invoice;
        const paymentRequests = invoiceData?.paymentRequests || [];
        const subscriptionId = invoiceData?.subscriptionId;

        for (const pr of paymentRequests) {
          if (pr.computedAmountMoney && pr.totalCompletedAmountMoney) {
            // Find the subscription in our DB
            const { data: sub } = await supabase
              .from('subscriptions')
              .select('id, user_id')
              .eq('square_subscription_id', subscriptionId)
              .single();

            if (sub) {
              await supabase.from('payments').insert({
                square_payment_id: invoiceData.id,
                subscription_id: sub.id,
                status: 'COMPLETED',
                amount_cents: Number(pr.computedAmountMoney.amount) || 900,
                currency: pr.computedAmountMoney.currency || 'USD',
                user_id: sub.user_id,
              });
            }
          }
        }

        log.info({
          msg: 'webhook_invoice_payment',
          invoiceId: invoiceData?.id,
          subscriptionId,
        });
        break;
      }

      case 'payment.updated': {
        const paymentData = event?.data?.object?.payment;
        if (!paymentData?.id) break;

        await supabase
          .from('payments')
          .update({
            status: paymentData.status,
            updated_at: new Date().toISOString(),
          })
          .eq('square_payment_id', paymentData.id);

        log.info({
          msg: 'webhook_payment_updated',
          squarePaymentId: paymentData.id,
          status: paymentData.status,
        });
        break;
      }

      default:
        log.info({ msg: 'webhook_unhandled_event', eventType });
    }
  } catch (err) {
    log.error({ msg: 'webhook_processing_error', error: String(err) });
    res.status(500).json({ error: 'Webhook processing failed' });
    return;
  }

  res.status(200).json({ received: true });
});

export default router;
