import { WithdrawalRequestStatusEnum } from './withdrawal-request-status.enum.js';

export interface FilterWithdrawalRequestInput {
  ids?: string[];
  subaccountIds?: string[];
  pixKeys?: string[];
  statuses?: WithdrawalRequestStatusEnum[];
  idempotencyKeys?: string[];
  createdAt?: string;
}
