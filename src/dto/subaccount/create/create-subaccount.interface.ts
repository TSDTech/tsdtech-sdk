import { SubaccountStatusEnum } from "../subaccount-status.enum.js";

/**
 * Parameters required to create a new subaccount.
 */
export interface CreateSubaccountInput {
  /** The unique identifier (UUID) of the holder to be linked. */
  holderId: string;
  /** The external identifier for the digital account to be associated. */
  digitalAccountId: string;
  /** Optional parent subaccount UUID for hierarchical structures. */
  subaccountParentId?: string;
  /** Optional name to identify the subaccount. */
  name?: string;
  /** Initial status for the subaccount. */
  status: SubaccountStatusEnum;
}