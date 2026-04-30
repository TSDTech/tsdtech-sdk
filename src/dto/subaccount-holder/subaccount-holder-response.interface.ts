import { DocumentTypeEnum } from "./document-type.enum.js";
import { SubaccountHolderStatusEnum } from "./subaccount-holder-status.enum.js";


/**
 * Detailed information of a subaccount holder.
 */
export interface SubaccountHolderResponse {
  /** The unique identifier (UUID) of the holder. */
  id: string;
  /** Full name of the holder. */
  name: string;
  /** Document number (CPF or CNPJ). */
  document: string;
  /** Type of the document. */
  documentType: DocumentTypeEnum;
  /** External unique identifier for the holder. */
  externalId: string;
  /** Current operational status of the holder. */
  status: SubaccountHolderStatusEnum;
  /** Timestamp of creation in ISO 8601 UTC format. */
  createdAtUtc: string;
  /** Timestamp of last update in ISO 8601 UTC format. */
  updatedAtUtc: string | null;
}