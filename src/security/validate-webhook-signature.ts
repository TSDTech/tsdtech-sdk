import { createHmac, timingSafeEqual } from 'node:crypto';

export interface WebhookSignatureValidationParams {
  body: unknown;
  signature: string;
  timestamp: number | string;
  secret: string;
  toleranceMs?: number;
}

export interface WebhookSignatureValidationResult {
  valid: boolean;
  reason?: string;
}

export interface SignPayloadParams {
  body: unknown;
  secret: string;
  timestamp?: number;
}

export interface SignPayloadResult {
  signature: string;
  timestamp: number;
}

const HEX_64_REGEX = /^[0-9a-fA-F]{64}$/;
const SHA256_PREFIX = 'sha256=';

/**
 * Validates the HMAC-SHA256 signature of an incoming webhook.
 *
 * All invalid inputs return { valid: false, reason } — this function never throws.
 *
 * The expected signature format is: HMAC-SHA256(secret, "<timestamp_ms>.<JSON.stringify(body)>")
 * transmitted as the X-Webhook-Signature header with the prefix "sha256=".
 */
export function validateWebhookSignature(
  params: WebhookSignatureValidationParams,
): WebhookSignatureValidationResult {
  const { body, signature, timestamp, secret, toleranceMs } = params;

  // Validate secret: must be a 64-character hex string
  if (!secret || !HEX_64_REGEX.test(secret)) {
    return {
      valid: false,
      reason: 'Secret must be a valid 64-character hex string',
    };
  }

  // Validate signature header format: must start with "sha256="
  if (!signature || !signature.startsWith(SHA256_PREFIX)) {
    return {
      valid: false,
      reason: 'Signature header must start with sha256=',
    };
  }

  // Parse timestamp — accept both number and numeric string
  const ts = typeof timestamp === 'string' ? parseInt(timestamp, 10) : timestamp;
  if (!Number.isFinite(ts)) {
    return { valid: false, reason: 'Invalid timestamp value' };
  }

  // Check timestamp tolerance window if specified
  if (toleranceMs !== undefined) {
    const diff = Math.abs(Date.now() - ts);
    if (diff > toleranceMs) {
      return {
        valid: false,
        reason: `Timestamp is outside the allowed tolerance window (${toleranceMs}ms)`,
      };
    }
  }

  // Serialize body — catch circular references or non-serializable values
  let serializedBody: string;
  try {
    serializedBody = JSON.stringify(body);
  } catch {
    return { valid: false, reason: 'Failed to serialize body to JSON' };
  }

  // Build payload: "<timestamp>.<JSON.stringify(body)>"
  const payload = `${ts}.${serializedBody}`;

  // Compute expected HMAC-SHA256
  const expectedHex = createHmac('sha256', secret).update(payload).digest('hex');
  const receivedHex = signature.slice(SHA256_PREFIX.length);

  // Use timing-safe comparison — never use === to prevent timing attacks (CR-2)
  try {
    const expectedBuf = Buffer.from(expectedHex, 'hex');
    const receivedBuf = Buffer.from(receivedHex, 'hex');

    if (expectedBuf.length !== receivedBuf.length) {
      return { valid: false, reason: 'Signature length mismatch' };
    }

    const isValid = timingSafeEqual(expectedBuf, receivedBuf);
    return isValid
      ? { valid: true }
      : { valid: false, reason: 'Signature does not match' };
  } catch {
    return { valid: false, reason: 'Signature comparison failed' };
  }
}

/**
 * Generates a valid HMAC-SHA256 signature for the given payload.
 *
 * Used ONLY in tests to reproduce the same signing process as back-ms-webhook.
 * Not intended for production use by merchants.
 */
export function signPayload({ body, secret, timestamp }: SignPayloadParams): SignPayloadResult {
  const ts = timestamp ?? Date.now();
  const serializedBody = JSON.stringify(body);
  const payload = `${ts}.${serializedBody}`;
  const hmac = createHmac('sha256', secret).update(payload).digest('hex');
  return { signature: `${SHA256_PREFIX}${hmac}`, timestamp: ts };
}
