import { PaymentMethod } from '../deposit-request/pix/payment-method.enum.js';
import { FeeConfigStatusEnum } from './fee-config-status.enum.js';

export interface FilterFeeConfigInput {
  ids?: string[];
  paymentMethods?: PaymentMethod[];
  status?: FeeConfigStatusEnum[];
}
