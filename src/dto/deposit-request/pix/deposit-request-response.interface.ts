import { PaymentMethod } from "./payment-method.enum.js";
import { DepositRequestStatus } from "./status.enum.js";

/**
 * Detailed information of a created or retrieved deposit request.
 */
export interface DepositRequestResponse {
  /** The unique identifier (UUID) of the deposit request. */
  id: string;
  /** Timestamp of creation in ISO 8601 UTC format. */
  createdAtUtc: string;
  /** Timestamp of last update in ISO 8601 UTC format. */
  updatedAtUtc: string;
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

  /** Base64 string of the QR Code image or PDF file. */
  base64Path?: string;
  /** Raw Pix payload for 'Copy and Paste' functionality. */
  textQrCode?: string;
  /** The human-readable numerical line for manual bank payment. */
  digitableLine?: string;
  /** The raw barcode numerical sequence. */
  barCode?: string;
}