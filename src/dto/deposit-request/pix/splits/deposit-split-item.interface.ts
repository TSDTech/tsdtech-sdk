import { SplitDestinationType } from './split-destination-type.enum.js';

/**
 * Configuration for a single split in a PIX deposit.
 */
export interface DepositSplitItem {
  /**
   * The type of destination for this split.
   * - `INTERNAL`: Split to another subaccount within the organization.
   * - `PIX_KEY`: Split to an external PIX key.
   */
  destinationType: SplitDestinationType;

  /**
   * The amount to be sent to this destination.
   * Must be a positive number with up to 2 decimal places.
   */
  amount: number;

  /**
   * (Required for INTERNAL) The UUID of the destination subaccount.
   */
  destinationSubaccountId?: string;

  /**
   * (Required for PIX_KEY) The PIX key to receive the funds.
   * Format depends on key type: CPF/CNPJ (11/14 digits), email, phone, or UUID.
   */
  pixKey?: string;
}