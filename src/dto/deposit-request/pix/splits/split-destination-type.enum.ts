/**
 * Destination type for a PIX deposit split.
 */
export enum SplitDestinationType {
  /**
   * Split to another internal subaccount within the same organization.
   */
  INTERNAL = 'INTERNAL',
  /**
   * Split to an external PIX key (CPF, CNPJ, email, phone, or random).
   */
  PIX_KEY = 'PIX_KEY',
}