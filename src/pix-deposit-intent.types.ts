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
 * Success response from ms-banking (POST create and GET by id).
 * GET returns: id, createdAtUtc, updatedAtUtc, digitalAccountPinbankId, urlCheckout, pinbankQrCodeId, qrCodeText, base64Path.
 * Create response may omit createdAtUtc/updatedAtUtc; paid flow may add nsuTransfer, endToEnd, paidAtUtc, etc.
 */
export interface PixDepositIntentSuccessResponse {
  id: string;
  createdAtUtc?: string;
  updatedAtUtc?: string;
  digitalAccountPinbankId: string;
  urlCheckout: string;
  pinbankQrCodeId: string;
  qrCodeText: string;
  base64Path: string;
  nsuTransfer?: string;
  endToEnd?: string;
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

/**
 * Response from GET /pix-deposit-intents/api-key (list by ids).
 * Paginated shape: items array and pageCount.
 */
export interface GetPixDepositIntentsResponse {
  items: PixDepositIntentSuccessResponse[];
  pageCount: number;
}
