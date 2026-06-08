/**
 * Filters available for searching subaccount balances.
 */
export interface FilterBalanceInput {
  /**
   * Filter by a specific list of subaccount UUIDs.
   */
  subaccountIds?: string[];
}