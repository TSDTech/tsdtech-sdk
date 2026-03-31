import axios, { type AxiosError } from 'axios';
import type { MsBankingConfig } from './config.js';
import { resolveMsBankingConfig } from './config.js';
import { MsBankingApiError, PixDepositIntentError } from './errors.js';
import type {
  CreateCardDepositIntentInput,
  CardDepositIntentSuccessResponse,
  GetCardDepositIntentsResponse,
} from './card-deposit-intent.types.js';
import type {
  CreateSlipDepositIntentInput,
  SlipDepositBillResult,
  GetSlipDepositIntentsResponse,
} from './slip-deposit-intent.types.js';
import type {
  CreatePixDepositIntentInput,
  PixDepositIntentSuccessResponse,
  GetPixDepositIntentsResponse,
  MsBankingErrorResponse,
} from './pix-deposit-intent.types.js';

const PIX_DEPOSIT_INTENTS_PATH = '/pix-deposit-intents/api-key';
const CARD_DEPOSIT_INTENTS_PATH = '/card-deposit-intents/api-key';
const SLIP_DEPOSIT_INTENTS_PATH = '/slip-deposit-intents/api-key';

function maskApiKey(key: string): string {
  if (key.length <= 8) return '***';
  return `${key.slice(0, 4)}***${key.slice(-4)}`;
}

/** Removes all non-digit characters from CPF/CNPJ string. */
function digitsOnly(value: string): string {
  return value.replace(/\D/g, '');
}

function truncateForLog(value: string, maxLen = 80): string {
  if (value.length <= maxLen) return value;
  return `${value.slice(0, maxLen)}... (${value.length} chars)`;
}

const ISO_UTC_SECONDS_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;

/**
 * Ensures dueDate is in UTC ISO format without milliseconds (YYYY-MM-DDTHH:mm:ssZ).
 */
