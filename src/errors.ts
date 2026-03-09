import type { MsBankingErrorPayload } from './pix-deposit-intent.types.js';

/**
 * Error thrown when ms-banking returns 4xx/5xx with body.error.
 * Backend can use code, title, message, details with HTTPError.getErrorFromCode(...).
 */
export class PixDepositIntentError extends Error {
  readonly code: number;
  readonly title: string;
  readonly status: string;
  readonly details: unknown;

  constructor(payload: MsBankingErrorPayload) {
    super(payload.message);
    this.name = 'PixDepositIntentError';
    this.code = payload.code;
    this.title = payload.title;
    this.status = payload.status;
    this.details = payload.details;
    Object.setPrototypeOf(this, PixDepositIntentError.prototype);
  }
}
