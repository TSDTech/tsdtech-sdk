/**
 * SPA Checkout library – PIX, cartão e boleto com ms-banking (Pinbank).
 * @packageDocumentation
 */

export {
  createPixDepositIntent,
  getPixDepositIntentById,
  getApprovedPixDepositIntentById,
  getDeclinedPixDepositIntentById,
  createCardDepositIntent,
  getApprovedCardDepositIntentById,
  getDeclinedCardDepositIntentById,
  createSlipDepositIntent,
  normalizeSlipResponseToBillResult,
  getApprovedSlipDepositIntentById,
  getDeclinedSlipDepositIntentById,
} from './ms-banking-client.js';
export { MsBankingApiError, PixDepositIntentError } from './errors.js';
export type { MsBankingConfig } from './config.js';
export type {
  CreatePixDepositIntentInput,
  PixDepositIntentSuccessResponse,
  GetPixDepositIntentsResponse,
  PixAmount,
  MsBankingErrorPayload,
  MsBankingErrorResponse,
} from './pix-deposit-intent.types.js';
export type {
  CreateCardDepositIntentInput,
  CardDepositIntentSuccessResponse,
  GetCardDepositIntentsResponse,
} from './card-deposit-intent.types.js';
export type {
  CreateSlipDepositIntentInput,
  SlipDepositPayerData,
  SlipDepositBillResult,
  GetSlipDepositIntentsResponse,
} from './slip-deposit-intent.types.js';
