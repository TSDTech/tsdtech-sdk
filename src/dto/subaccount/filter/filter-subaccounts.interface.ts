import { SubaccountStatusEnum } from "../subaccount-status.enum.js";

/**
 * Filters available for searching and listing subaccounts.
 */
export interface FilterSubaccountInput {
  /** Filter by a specific list of subaccount UUIDs. */
  ids?: string[];
  /** Filter by a specific list of holder UUIDs. */
  holderIds?: string[];
  /** Search for subaccounts containing these names. */
  names?: string[];
  /** Filter by subaccount statuses (e.g., ACTIVE, BLOCKED). */
  statuses?: SubaccountStatusEnum[];
  /** Filter by the next snapshot date in ISO 8601 UTC format. */
  nextSnapshotAtUtc?: string;
}