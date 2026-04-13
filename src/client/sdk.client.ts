import { PaginatedListResponse, PaginationInput } from "../dto/common/pagination.interface.js";
import { CreatePixDepositRequestInput as CreatePixDepositRequest } from "../dto/deposit-request/pix/create-pix-deposit-request.interface.js";
import { DepositRequestResponse } from "../dto/deposit-request/pix/deposit-request-response.interface.js";
import { CreateSlipDepositRequestInput } from "../dto/deposit-request/slip/create-slip-deposit-request.interface.js";
import { SubaccountResponse } from "../dto/subaccount/create/create-subaccount-response.interface.js";
import { CreateSubaccountInput as CreateSubaccount } from "../dto/subaccount/create/create-subaccount.interface.js";
import { FilterSubaccountInput } from "../dto/subaccount/filter/filter-subaccounts.interface.js";
import { BaseSdkClient } from "./base-sdk.client.js";

/**
 * Main client for the TSD Tech SDK.
 */
export class TsdTechSdk extends BaseSdkClient {
  constructor(params: {
    bankingApiKey: string,
    bankingOrgId: string,
  }
  ) {
    super(params);
  }

  /**
   * Creates a Pix deposit request for a specific subaccount.
   * * @param input - The payload containing the subaccount ID and the deposit amount.
   * @param idempotencyKey - A unique identifier (e.g., UUIDv4) to guarantee the idempotency of the request and prevent duplicate transactions.
   * @returns A promise that resolves to the deposit request details, including the Pix Copy & Paste text and Base64 QR Code.
   * @throws {CheckoutApiError} If the API returns an error or a bad request.
   */
  public async createPixDepositRequest(
    input: CreatePixDepositRequest,
    idempotencyKey: string
  ): Promise<DepositRequestResponse> {
   const url = `${this.baseSubaccountUrl}/deposit-request/api-key/pix`;

    const { data } = await this.http.post<DepositRequestResponse>(
      url,
      input,
      {
        headers: {
          'idempotency-key': idempotencyKey,
        },
      }
    );

    return data;
  }

  /**
   * Creates a Bank Slip (Boleto) deposit request.
   * * @param input - The payload containing the subaccount ID, amount, strictly formatted due date (ISO 8601 without milliseconds), and payer details.
   * @param idempotencyKey - A unique identifier (e.g., UUIDv4) to guarantee the idempotency of the request.
   * @returns A promise that resolves to the deposit request details, including the digitable line, barcode, and Base64 PDF.
   * @throws {CheckoutApiError} If the API returns an error or a bad request.
   */
  public async createSlipDepositRequest(
    input: CreateSlipDepositRequestInput,
    idempotencyKey: string
  ): Promise<DepositRequestResponse> {
    const url = `${this.baseSubaccountUrl}/deposit-request/api-key/slip`;

    const { data } = await this.http.post<DepositRequestResponse>(
      url,
      input,
      {
        headers: {
          'idempotency-key': idempotencyKey,
        },
      }
    );
    return data;
  }

  /**
   * Creates a new subaccount linked to a specific holder.
   * * @param input - The data required to create the subaccount, such as holder ID, digital account ID, and initial status.
   * @returns A promise that resolves to the newly created subaccount details.
   * @throws {CheckoutApiError} If the API returns an error or a bad request.
   */
  public async createSubaccount(
    input: CreateSubaccount
  ): Promise<SubaccountResponse> {
    const url = `${this.baseSubaccountUrl}/subaccounts/api-key/create`;

    const { data } = await this.http.post<SubaccountResponse>(url, input);
    return data;
  }

  /**
   * Retrieves a paginated list of subaccounts.
   * Supports optional filtering by IDs, holder IDs, statuses, etc., and pagination controls.
   * * @param filters - Optional filters to apply to the search query.
   * @param pagination - Optional pagination parameters (`page` and `pageSize`).
   * @returns A promise that resolves to a paginated list of subaccounts.
   * @throws {CheckoutApiError} If the API returns an error or a bad request.
   */
  public async getSubaccounts(
    filters?: FilterSubaccountInput,
    pagination?: PaginationInput
  ): Promise<PaginatedListResponse<SubaccountResponse>> {
    const url = `${this.baseSubaccountUrl}/subaccounts/api-key`;
    const { data } = await this.http.get<PaginatedListResponse<SubaccountResponse>>(
      url,
      {
        params: {
          ...filters,
          ...pagination,
        },
      }
    );
    return data;
  }
}