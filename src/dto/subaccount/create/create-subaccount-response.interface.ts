import { SubaccountStatusEnum } from '../subaccount-status.enum.js';

/**
 * Detailed information of a subaccount.
 */
export interface SubaccountResponse {
  /** The unique identifier (UUID) of the subaccount. */
  id: string;
  /** The unique identifier (UUID) of the subaccount holder. */
  subaccountHolderId: string;
  /** The external identifier for the linked digital account. */
  digitalAccountId: string;
  /** The unique identifier (UUID) of the parent subaccount, if applicable. */
  parentSubAccountId?: string;
  /** Optional display name for the subaccount. */
  name?: string;
  /** Current available balance in the subaccount. */
  balance: number;
  /** Current operational status of the subaccount. */
  status: SubaccountStatusEnum;
  /** Next scheduled snapshot timestamp in ISO 8601 UTC format. */
  nextSnapshotAtUtc?: string;
  /** Timestamp of creation in ISO 8601 UTC format. */
  createdAtUtc: string;
  /** Timestamp of last update in ISO 8601 UTC format. */
  updatedAtUtc: string | null;
}