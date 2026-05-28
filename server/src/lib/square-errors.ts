/**
 * Maps Square error codes to a stable internal error shape.
 * Used by the /charge endpoint and surfaced to the frontend.
 */
export interface PaymentError {
  /** Internal error code matching Square's error code */
  code: string;
  /** Error category: PAYMENT_METHOD_ERROR, INVALID_REQUEST_ERROR, etc. */
  category: string;
  /** Human-readable message safe to show to the user */
  message: string;
  /** Whether the client should retry with the same card */
  retryable: boolean;
}

/**
 * Maps known Square error codes to user-friendly messages.
 * Reference: https://developer.squareup.com/docs/payments-api/error-codes
 */
const ERROR_MAP: Record<string, Omit<PaymentError, 'code'>> = {
  CARD_DECLINED: {
    category: 'PAYMENT_METHOD_ERROR',
    message: 'Your card was declined. Please try a different card.',
    retryable: false,
  },
  CVV_FAILURE: {
    category: 'PAYMENT_METHOD_ERROR',
    message: 'The CVV code is incorrect. Please check and try again.',
    retryable: true,
  },
  ADDRESS_VERIFICATION_FAILURE: {
    category: 'PAYMENT_METHOD_ERROR',
    message: 'Address verification failed. Please check your billing address.',
    retryable: true,
  },
  INVALID_EXPIRATION: {
    category: 'PAYMENT_METHOD_ERROR',
    message: 'The card expiration date is invalid. Please check and try again.',
    retryable: true,
  },
  INSUFFICIENT_FUNDS: {
    category: 'PAYMENT_METHOD_ERROR',
    message: 'Insufficient funds. Please try a different card.',
    retryable: false,
  },
  GENERIC_DECLINE: {
    category: 'PAYMENT_METHOD_ERROR',
    message: 'Your card was declined. Please try a different payment method.',
    retryable: false,
  },
  PAYMENT_LIMIT_EXCEEDED: {
    category: 'PAYMENT_METHOD_ERROR',
    message: 'Payment limit exceeded. Please try a smaller amount or different card.',
    retryable: false,
  },
  RATE_LIMITED: {
    category: 'RATE_LIMIT_ERROR',
    message: 'Too many requests. Please wait a moment and try again.',
    retryable: true,
  },
  TEMPORARILY_UNAVAILABLE: {
    category: 'API_ERROR',
    message: 'The payment service is temporarily unavailable. Please try again shortly.',
    retryable: true,
  },
  CARD_TOKEN_EXPIRED: {
    category: 'INVALID_REQUEST_ERROR',
    message: 'Your session has expired. Please re-enter your card details.',
    retryable: true,
  },
  CARD_TOKEN_USED: {
    category: 'INVALID_REQUEST_ERROR',
    message: 'This payment token has already been used. Please try again.',
    retryable: true,
  },
  INVALID_CARD: {
    category: 'PAYMENT_METHOD_ERROR',
    message: 'The card number is invalid. Please check and try again.',
    retryable: true,
  },
  CARD_EXPIRED: {
    category: 'PAYMENT_METHOD_ERROR',
    message: 'Your card has expired. Please use a different card.',
    retryable: false,
  },
};

const DEFAULT_ERROR: Omit<PaymentError, 'code'> = {
  category: 'UNKNOWN_ERROR',
  message: 'An unexpected error occurred. Please try again.',
  retryable: true,
};

/**
 * Maps a Square error code string to a stable PaymentError object.
 */
export function mapSquareError(code: string): PaymentError {
  const mapped = ERROR_MAP[code] || DEFAULT_ERROR;
  return { code, ...mapped };
}

/**
 * Returns all known error codes (for testing).
 */
export function getKnownErrorCodes(): string[] {
  return Object.keys(ERROR_MAP);
}
