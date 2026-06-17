import { BeneficiaryData } from './beneficiary-data.interface.js';
import { WithdrawalRequestStatusEnum } from './withdrawal-request-status.enum.js';

/**
 * Detailed information of a created or retrieved withdrawal request.
 */
export interface WithdrawalRequestResponse {
  /** The unique identifier (UUID) of the withdrawal request. */
  id: string;
  /** The unique identifier (UUID) of the source subaccount. */
  subaccountId: string;
  /** The withdrawal amount. */
  amount: number;
  /** Current lifecycle status of the withdrawal. */
  status: WithdrawalRequestStatusEnum;
  /** Timestamp of creation in ISO 8601 UTC format. */
  createdAtUtc: string;
  /** UUID of the destination subaccount (internal transfers only). */
  destinationSubaccountId?: string;
  /** PIX key of the external recipient (PIX transfers only). */
  pixKey?: string;
  /** Bank account details of the beneficiary (TED transfers only). */
  beneficiary?: BeneficiaryData;
}
