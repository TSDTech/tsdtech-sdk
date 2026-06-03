import { CreateSubaccountHolderInput as CreateSubaccountHolder } from "../dto/subaccount-holder/create/create-subaccount-holder-input.interface.js";
import { CreateSubaccountHolderResponse } from "../dto/subaccount-holder/create/create-subaccount-holder-response.interface.js";
import { PaginatedListResponse, PaginationInput } from "../dto/common/pagination.interface.js";
import { CreatePixDepositRequestInput as CreatePixDepositRequest } from "../dto/deposit-request/pix/create-pix-deposit-request.interface.js";
import { CreateGenericDepositRequestInput as CreateGenericDepositRequest } from "../dto/deposit-request/create-generic-deposit-request.interface.js";
import { DepositRequestResponse } from "../dto/deposit-request/pix/deposit-request-response.interface.js";
import { FilterDepositSplitInput } from "../dto/deposit-request/pix/splits/filter-deposit-splits.interface.js";
import { DepositSplitResponse } from "../dto/deposit-request/pix/splits/deposit-split-response.interface.js";
import { CreateSlipDepositRequestInput } from "../dto/deposit-request/slip/create-slip-deposit-request.interface.js";
import { SubaccountResponse } from "../dto/subaccount/create/create-subaccount-response.interface.js";
import { CreateSubaccountInput as CreateSubaccount } from "../dto/subaccount/create/create-subaccount.interface.js";
import { FilterSubaccountInput } from "../dto/subaccount/filter/filter-subaccounts.interface.js";
import { FilterStatementInput } from "../dto/subaccount/statement/filter-statement.interface.js";
import { StatementResponse } from "../dto/subaccount/statement/statement-response.interface.js";
import { BaseSdkClient, SdkEnvironment } from "./base-sdk.client.js";

/**
 * Main client for the TSD Tech SDK.
 */
export class TsdTechSdk extends BaseSdkClient {
  constructor(params: {
    bankingApiKey: string;
    bankingOrgId: string;
    environment: SdkEnvironment;
    baseUrl?: string;
  }) {
    super(params);
  }

  /**
   * Creates a Pix deposit request for a specific subaccount.
   * @param input - The payload containing the subaccount ID, the deposit amount, and optional split configuration.
   * @param idempotencyKey - A unique identifier (e.g., UUIDv4) to guarantee the idempotency of the request and prevent duplicate transactions.
   * @returns A promise that resolves to the deposit request details, including the Pix Copy & Paste text, Base64 QR Code, and any configured splits.
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
   * Creates a generic deposit request without a predefined payment method.
   * The deposit can be updated later with a specific method (PIX, SLIP, CARD, etc.).
   * @param input - The payload containing the subaccount ID, the deposit amount, and optional split configuration.
   * @param idempotencyKey - A unique identifier (e.g., UUIDv4) to guarantee the idempotency of the request and prevent duplicate transactions.
   * @returns A promise that resolves to the deposit request details.
   * @throws {CheckoutApiError} If the API returns an error or a bad request.
   */
  public async createGenericDepositRequest(
    input: CreateGenericDepositRequest,
    idempotencyKey: string
  ): Promise<DepositRequestResponse> {
    const url = `${this.baseSubaccountUrl}/deposit-request/api-key/generic`;

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
   * Retrieves a paginated list of PIX deposit splits.
   * Supports optional filtering by deposit request IDs, subaccount IDs, statuses, etc.
   * * @param filters - Optional filters to apply to the search query.
   * @param pagination - Optional pagination parameters (`page` and `pageSize`).
   * @returns A promise that resolves to a paginated list of deposit splits.
   * @throws {CheckoutApiError} If the API returns an error or a bad request.
   */
  public async getDepositSplits(
    filters?: FilterDepositSplitInput,
    pagination?: PaginationInput
  ): Promise<PaginatedListResponse<DepositSplitResponse>> {
    const url = `${this.baseSubaccountUrl}/deposit-split-pix/api-key`;

    const { data } = await this.http.get<PaginatedListResponse<DepositSplitResponse>>(
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

  /**
   * Creates a new subaccount holder with optional inline subaccount creation.
   * * @param input - The data required to create the subaccount holder, such as name, document, and optional subaccount data.
   * @param idempotencyKey - A unique identifier (e.g., UUIDv4) to guarantee the idempotency of the request.
   * @returns A promise that resolves to the created subaccount holder and optionally the created subaccount.
   * @throws {CheckoutApiError} If the API returns an error or a bad request.
   */
  public async createSubaccountHolder(
    input: CreateSubaccountHolder,
    idempotencyKey: string
  ): Promise<CreateSubaccountHolderResponse> {
    const url = `${this.baseSubaccountUrl}/sub-account-holders/api-key/create`;

    const { data } = await this.http.post<CreateSubaccountHolderResponse>(
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
   * Retrieves a paginated subaccount statement (ledger entries).
   * Supports optional filtering by entry types, operations, and date range.
   * * @param subaccountId - The unique identifier (UUID) of the subaccount.
   * @param filters - Optional filters to apply (types, operations, date range).
   * @param pagination - Optional pagination parameters (`page` and `pageSize`).
   * @returns A promise that resolves to a paginated list of statement entries.
   * @throws {CheckoutApiError} If the API returns an error or a bad request.
   */
  public async getStatement(
    subaccountId: string,
    filters?: FilterStatementInput,
    pagination?: PaginationInput
  ): Promise<PaginatedListResponse<StatementResponse>> {
    const url = `${this.baseSubaccountUrl}/subaccounts/api-key/${subaccountId}/statement`;

    const { data } = await this.http.get<PaginatedListResponse<StatementResponse>>(
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