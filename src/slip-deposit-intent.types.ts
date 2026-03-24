/** Payer address block for slip (ms-banking payerData). */
export interface SlipDepositPayerData {
  taxId: number;
  name: string;
  address: string;
  neighborhood: string;
  city: string;
  zipCode: string;
  state: string;
  thirdPartyDdi: number;
  thirdPartyDdd: number;
  thirdPartyPhoneNumber: number;
}

export interface CreateSlipDepositIntentInput {
  dueDate: string;
  value: number;
  email: string;
  clientIdentifier: string;
  payerData: SlipDepositPayerData;
  instructions?: string;
  interestsAmount?: number;
  fineAmount?: number;
}

/**
 * Normalized slip response exposed to spa-backend checkout (BillResponseDto).
 */
export interface SlipDepositBillResult {
  pinbankSlipId: string;
  base64Path: string;
  digitableLine: string;
  barCode: string;
  digitalAccountPinbankId: string;
}

export interface GetSlipDepositIntentsResponse {
  items: Record<string, unknown>[];
  pageCount: number;
}
