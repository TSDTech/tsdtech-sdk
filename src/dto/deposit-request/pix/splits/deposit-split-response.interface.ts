import { DepositSplitStatus } from './split-status.enum.js';
import { SplitDestinationType } from './split-destination-type.enum.js';

/**
 * Detailed information of a PIX deposit split.
 */
export interface DepositSplitResponse {
  /** The unique identifier (UUID) of the split record. */
  id: string;
  /** The unique identifier (UUID) of the parent deposit request. */
  depositRequestId: string;
  /** The unique identifier (UUID) of the subaccount that initiated the deposit. */
  subaccountId: string;
  /** The type of destination for this split. */
  destinationType: SplitDestinationType;
  /** (Present when destinationType is INTERNAL) The UUID of the destination subaccount. */
  destinationSubaccountId?: string;
  /** (Present when destinationType is PIX_KEY) The PIX key that received the funds. */
  pixKey?: string;
  /** The amount allocated to this split. */
  amount: number;
  /** Current lifecycle status of the split. */
  status: DepositSplitStatus;
  /** The unique idempotency key used during split creation. */
  idempotencyKey: string;
  /** (Present when processed) The ledger entry identifier for this split. */
  ledgerEntryId?: string;
  /** Timestamp of creation in ISO 8601 UTC format. */
  createdAtUtc: string;
  /** Timestamp of last update in ISO 8601 UTC format. */
  updatedAtUtc: string;
}