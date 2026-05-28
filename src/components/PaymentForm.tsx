import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { CreditCard, Loader2, CheckCircle, AlertCircle, Lock } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────

interface PaymentConfig {
  applicationId: string;
  locationId: string;
  environment: 'sandbox' | 'production';
}

interface SubscriptionResult {
  success: boolean;
  subscriptionId?: string;
  status?: string;
  last4?: string;
  cardBrand?: string;
  customerId?: string;
  error?: {
    code: string;
    category: string;
    message: string;
    retryable: boolean;
  };
  errors?: Array<{ field: string; message: string }>;
}

type PaymentState = 'idle' | 'loading-sdk' | 'ready' | 'processing' | 'success' | 'error';

interface PaymentFormProps {
  /** Amount in cents per month (e.g. 900 = $9.00/mo) */
  amountCents: number;
  /** Currency code */
  currency?: string;
  /** User's email (from Auth0) */
  userEmail: string;
  /** User's display name */
  userName: string;
  /** User's Auth0 ID (sub) */
  userId: string;
  /** Called when subscription succeeds */
  onSuccess?: (result: SubscriptionResult) => void;
  /** Called when subscription fails */
  onError?: (result: SubscriptionResult) => void;
}

// ─── Square SDK CDN URLs ─────────────────────────────────

const SQUARE_SDK_URLS = {
  sandbox: 'https://sandbox.web.squarecdn.com/v1/square.js',
  production: 'https://web.squarecdn.com/v1/square.js',
} as const;

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// ─── Component ───────────────────────────────────────────

