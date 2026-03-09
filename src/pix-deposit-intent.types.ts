/**
 * Input for creating a PIX deposit intent.
 * externalId is sent as originId to ms-banking (e.g. order/payment id).
 */
export interface CreatePixDepositIntentInput {
  cpfCnpj: string;
  value: number;
  externalId: string;
}

/** Amount shape returned by ms-banking (originalAmount, paidAmount). */
export interface PixAmount {
  value?: number;
  currency?: string;
  [key: string]: unknown;
}

/**
 * Success response from ms-banking POST /pix-deposit-intents/api-key.
 */
export interface PixDepositIntentSuccessResponse {
  digitalAccountPinbankId: string;
  urlCheckout: string;
  nsuTransfer: string;
  pinbankQrCodeId: string;
  qrCodeText: string;
  base64Path: string;
  endToEnd: string;
  originalAmount?: PixAmount;
  paidAmount?: PixAmount;
  paidAtUtc?: string;
}

/**
 * Error payload returned by ms-banking in 4xx/5xx responses.
 * Backend can map this to HTTPError.getErrorFromCode(...).
 */
export interface MsBankingErrorPayload {
  code: number;
  title: string;
  status: string;
  message: string;
  details: unknown;
}

/** Response body shape when ms-banking returns an error. */
export interface MsBankingErrorResponse {
  error: MsBankingErrorPayload;
}
