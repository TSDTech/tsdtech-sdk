import axios, { AxiosInstance } from "axios";

export type SdkEnvironment = 'hml' | 'prod';

export const BASE_ENVIRONMENT_URLS: Partial<Record<SdkEnvironment, string>> = {
  hml: 'https://dev-back-ms-subaccount-415041877599.southamerica-east1.run.app',
};

export class BaseSdkClient {
  protected readonly baseSubaccountUrl: string;
  private bankingApiKey: string;
  private bankingOrgId: string;
  protected readonly http: AxiosInstance;

  constructor(params: {
    bankingApiKey: string;
    bankingOrgId: string;
    environment: SdkEnvironment;
    baseUrl?: string;
  }) {
    this.bankingApiKey = params.bankingApiKey;
    this.bankingOrgId = params.bankingOrgId;

    const resolvedUrl = params.baseUrl ?? BASE_ENVIRONMENT_URLS[params.environment];
    if (!resolvedUrl) {
      throw new Error(
        `No base URL is defined for environment "${params.environment}". ` +
        `Please provide a explicit baseUrl when using this environment.`
      );
    }
    this.baseSubaccountUrl = resolvedUrl;

    this.http = axios.create({
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'org-id': params.bankingOrgId,
        'x-api-key': params.bankingApiKey,
      },
    });
  }

  protected getBankingApiKey(): string {
    return this.bankingApiKey;
  }
  protected getBankingOrgId(): string {
    return this.bankingOrgId;
  }
}