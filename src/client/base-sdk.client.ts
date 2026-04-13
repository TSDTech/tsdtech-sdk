import axios, { AxiosInstance } from "axios";

export class BaseSdkClient {
  protected readonly baseSubaccountUrl = 'https://dev-back-ms-subaccount-415041877599.southamerica-east1.run.app';
  private bankingApiKey: string;
  private bankingOrgId: string;
  protected readonly http: AxiosInstance;

  constructor(params:{
    bankingApiKey: string,
    bankingOrgId: string,
  }
  ) {
    this.bankingApiKey = params.bankingApiKey;
    this.bankingOrgId = params.bankingOrgId;

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