import type { MsBankingErrorPayload } from './pix-deposit-intent.types.js';

/**
 * Error thrown when ms-banking returns 4xx/5xx with body.error.
 * Backend can use code, title, message, details with HTTPError.getErrorFromCode(...).
 */
export class MsBankingApiError extends Error {
  readonly code: number;
  readonly title: string;
  readonly status: string;
  readonly details: unknown;

  constructor(payload: MsBankingErrorPayload) {
    super(payload.message);
    this.name = 'MsBankingApiError';
    this.code = payload.code;
    this.title = payload.title;
    this.status = payload.status;
    this.details = payload.details;
    Object.setPrototypeOf(this, MsBankingApiError.prototype);
  }
}

/**
 * @deprecated Prefer MsBankingApiError; kept for backward compatibility.
 */
export class PixDepositIntentError extends MsBankingApiError {
  constructor(payload: MsBankingErrorPayload) {
    super(payload);
    this.name = 'PixDepositIntentError';
    Object.setPrototypeOf(this, PixDepositIntentError.prototype);
  }
}
