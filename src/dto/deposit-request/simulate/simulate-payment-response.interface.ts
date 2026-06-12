/**
 * Response from simulating a PIX payment.
 * Only available in development/staging environments.
 */
export interface SimulatePaymentResponse {
  /** Confirmation message from the simulation. */
  message: string;
}