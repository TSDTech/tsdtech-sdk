import { SlipDepositPayer } from './slip-deposit-payer.interface.js';

/**
 * Payload required to create a Bank Slip (Boleto) deposit request.
 */
export interface CreateSlipDepositRequestInput {
  /** The unique identifier (UUID) of the target subaccount. */
  subaccountId: string;
  
  /** The total amount for the deposit. */
  amount: number;
  
  /** * The due date for the bank slip. 
   * MUST be strictly formatted as ISO 8601 without milliseconds (e.g., `YYYY-MM-DDThh:mm:ssZ`).
   */
  dueDate: string; 
  
  /** Optional email to send the slip to the payer. */
  email?: string;
  
  /** Detailed information about the payer. */
  payer: SlipDepositPayer;
}