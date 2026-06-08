import { LedgerEntryTypeEnum } from './ledger-entry-type.enum.js';

/**
 * Filters available for searching and retrieving subaccount statements.
 */
export interface FilterStatementInput {
  /**
   * Filter by ledger entry types (CREDIT, DEBIT).
   */
  types?: LedgerEntryTypeEnum[];
  /**
   * Filter by operation IDs (e.g., deposit or withdrawal request IDs).
   */
  operations?: string[];
  /**
   * Filter entries created after this timestamp (in milliseconds).
   */
  createdAfterUtc?: number;
  /**
   * Filter entries created before this timestamp (in milliseconds).
   */
  createdBeforeUtc?: number;
}