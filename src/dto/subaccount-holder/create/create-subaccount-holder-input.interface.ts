import { DocumentTypeEnum } from '../document-type.enum.js';

/**
 * Payload required to create a subaccount holder inline with optional subaccount creation.
 */
export interface CreateSubaccountInlineInput {
  /** Optional friendly name for the subaccount. */
  subaccountName?: string;
  /** The unique identifier (UUID) of the digital account. Required when createSubaccount is true. */
  digitalAccountId?: string;
}

/**
 * Parameters required to create a new subaccount holder.
 */
export interface CreateSubaccountHolderInput {
  /** Full name of the holder. */
  name: string;
  /** Document number (CPF or CNPJ). */
  document: string;
  /** Type of the document. */
  documentType: DocumentTypeEnum;
  /** External unique identifier (UUID) for the holder. */
  externalId: string;
  /** Whether to create a subaccount along with the holder. Defaults to false. */
  createSubaccount?: boolean;
  /** Subaccount data. Required when createSubaccount is true. */
  subaccountData?: CreateSubaccountInlineInput;
}