import { BeneficiaryData } from './beneficiary-data.interface.js';
import { WithdrawalRequestStatusEnum } from './withdrawal-request-status.enum.js';

export interface WithdrawalRequestResponse {
  id: string;
  subaccountId: string;
  amount: number;
  status: WithdrawalRequestStatusEnum;
  createdAtUtc: string;
  destinationSubaccountId?: string;
  pixKey?: string;
  beneficiary?: BeneficiaryData;
}
