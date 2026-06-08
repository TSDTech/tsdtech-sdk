import { LedgerEntryTypeEnum } from './ledger-entry-type.enum.js';

/**
 * Statement entry representing a ledger entry in the subaccount history.
 */
export interface StatementResponse {
  /**
   * The unique identifier (UUID) of the ledger entry.
   */
  ledgerId: string;
  /**
   * The type of the ledger entry (CREDIT or DEBIT).
   */
  type: LedgerEntryTypeEnum;
  /**
   * The monetary amount of the transaction.
   */
  amount: number;
  /**
   * The operation identifier (e.g., deposit or withdrawal request UUID).
   */
  operation: string;
  /**
   * Optional description of the transaction.
   */
  description?: string;
  /**
   * Timestamp of creation in ISO 8601 UTC format.
   */
  createdAtUtc: Date;
}