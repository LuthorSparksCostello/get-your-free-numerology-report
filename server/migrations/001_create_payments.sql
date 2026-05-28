-- ============================================================
-- Cosmic Blueprint — Subscriptions + Payments Schema
-- Run this in Supabase SQL Editor (Dashboard → SQL → New query)
-- ============================================================

-- Subscriptions table — tracks active Square subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  square_subscription_id TEXT UNIQUE,
  square_customer_id    TEXT NOT NULL,
  square_card_id        TEXT,
  user_id               TEXT NOT NULL,
  user_email            TEXT,
  status                TEXT NOT NULL DEFAULT 'PENDING',
  plan_name             TEXT NOT NULL DEFAULT 'premium_monthly',
  amount_cents          INTEGER NOT NULL DEFAULT 900,
  currency              TEXT NOT NULL DEFAULT 'USD',
  last4                 TEXT,
  card_brand            TEXT,
  current_period_start  TIMESTAMPTZ,
  current_period_end    TIMESTAMPTZ,
  canceled_at           TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Payments table — individual payment events from webhooks
CREATE TABLE IF NOT EXISTS payments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  square_payment_id TEXT UNIQUE,
  subscription_id   UUID REFERENCES subscriptions(id),
  status            TEXT NOT NULL DEFAULT 'PENDING',
  amount_cents      INTEGER NOT NULL CHECK (amount_cents > 0),
  currency          TEXT NOT NULL DEFAULT 'USD',
  last4             TEXT,
  card_brand        TEXT,
  idempotency_key   TEXT UNIQUE,
  user_id           TEXT,
  receipt_url       TEXT,
  raw_response      JSONB,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_square_id ON subscriptions(square_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_customer ON subscriptions(square_customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_subscription ON payments(subscription_id);
CREATE INDEX IF NOT EXISTS idx_payments_square_id ON payments(square_payment_id);

-- Row-level security
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on subscriptions" ON subscriptions
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on payments" ON payments
  FOR ALL USING (true) WITH CHECK (true);

COMMENT ON TABLE subscriptions IS 'Tracks Square recurring subscriptions for premium access.';
COMMENT ON TABLE payments IS 'Individual payment events from Square webhooks.';
