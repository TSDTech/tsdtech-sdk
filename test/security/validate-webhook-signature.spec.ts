import { describe, it, expect } from 'vitest';
import { validateWebhookSignature, signPayload } from '../../src/security/validate-webhook-signature';

const VALID_SECRET = '9f4c2e5e5c4d2e98e3a5a6b2c1d4e6f8a1b2c3d4e5f60718293a4b5c6d7e8f90';

describe('validateWebhookSignature', () => {
  describe('signature válida', () => {
    it('deve aceitar assinatura gerada com signPayload para body objeto', () => {
      const body = { event: 'deposit.confirmed', amount: 1000 };
      const { signature, timestamp } = signPayload({ body, secret: VALID_SECRET });
      const result = validateWebhookSignature({ body, signature, timestamp, secret: VALID_SECRET });
      expect(result.valid).toBe(true);
    });

    it('deve aceitar para body array', () => {
      const body = [{ id: '1' }, { id: '2' }];
      const { signature, timestamp } = signPayload({ body, secret: VALID_SECRET });
      const result = validateWebhookSignature({ body, signature, timestamp, secret: VALID_SECRET });
      expect(result.valid).toBe(true);
    });

    it('deve aceitar para body null', () => {
      const { signature, timestamp } = signPayload({ body: null, secret: VALID_SECRET });
      const result = validateWebhookSignature({ body: null, signature, timestamp, secret: VALID_SECRET });
      expect(result.valid).toBe(true);
    });

    it('deve aceitar para body string', () => {
      const { signature, timestamp } = signPayload({ body: 'hello', secret: VALID_SECRET });
      const result = validateWebhookSignature({ body: 'hello', signature, timestamp, secret: VALID_SECRET });
      expect(result.valid).toBe(true);
    });
  });

  describe('assinatura inválida', () => {
    it('deve rejeitar quando secret é diferente', () => {
      const body = { amount: 500 };
      const { signature, timestamp } = signPayload({ body, secret: VALID_SECRET });
      const wrongSecret = 'a1b2c3d4e5f60718293a4b5c6d7e8f909f4c2e5e5c4d2e98e3a5a6b2c1d4e6f8';
      const result = validateWebhookSignature({ body, signature, timestamp, secret: wrongSecret });
      expect(result.valid).toBe(false);
      expect(result.reason).toBeDefined();
    });

    it('deve rejeitar quando body é diferente', () => {
      const body = { amount: 500 };
      const { signature, timestamp } = signPayload({ body, secret: VALID_SECRET });
      const result = validateWebhookSignature({ body: { amount: 999 }, signature, timestamp, secret: VALID_SECRET });
      expect(result.valid).toBe(false);
    });

    it('deve rejeitar quando signature é adulterada', () => {
      const body = { amount: 500 };
      const { signature, timestamp } = signPayload({ body, secret: VALID_SECRET });
      const result = validateWebhookSignature({ body, signature: signature + 'ff', timestamp, secret: VALID_SECRET });
      expect(result.valid).toBe(false);
    });

    it('deve rejeitar quando timestamp é diferente', () => {
      const body = { amount: 500 };
      const { signature } = signPayload({ body, secret: VALID_SECRET, timestamp: 1000 });
      const result = validateWebhookSignature({ body, signature, timestamp: 9999, secret: VALID_SECRET });
      expect(result.valid).toBe(false);
    });
  });

  describe('validação de formato', () => {
    it('deve rejeitar signature sem prefixo sha256=', () => {
      const result = validateWebhookSignature({
        body: {}, signature: 'a1b2c3d4', timestamp: 1000, secret: VALID_SECRET,
      });
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('sha256=');
    });

    it('deve rejeitar secret com tamanho errado (48 chars)', () => {
      const result = validateWebhookSignature({
        body: {}, signature: 'sha256=aabb', timestamp: 1000, secret: 'a'.repeat(48),
      });
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('64-character');
    });

    it('deve rejeitar secret com caracteres não hex', () => {
      const result = validateWebhookSignature({
        body: {}, signature: 'sha256=aabb', timestamp: 1000, secret: 'z' + 'a'.repeat(63),
      });
      expect(result.valid).toBe(false);
    });

    it('deve aceitar timestamp como string', () => {
      const body = { ok: true };
      const { signature, timestamp } = signPayload({ body, secret: VALID_SECRET });
      const result = validateWebhookSignature({ body, signature, timestamp: String(timestamp), secret: VALID_SECRET });
      expect(result.valid).toBe(true);
    });
  });

  describe('tolerância de timestamp', () => {
    it('deve rejeitar timestamp expirado', () => {
      const body = { ok: true };
      const { signature, timestamp } = signPayload({ body, secret: VALID_SECRET, timestamp: Date.now() - 600_000 });
      const result = validateWebhookSignature({ body, signature, timestamp, secret: VALID_SECRET, toleranceMs: 300_000 });
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('tolerance');
    });

    it('deve aceitar timestamp dentro da tolerância', () => {
      const body = { ok: true };
      const { signature, timestamp } = signPayload({ body, secret: VALID_SECRET });
      const result = validateWebhookSignature({ body, signature, timestamp, secret: VALID_SECRET, toleranceMs: 300_000 });
      expect(result.valid).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('deve retornar { valid: false } sem lançar exceção para body com referência circular', () => {
      const body: any = { a: 1 };
      body.self = body;
      const result = validateWebhookSignature({
        body, signature: 'sha256=aabb', timestamp: 1000, secret: VALID_SECRET,
      });
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('serialize');
    });

    it('deve rejeitar secret undefined', () => {
      const result = validateWebhookSignature({
        body: {}, signature: 'sha256=aabb', timestamp: 1000, secret: '',
      });
      expect(result.valid).toBe(false);
    });

    it('deve rejeitar signature vazia', () => {
      const result = validateWebhookSignature({
        body: {}, signature: '', timestamp: 1000, secret: VALID_SECRET,
      });
      expect(result.valid).toBe(false);
    });
  });
});