function normalizeDueDateUtcIso(value: string): string {
  if (ISO_UTC_SECONDS_REGEX.test(value)) return value;

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  // Drop milliseconds to match ms-banking expected dueDate shape.
  return parsed.toISOString().replace(/\.\d{3}Z$/, 'Z');
}

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
    cpfCnpj: digitsOnly(input.cpfCnpj),
    returnQrCode: true,
    bankCode: config.bankCode,
    originId: input.externalId,
  };

  console.log('[spa-checkout] PIX deposit intent request:', {
    url,
    headers: {
      'accept': 'application/json',
      'content-type': 'application/json',
      'org-id': config.orgId,
      'x-api-key': maskApiKey(config.apiKey),
    },
    body,
  });

  try {
    const { data } = await axios.post<PixDepositIntentSuccessResponse>(url, body, {
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'org-id': config.orgId,
        'x-api-key': config.apiKey,
      },
    });
    console.log('[spa-checkout] PIX deposit intent response:', {
      digitalAccountPinbankId: data.digitalAccountPinbankId,
      urlCheckout: data.urlCheckout,
      nsuTransfer: data.nsuTransfer,
      pinbankQrCodeId: data.pinbankQrCodeId,
      qrCodeText: truncateForLog(data.qrCodeText),
      base64Path: truncateForLog(data.base64Path),
      endToEnd: data.endToEnd,
      originalAmount: data.originalAmount,
      paidAmount: data.paidAmount,
      paidAtUtc: data.paidAtUtc,
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

function throwMsBankingAxiosError(
  err: unknown,
  defaultTitle: string,
): never {
  const axiosError = err as AxiosError<MsBankingErrorResponse>;
  if (
    axiosError.response?.data?.error &&
    typeof axiosError.response.data.error === 'object'
  ) {
    const payload = axiosError.response.data.error;
    throw new MsBankingApiError({
      code: payload.code ?? axiosError.response.status ?? 500,
      title: payload.title ?? defaultTitle,
      status: payload.status ?? 'UNKNOWN',
      message: payload.message ?? axiosError.message,
      details: payload.details ?? null,
    });
  }
  throw err;
}

function pickStr(obj: Record<string, unknown>, ...keys: string[]): string {
  for (const k of keys) {
    const v = obj[k];
    if (v != null && String(v) !== '') return String(v);
  }
  return '';
}

/**
 * Maps ms-banking slip create response (possibly varying field names) to BillResponseDto shape.
 */
export function normalizeSlipResponseToBillResult(
  raw: Record<string, unknown>,
  digitalAccountPinbankId: string,
): SlipDepositBillResult {
  return {
    pinbankSlipId: pickStr(raw, 'pinbankSlipId', 'id', 'slipId'),
    base64Path: pickStr(raw, 'base64Path', 'base64', 'pdfBase64', 'slipBase64'),
    digitableLine: pickStr(
      raw,
      'digitableLine',
      'linhaDigitavel',
      'digitable_line',
    ),
    barCode: pickStr(raw, 'barCode', 'bar_code', 'codigoBarras', 'codigoDeBarras'),
    digitalAccountPinbankId: pickStr(
      raw,
      'digitalAccountPinbankId',
    ) || digitalAccountPinbankId,
  };
}

/**
 * Creates a card deposit intent (captured payment) via ms-banking.
 */
export async function createCardDepositIntent(
  input: CreateCardDepositIntentInput,
  configOverride?: Partial<MsBankingConfig>,
): Promise<CardDepositIntentSuccessResponse> {
  const config = resolveMsBankingConfig(configOverride);
  const url = `${config.baseUrl.replace(/\/$/, '')}${CARD_DEPOSIT_INTENTS_PATH}/deposit`;
  const buyerCpf =
    typeof input.buyerCpf === 'number'
      ? input.buyerCpf
      : Number(digitsOnly(String(input.buyerCpf)));

  const body = {
    digitalAccountPinbankId: config.digitalAccountPinbankId,
    cardHolderName: input.cardHolderName,
    cardExpiryDate: input.cardExpiryDate,
    cardNumber: digitsOnly(input.cardNumber),
    securityCode: input.securityCode,
    amount: input.amount,
    paymentMethod: input.paymentMethod,
    installmentsCount: input.installmentsCount,
    orderDescription: input.orderDescription,
    buyerIpAddress: input.buyerIpAddress,
    buyerCpf,
    buyerName: input.buyerName,
    preAuthorizedTransaction: input.preAuthorizedTransaction,
  };

  console.log('[spa-checkout] Card deposit intent request:', {
    url,
    body: { ...body, cardNumber: '***', securityCode: '***' },
  });

  try {
    const { data } = await axios.post<CardDepositIntentSuccessResponse>(url, body, {
      headers: msBankingHeaders(config),
    });
    console.log('[spa-checkout] Card deposit intent response:', {
      id: data.id,
      nsuOperation: data.nsuOperation,
      digitalAccountPinbankId: data.digitalAccountPinbankId,
    });
    return data;
  } catch (err) {
    throwMsBankingAxiosError(err, 'CARD_DEPOSIT_ERROR');
  }
}

/**
 * Creates a slip (boleto) deposit intent via ms-banking.
 */
export async function createSlipDepositIntent(
  input: CreateSlipDepositIntentInput,
  configOverride?: Partial<MsBankingConfig>,
): Promise<SlipDepositBillResult> {
  const config = resolveMsBankingConfig(configOverride);
  const url = `${config.baseUrl.replace(/\/$/, '')}${SLIP_DEPOSIT_INTENTS_PATH}`;
  const interestsAmount = input.interestsAmount ?? 0;
  const fineAmount = input.fineAmount ?? 0;

  const body = {
    digitalAccountPinbankId: config.digitalAccountPinbankId,
    dueDate: normalizeDueDateUtcIso(input.dueDate),
    value: input.value,
    email: input.email,
    payerData: input.payerData,
    clientIdentifier: input.clientIdentifier,
    returnBase64: true,
    instructions: input.instructions ?? '',
    interests: { amount: interestsAmount },
    fine: { amount: fineAmount },
  };

  console.log('[spa-checkout] Slip deposit intent request:', {
    url,
    body: {
      ...body,
      payerData: { ...body.payerData, name: truncateForLog(body.payerData.name) },
    },
  });

  try {
    const { data } = await axios.post<Record<string, unknown>>(url, body, {
      headers: msBankingHeaders(config),
    });
    const normalized = normalizeSlipResponseToBillResult(data, config.digitalAccountPinbankId);
    console.log('[spa-checkout] Slip deposit intent response:', {
      pinbankSlipId: normalized.pinbankSlipId,
      digitableLine: truncateForLog(normalized.digitableLine),
      barCode: truncateForLog(normalized.barCode),
      base64Length: normalized.base64Path.length,
    });
    return normalized;
  } catch (err) {
    throwMsBankingAxiosError(err, 'SLIP_DEPOSIT_ERROR');
  }
}

/**
 * Builds request headers for ms-banking (shared by create and get).
 */
function msBankingHeaders(config: MsBankingConfig): Record<string, string> {
  return {
    'accept': 'application/json',
    'content-type': 'application/json',
    'org-id': config.orgId,
    'x-api-key': config.apiKey,
  };
}

/**
 * Fetches PIX deposit intent(s) by ID via ms-banking GET.
 * Uses query params: ids, digitalAccountPinbankIds (from config), page, pageSize.
 * Returns the first item when a single id is requested, or the full list.
 *
 * @param id - Deposit intent ID (e.g. pinbankQrCodeId or originId from create)
 * @param configOverride - optional partial config; otherwise reads from env
 */
export async function getPixDepositIntentById(
  id: string,
  configOverride?: Partial<MsBankingConfig>,
): Promise<PixDepositIntentSuccessResponse | null> {
  return getPixDepositIntentsByIdInternal(id, configOverride, undefined);
}

/**
 * Fetches an approved PIX deposit intent by ID via ms-banking GET.
 * Same as getPixDepositIntentById but adds query param statuses=APPROVED,
 * so only approved payments are returned.
 *
 * @param id - Deposit intent ID (e.g. pinbankQrCodeId or originId from create)
 * @param configOverride - optional partial config; otherwise reads from env
 */
export async function getApprovedPixDepositIntentById(
  id: string,
  configOverride?: Partial<MsBankingConfig>,
): Promise<PixDepositIntentSuccessResponse | null> {
  return getPixDepositIntentsByIdInternal(id, configOverride, 'APPROVED');
}

/**
 * Fetches a declined PIX deposit intent by ID via ms-banking GET.
 * Same as getPixDepositIntentById but adds query param statuses=DECLINED,
 * so only declined payments are returned.
 *
 * @param id - Deposit intent ID (e.g. pinbankQrCodeId or originId from create)
 * @param configOverride - optional partial config; otherwise reads from env
 */
export async function getDeclinedPixDepositIntentById(
  id: string,
  configOverride?: Partial<MsBankingConfig>,
): Promise<PixDepositIntentSuccessResponse | null> {
  return getPixDepositIntentsByIdInternal(id, configOverride, 'DECLINED');
}

async function getPixDepositIntentsByIdInternal(
  id: string,
  configOverride: Partial<MsBankingConfig> | undefined,
  statuses: string | undefined,
): Promise<PixDepositIntentSuccessResponse | null> {
  const config = resolveMsBankingConfig(configOverride);
  const params: Record<string, string> = {
    ids: id,
    digitalAccountPinbankIds: config.digitalAccountPinbankId,
    page: '1',
    pageSize: '10',
  };

  if (statuses) {
    params.statuses = statuses;
  }
  const searchParams = new URLSearchParams(params);
  const url = `${config.baseUrl.replace(/\/$/, '')}${PIX_DEPOSIT_INTENTS_PATH}?${searchParams.toString()}`;

  try {
    const { data } = await axios.get<GetPixDepositIntentsResponse>(url, {
      headers: msBankingHeaders(config),
    });
    const list = data.items ?? [];
    const item = list.length > 0 ? list[0] : null;
    const logLabelSuffix = statuses === 'APPROVED' ? 'approved' : statuses === 'DECLINED' ? 'declined' : '';
    const responseLogLabel = logLabelSuffix
      ? `GET PIX deposit intent (${logLabelSuffix}) response`
      : 'GET PIX deposit intent response';
    console.log(`[spa-checkout] ${responseLogLabel}:`, item ? { pinbankQrCodeId: item.pinbankQrCodeId, endToEnd: item.endToEnd, paidAtUtc: item.paidAtUtc } : 'empty');
    return item;
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

export async function getApprovedCardDepositIntentById(
  id: string,
  configOverride?: Partial<MsBankingConfig>,
): Promise<CardDepositIntentSuccessResponse | null> {
  return getCardDepositIntentsByIdInternal(id, configOverride, 'APPROVED');
}

export async function getDeclinedCardDepositIntentById(
  id: string,
  configOverride?: Partial<MsBankingConfig>,
): Promise<CardDepositIntentSuccessResponse | null> {
  return getCardDepositIntentsByIdInternal(id, configOverride, 'DECLINED');
}

async function getCardDepositIntentsByIdInternal(
  id: string,
  configOverride: Partial<MsBankingConfig> | undefined,
  statuses: string | undefined,
): Promise<CardDepositIntentSuccessResponse | null> {
  const config = resolveMsBankingConfig(configOverride);
  const params: Record<string, string> = {
    ids: id,
    digitalAccountPinbankIds: config.digitalAccountPinbankId,
    page: '1',
    pageSize: '10',
  };
  if (statuses) params.statuses = statuses;
  const searchParams = new URLSearchParams(params);
  const url = `${config.baseUrl.replace(/\/$/, '')}${CARD_DEPOSIT_INTENTS_PATH}?${searchParams.toString()}`;
  try {
    const { data } = await axios.get<GetCardDepositIntentsResponse>(url, {
      headers: msBankingHeaders(config),
    });
    const list = data.items ?? [];
    return list.length > 0 ? list[0] : null;
  } catch (err) {
    throwMsBankingAxiosError(err, 'CARD_DEPOSIT_QUERY_ERROR');
  }
}

export async function getApprovedSlipDepositIntentById(
  id: string,
  configOverride?: Partial<MsBankingConfig>,
): Promise<Record<string, unknown> | null> {
  return getSlipDepositIntentsByIdInternal(id, configOverride, 'APPROVED');
}

export async function getDeclinedSlipDepositIntentById(
  id: string,
  configOverride?: Partial<MsBankingConfig>,
): Promise<Record<string, unknown> | null> {
  return getSlipDepositIntentsByIdInternal(id, configOverride, 'DECLINED');
}

async function getSlipDepositIntentsByIdInternal(
  id: string,
  configOverride: Partial<MsBankingConfig> | undefined,
  statuses: string | undefined,
): Promise<Record<string, unknown> | null> {
  const config = resolveMsBankingConfig(configOverride);
  const params: Record<string, string> = {
    ids: id,
    digitalAccountPinbankIds: config.digitalAccountPinbankId,
    page: '1',
    pageSize: '10',
  };
  if (statuses) params.statuses = statuses;
  const searchParams = new URLSearchParams(params);
  const url = `${config.baseUrl.replace(/\/$/, '')}${SLIP_DEPOSIT_INTENTS_PATH}?${searchParams.toString()}`;
  try {
    const { data } = await axios.get<GetSlipDepositIntentsResponse>(url, {
      headers: msBankingHeaders(config),
    });
    const list = data.items ?? [];
    return list.length > 0 ? (list[0] as Record<string, unknown>) : null;
  } catch (err) {
    throwMsBankingAxiosError(err, 'SLIP_DEPOSIT_QUERY_ERROR');
  }
}
