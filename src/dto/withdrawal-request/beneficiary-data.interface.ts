import { PinBankPaymentAccountTypeEnum } from './pinbank-payment-account-type.enum.js';

export interface BeneficiaryData {

  bankNumber: string;

  bankBranch: string;

  accountNumber: string;

  name: string;

  document: string;

  accountType: PinBankPaymentAccountTypeEnum;
}
