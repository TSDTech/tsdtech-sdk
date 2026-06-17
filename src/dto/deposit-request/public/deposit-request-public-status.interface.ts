import { PaymentMethod } from "../pix/payment-method.enum.js";
import { DepositRequestStatus } from "../pix/status.enum.js";

/**
 * Public details and current status of a deposit request.
 */
export interface DepositRequestPublicStatus {
  /** The unique identifier (UUID) of the deposit request. */
  id: string;
  /** The unique identifier (UUID) of the associated subaccount. */
  subaccountId: string;
  /** The transaction amount. */
  amount: number;
  /** The method used for the deposit (e.g., PIX or SLIP). */
  paymentMethod: PaymentMethod;
  /** Current lifecycle status of the deposit. */
  status: DepositRequestStatus;
  /** The unique idempotency key used during creation. */
  idempotencyKey: string;
  /** Timestamp of creation in ISO 8601 UTC format. */
  createdAtUtc: string;
  /** Timestamp of last update in ISO 8601 UTC format. */
  updatedAtUtc?: string;
}