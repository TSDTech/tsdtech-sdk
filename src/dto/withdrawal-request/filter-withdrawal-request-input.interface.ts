import { WithdrawalRequestStatusEnum } from './withdrawal-request-status.enum.js';

/**
 * Filters available for listing withdrawal requests.
 */
export interface FilterWithdrawalRequestInput {
  /** Filter by a specific list of withdrawal request UUIDs. */
  ids?: string[];
  /** Filter by a specific list of source subaccount UUIDs. */
  subaccountIds?: string[];
  /** Filter by PIX keys associated with the withdrawal. */
  pixKeys?: string[];
  /** Filter by withdrawal statuses. */
  statuses?: WithdrawalRequestStatusEnum[];
  /** Filter by idempotency keys used during creation. */
  idempotencyKeys?: string[];
  /** Filter by creation date in ISO 8601 UTC format. */
  createdAt?: string;
}
