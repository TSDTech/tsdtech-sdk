/**
 * SPA Checkout library – PIX integration with ms-banking (Pinbank).
 * @packageDocumentation
 */

export { createPixDepositIntent } from './ms-banking-client.js';
export { PixDepositIntentError } from './errors.js';
export type { MsBankingConfig } from './config.js';
export type {
  CreatePixDepositIntentInput,
  PixDepositIntentSuccessResponse,
  PixAmount,
  MsBankingErrorPayload,
  MsBankingErrorResponse,
} from './pix-deposit-intent.types.js';
