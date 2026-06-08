/**
 * Lifecycle status of a deposit split.
 */
export enum DepositSplitStatus {
  /**
   * Split created but not yet processed.
   */
  PENDING = 'PENDING',
  /**
   * Split is being processed.
   */
  PROCESSING = 'PROCESSING',
  /**
   * Split was successfully completed.
   */
  PAID = 'PAID',
  /**
   * Split failed or was rejected.
   */
  FAILED = 'FAILED',
}