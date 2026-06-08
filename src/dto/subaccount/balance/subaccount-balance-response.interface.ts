/**
 * Balance information for a subaccount.
 */
export interface SubaccountBalanceResponse {
  /**
   * The unique identifier (UUID) of the subaccount.
   */
  subaccountId: string;
  /**
   * The available balance (settled - debits - max(0, pendingDebits - pendingCredits)).
   */
  balance: number;
  /**
   * The pending/blocked balance (max(0, pendingDebits - pendingCredits)).
   */
  pendingBalance: number;
}