import { DepositSplitItem } from './pix/splits/deposit-split-item.interface.js';

/**
 * Payload required to generate a generic deposit request.
 * A generic deposit has no predefined payment method — it can be updated later
 * with a specific method (PIX, SLIP, CARD, etc.).
 */
export interface CreateGenericDepositRequestInput {
  /** The unique identifier (UUID) of the target subaccount. */
  subaccountId: string;
  /** The total amount to be deposited. */
  amount: number;
  
  /** Optional summary of items to be included in the deposit. */
  items_summary?: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  /**
   * Optional list of splits to distribute the deposit amount.
   * If provided, the sum of split amounts must not exceed the total deposit amount.
   * Each split can target an internal subaccount or an external PIX key.
   */
  splits?: DepositSplitItem[];
}
