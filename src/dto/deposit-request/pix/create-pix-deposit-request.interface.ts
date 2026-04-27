import { DepositSplitItem } from './splits/deposit-split-item.interface.js';

/**
 * Payload required to generate a Pix deposit.
 */
export interface CreatePixDepositRequestInput {
  /** The unique identifier (UUID) of the target subaccount. */
  subaccountId: string;
  /** The total amount to be deposited. */
  amount: number;
  /**
   * Optional list of splits to distribute the deposit amount.
   * If provided, the sum of split amounts must not exceed the total deposit amount.
   * Each split can target an internal subaccount or an external PIX key.
   */
  splits?: DepositSplitItem[];
}