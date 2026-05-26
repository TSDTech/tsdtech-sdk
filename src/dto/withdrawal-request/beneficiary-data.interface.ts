import { PinBankPaymentAccountTypeEnum } from './pinbank-payment-account-type.enum.js';

/**
 * Bank account details for the beneficiary of a TED withdrawal.
 */
export interface BeneficiaryData {
  /** The bank code (ISPB or three-digit number). */
  bankNumber: string;
  /** The bank branch number. */
  bankBranch: string;
  /** The beneficiary's bank account number. */
  accountNumber: string;
  /** The full name of the beneficiary. */
  name: string;
  /** The CPF or CNPJ document number of the beneficiary (digits only). */
  document: string;
  /** The type of the beneficiary's bank account. */
  accountType: PinBankPaymentAccountTypeEnum;
}
