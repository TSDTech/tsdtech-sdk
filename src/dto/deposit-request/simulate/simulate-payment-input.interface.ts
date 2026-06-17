/**
 * Input payload for simulating a PIX payment on a deposit request.
 * Only available in development/staging environments.
 */
export interface SimulatePaymentInput {
  /** The unique identifier (UUID) of the deposit request to simulate payment for. */
  depositRequestId: string;
}