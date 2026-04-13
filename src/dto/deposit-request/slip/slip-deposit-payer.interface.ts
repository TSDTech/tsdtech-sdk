/**
 * Detailed information about the person or entity paying the bank slip.
 */
export interface SlipDepositPayer {
  /** Full name or corporate name. */
  name: string;
  /** Full street address. */
  address: string;
  /** Neighborhood or district name. */
  neighborhood: string;
  /** City name. */
  city: string;
  /** Postal or Zip code (numbers only). */
  zipCode: string;
  /** State abbreviation (e.g., 'SP', 'NY'). */
  state: string;
  /** Taxpayer identification number (CPF or CNPJ, numbers only). */
  taxId: number;
  /** Optional international dialing code (DDI). */
  thirdPartyDdi?: number;
  /** Optional area code (DDD). */
  thirdPartyDdd?: number;
  /** Optional phone number. */
  thirdPartyPhoneNumber?: number;
}