const PaymentForm = ({
  amountCents,
  currency = 'USD',
  userEmail,
  userName,
  userId,
  onSuccess,
  onError,
}: PaymentFormProps) => {
  const [state, setState] = useState<PaymentState>('idle');
  const [config, setConfig] = useState<PaymentConfig | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [result, setResult] = useState<SubscriptionResult | null>(null);
  const cardContainerRef = useRef<HTMLDivElement>(null);
  const cardInstanceRef = useRef<any>(null);

  const formattedAmount = (amountCents / 100).toLocaleString('en-US', {
    style: 'currency',
    currency,
  });

  // ── 1. Fetch config from backend ──
  useEffect(() => {
    let cancelled = false;

    async function fetchConfig() {
      try {
        const res = await fetch(`${API_URL}/api/payments/config`);
        if (!res.ok) throw new Error('Failed to load payment config');
        const data: PaymentConfig = await res.json();
        if (!cancelled) setConfig(data);
      } catch (err) {
        if (!cancelled) {
          setErrorMessage('Unable to connect to payment server. Please try again later.');
          setState('error');
        }
      }
    }

    fetchConfig();
    return () => { cancelled = true; };
  }, []);

  // ── 2. Load Square SDK + mount card ──
  useEffect(() => {
    if (!config || !cardContainerRef.current) return;

    let cancelled = false;

    async function initSquare() {
      setState('loading-sdk');

      if (!(window as any).Square) {
        const sdkUrl = SQUARE_SDK_URLS[config!.environment];
        await new Promise<void>((resolve, reject) => {
          if (document.querySelector(`script[src="${sdkUrl}"]`)) {
            const checkInterval = setInterval(() => {
              if ((window as any).Square) {
                clearInterval(checkInterval);
                resolve();
              }
            }, 100);
            return;
          }

          const script = document.createElement('script');
          script.src = sdkUrl;
          script.async = true;
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Failed to load Square SDK'));
          document.head.appendChild(script);
        });
      }

      if (cancelled) return;

      try {
        const payments = (window as any).Square.payments(
          config!.applicationId,
          config!.locationId
        );

        const card = await payments.card();
        await card.attach(cardContainerRef.current);
        cardInstanceRef.current = card;

        if (!cancelled) setState('ready');
      } catch (err: any) {
        if (!cancelled) {
          setErrorMessage(err?.message || 'Failed to initialize payment form.');
          setState('error');
        }
      }
    }

    initSquare();
    return () => { cancelled = true; };
  }, [config]);

  // ── 3. Handle subscription ──
  const handleSubscribe = useCallback(async () => {
    if (!cardInstanceRef.current || state !== 'ready') return;

    setState('processing');
    setErrorMessage('');

    try {
      // Tokenize the card
      const tokenResult = await cardInstanceRef.current.tokenize();

      if (tokenResult.status !== 'OK') {
        const tokenErrors = tokenResult.errors?.map((e: any) => e.message).join('. ') ||
          'Card validation failed. Please check your details.';
        setErrorMessage(tokenErrors);
        setState('ready');
        return;
      }

      // Generate idempotency key
      const idempotencyKey = crypto.randomUUID();

      // Create subscription via backend
      const subscribeRes = await fetch(`${API_URL}/api/payments/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceId: tokenResult.token,
          email: userEmail,
          name: userName,
          userId,
          idempotencyKey,
        }),
      });

      const data: SubscriptionResult = await subscribeRes.json();

      if (data.success) {
        setResult(data);
        setState('success');
        onSuccess?.(data);
      } else {
        const msg = data.error?.message ||
          data.errors?.map((e) => e.message).join('. ') ||
          'Subscription failed. Please try again.';
        setErrorMessage(msg);
        setState(data.error?.retryable ? 'ready' : 'error');
        onError?.(data);
      }
    } catch (err: any) {
      setErrorMessage('Network error. Please check your connection and try again.');
      setState('ready');
    }
  }, [state, userEmail, userName, userId, onSuccess, onError]);

  // ── Render ──

  // Success state
  if (state === 'success' && result) {
    return (
      <div className="text-center space-y-4 p-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 mb-2">
          <CheckCircle className="w-8 h-8 text-emerald-400" />
        </div>
        <h3 className="text-xl font-bold text-white font-heading">
          Subscription <span className="text-emerald-400">Active!</span>
        </h3>
        <div className="space-y-2 text-sm">
          {result.last4 && (
            <p className="text-gray-400">
              Card ending in <span className="text-white font-mono">{result.last4}</span>
              {result.cardBrand && (
                <span className="ml-1 text-gray-500">({result.cardBrand})</span>
              )}
            </p>
          )}
          <p className="text-gray-400">
            <span className="text-emerald-400 font-semibold">{formattedAmount}/month</span>
            {' '}· Billed monthly
          </p>
          <p className="text-gray-500 text-xs mt-3">
            You can cancel anytime from your dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Card input container */}
      <div>
        <label
          htmlFor="sq-card"
          className="block text-sm font-medium text-gray-300 mb-2"
        >
          Card Details
        </label>
        <div
          id="sq-card"
          ref={cardContainerRef}
          className="min-h-[56px] rounded-xl border border-white/10 bg-white/[0.03] p-3 transition-colors focus-within:border-amber-500/40"
          role="group"
          aria-label="Credit card input"
        />
      </div>

      {/* Email confirmation */}
      <div className="flex items-center gap-2 p-3 rounded-lg bg-white/[0.03] border border-white/5">
        <span className="text-xs text-gray-500">Subscribing as</span>
        <span className="text-xs text-gray-300 font-medium">{userEmail}</span>
      </div>

      {/* Error message */}
      {errorMessage && (
        <div
          className="flex items-start gap-2.5 p-3 rounded-lg bg-red-500/10 border border-red-500/20"
          role="alert"
          aria-live="assertive"
        >
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-red-300 text-sm">{errorMessage}</p>
        </div>
      )}

      {/* Status messages (aria-live for accessibility) */}
      <div className="sr-only" aria-live="polite">
        {state === 'loading-sdk' && 'Loading payment form...'}
        {state === 'processing' && 'Setting up your subscription...'}
        {state === 'success' && 'Subscription active!'}
      </div>

      {/* Subscribe button */}
      <Button
        onClick={handleSubscribe}
        disabled={state !== 'ready'}
        className="cosmic-button w-full py-3 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        id="subscribe-button"
        aria-busy={state === 'processing'}
      >
        {state === 'loading-sdk' ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Loading...
          </>
        ) : state === 'processing' ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Setting up subscription...
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4 mr-2" />
            Subscribe · {formattedAmount}/month
          </>
        )}
      </Button>

      {/* Security badge */}
      <p className="flex items-center justify-center gap-1.5 text-xs text-gray-500">
        <Lock className="w-3 h-3" />
        Secured by Square · Cancel anytime · Card data never touches our servers
      </p>
    </div>
  );
};

export default PaymentForm;
