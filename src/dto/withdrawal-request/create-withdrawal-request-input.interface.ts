import { BeneficiaryData } from './beneficiary-data.interface.js';


/**
 * Payload required to create a withdrawal request.
 *
 * Exactly one of `destinationSubaccountId`, `pixKey`, or `beneficiary` must be provided
 * to indicate the withdrawal destination type:
 * - `destinationSubaccountId`: internal transfer between subaccounts.
 * - `pixKey`: external PIX transfer.
 * - `beneficiary`: external TED transfer with full bank account data.
 */
export interface CreateWithdrawalRequestInput {
  /** The unique identifier (UUID) of the source subaccount. */
  subaccountId: string;
  /** The amount to withdraw. Must be a positive number. */
  amount: number;
  /** (Internal) UUID of the destination subaccount for an internal transfer. */
  destinationSubaccountId?: string;
  /** (PIX) The PIX key of the external recipient. */
  pixKey?: string;
  /**(TED) The tax ID (CPF/CNPJ) of the beneficiary for an external TED transfer. Required if `beneficiary` is provided.*/
  taxId?: string;
  /**(TED) Bank account details for an external TED transfer.*/
  beneficiary?: BeneficiaryData;
}
