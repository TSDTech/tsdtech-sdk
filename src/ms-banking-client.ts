import axios, { type AxiosError } from 'axios';
import type { MsBankingConfig } from './config.js';
import { resolveMsBankingConfig } from './config.js';
import { PixDepositIntentError } from './errors.js';
import type {
  CreatePixDepositIntentInput,
  PixDepositIntentSuccessResponse,
  MsBankingErrorResponse,
} from './pix-deposit-intent.types.js';

const PIX_DEPOSIT_INTENTS_PATH = '/pix-deposit-intents/api-key';

/**
 * Creates a PIX deposit intent via ms-banking (Pinbank).
 * On success returns the response with qrCodeText, base64Path, etc.
 * On 4xx/5xx throws PixDepositIntentError with code, title, status, message, details.
 *
 * @param input - cpfCnpj, value, and externalId (sent as originId to ms-banking)
 * @param configOverride - optional partial config (e.g. for tests); otherwise reads from env
 */
export async function createPixDepositIntent(
  input: CreatePixDepositIntentInput,
  configOverride?: Partial<MsBankingConfig>,
): Promise<PixDepositIntentSuccessResponse> {
  const config = resolveMsBankingConfig(configOverride);
  const url = `${config.baseUrl.replace(/\/$/, '')}${PIX_DEPOSIT_INTENTS_PATH}`;

  const body = {
    digitalAccountPinbankId: config.digitalAccountPinbankId,
    value: input.value,
    cpfCnpj: input.cpfCnpj,
    returnQrCode: true,
    bankCode: config.bankCode,
    originId: input.externalId,
  };

  try {
    const { data } = await axios.post<PixDepositIntentSuccessResponse>(url, body, {
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'org-id': config.orgId,
        'x-api-key': config.apiKey,
      },
    });
    return data;
  } catch (err) {
    const axiosError = err as AxiosError<MsBankingErrorResponse>;
    if (
      axiosError.response?.data?.error &&
      typeof axiosError.response.data.error === 'object'
    ) {
      const payload = axiosError.response.data.error;
      throw new PixDepositIntentError({
        code: payload.code ?? axiosError.response.status ?? 500,
        title: payload.title ?? 'PIX_INTENT_ERROR',
        status: payload.status ?? 'UNKNOWN',
        message: payload.message ?? axiosError.message,
        details: payload.details ?? null,
      });
    }
    throw err;
  }
}
