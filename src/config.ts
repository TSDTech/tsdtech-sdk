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

function maskSecret(value: string): string {
  if (value.length <= 8) return '***';
  return `${value.slice(0, 4)}***${value.slice(-4)}`;
}

/**
 * Logs current ms-banking config with secrets masked (e.g. for debugging).
 */
export function logMsBankingConfig(config: MsBankingConfig): void {
  console.log('[spa-checkout] MS_BANKING config:', {
    baseUrl: config.baseUrl,
    apiKey: maskSecret(config.apiKey),
    orgId: config.orgId,
    bankCode: config.bankCode,
    digitalAccountPinbankId: config.digitalAccountPinbankId,
  });
}

/**
 * Merges env-based config with optional overrides (e.g. for tests).
 * If override contains all required fields, it is used as-is (no env needed).
 */
export function resolveMsBankingConfig(
  override?: Partial<MsBankingConfig>,
): MsBankingConfig {
  if (override && isFullConfig(override)) {
    logMsBankingConfig(override);
    return override;
  }
  const fromEnv = getMsBankingConfigFromEnv();
  const config = { ...fromEnv, ...override };
  logMsBankingConfig(config);
  return config;
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
