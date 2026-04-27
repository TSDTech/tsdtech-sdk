import { DepositSplitStatus } from './split-status.enum.js';

/**
 * Filters available for searching and listing deposit splits.
 */
export interface FilterDepositSplitInput {
  /**
   * Filter by a specific list of split UUIDs.
   */
  ids?: string[];

  /**
   * Filter by a specific list of deposit request UUIDs.
   */
  depositRequestIds?: string[];

  /**
   * Filter by a specific list of subaccount UUIDs (origin of the deposit).
   */
  subaccountIds?: string[];

  /**
   * Filter by split statuses (e.g., PENDING, PAID, FAILED).
   */
  statuses?: DepositSplitStatus[];

  /**
   * Filter by a specific destination subaccount UUID.
   */
  destinationSubaccountId?: string;

  /**
   * Filter by a specific PIX key.
   */
  pixKey?: string;
}