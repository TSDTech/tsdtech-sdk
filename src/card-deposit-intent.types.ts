/** Input for card deposit (fields not supplied by MsBankingConfig). */
export interface CreateCardDepositIntentInput {
  cardHolderName: string;
  cardExpiryDate: string;
  cardNumber: string;
  securityCode: string;
  amount: number;
  /** ms-banking payment method code (e.g. "1" credit, "2" debit). */
  paymentMethod: string;
  installmentsCount: number;
  orderDescription: string;
  buyerIpAddress: string;
  buyerCpf: number | string;
  buyerName: string;
  preAuthorizedTransaction: boolean;
}

export interface CardDepositIntentSuccessResponse {
  id: string;
  createdAtUtc?: string;
  updatedAtUtc?: string | number;
  nsuOperation?: string;
  digitalAccountPinbankId: string;
}

export interface GetCardDepositIntentsResponse {
  items: CardDepositIntentSuccessResponse[];
  pageCount: number;
}
