/**
 * Payload required to generate a Pix deposit.
 */
export interface CreatePixDepositRequestInput {
  /** The unique identifier (UUID) of the target subaccount. */
  subaccountId: string;
  /** The total amount to be deposited. */
  amount: number;
}