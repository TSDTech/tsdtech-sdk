import { BeneficiaryData } from './beneficiary-data.interface.js';


export interface CreateWithdrawalRequestInput {
 
  subaccountId: string;

  amount: number;
  destinationSubaccountId?: string;
  pixKey?: string;
  beneficiary?: BeneficiaryData;
}
