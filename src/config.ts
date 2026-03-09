/**
 * Configuration for ms-banking API (PIX deposit intents).
 * Values are read from process.env when not overridden.
 */
export interface MsBankingConfig {
  baseUrl: string;
  apiKey: string;
  orgId: string;
  bankCode: string;
  digitalAccountPinbankId: string;
}

const ENV_KEYS = {
  baseUrl: 'MS_BANKING_BASE_URL',
  apiKey: 'MS_BANKING_API_KEY',
  orgId: 'MS_BANKING_ORG_ID',
  bankCode: 'MS_BANKING_BANK_CODE',
  digitalAccountPinbankId: 'MS_BANKING_DIGITAL_ACCOUNT_PINBANK_ID',
} as const;

/**
 * Reads ms-banking config from process.env.
 * Throws if any required variable is missing.
 */
export function getMsBankingConfigFromEnv(): MsBankingConfig {
  const baseUrl = process.env[ENV_KEYS.baseUrl];
  const apiKey = process.env[ENV_KEYS.apiKey];
  const orgId = process.env[ENV_KEYS.orgId];
  const bankCode = process.env[ENV_KEYS.bankCode];
  const digitalAccountPinbankId = process.env[ENV_KEYS.digitalAccountPinbankId];

  if (!baseUrl || !apiKey || !orgId || !bankCode || !digitalAccountPinbankId) {
    const missing = [
      !baseUrl && ENV_KEYS.baseUrl,
      !apiKey && ENV_KEYS.apiKey,
      !orgId && ENV_KEYS.orgId,
      !bankCode && ENV_KEYS.bankCode,
      !digitalAccountPinbankId && ENV_KEYS.digitalAccountPinbankId,
    ].filter(Boolean);
    throw new Error(
      `Missing required ms-banking config: ${(missing as string[]).join(', ')}`,
    );
  }

  return {
    baseUrl,
    apiKey,
    orgId,
    bankCode,
    digitalAccountPinbankId,
  };
}

/**
 * Merges env-based config with optional overrides (e.g. for tests).
 * If override contains all required fields, it is used as-is (no env needed).
 */
export function resolveMsBankingConfig(
  override?: Partial<MsBankingConfig>,
): MsBankingConfig {
  if (override && isFullConfig(override)) {
    return override;
  }
  const fromEnv = getMsBankingConfigFromEnv();
  return { ...fromEnv, ...override };
}

function isFullConfig(o: Partial<MsBankingConfig>): o is MsBankingConfig {
  const keys: (keyof MsBankingConfig)[] = [
    'baseUrl',
    'apiKey',
    'orgId',
    'bankCode',
    'digitalAccountPinbankId',
  ];
  return keys.every((k) => o[k] != null && o[k] !== '');
}
