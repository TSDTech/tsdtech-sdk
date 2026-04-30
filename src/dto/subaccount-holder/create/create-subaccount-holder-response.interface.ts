import { SubaccountResponse } from "../../subaccount/create/create-subaccount-response.interface.js";
import { SubaccountHolderResponse } from "../subaccount-holder-response.interface.js";


/**
 * Response returned after creating a subaccount holder.
 * Contains the created holder and optionally the created subaccount.
 */
export interface CreateSubaccountHolderResponse {
  /** The created subaccount holder. Always present. */
  subaccountHolder: SubaccountHolderResponse;
  /** The created subaccount. Only present when createSubaccount was true. */
  subaccount?: SubaccountResponse;
}