export interface CardData {
  cardHolderName: string;
  cardNumber: string;
  cardExpiryDate: string;
  securityCode: string;
}

export const VALID_SPLIT_TYPES = ['INTERNAL', 'PIX_KEY'] as const;
export type SplitType = typeof VALID_SPLIT_TYPES[number];

export interface SplitRule {
  subaccountId: string;
  amount: number;
  percentage?: number;
  splitType?: SplitType;
}

export interface CreateCardDepositRequestDto {
  subaccountId: string;
  amount: number;
  cardData: CardData;
  /**
   * Número de parcelas. Opcional, default: 1
   */
  installmentNumber?: number;
  splits?: SplitRule[];
}

export interface CardDepositRequestResponse {
  status: string;
  transactionId?: string;
  depositRequestId: string;
}