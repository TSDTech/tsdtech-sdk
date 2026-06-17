import { PaymentMethod } from '../deposit-request/pix/payment-method.enum.js';
import { FeeConfigStatusEnum } from './fee-config-status.enum.js';

export interface FeeConfigResponse {
  id: string;
  organizationId: string;
  paymentMethod: PaymentMethod;
  percentageFee: number;
  fixedFee: number;
  minFee?: number;
  maxFee?: number;
  status: FeeConfigStatusEnum;
  createdAtUtc: Date;
  updatedAtUtc: Date;
}
