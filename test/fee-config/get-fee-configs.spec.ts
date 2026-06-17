import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TsdTechSdk } from '../../src/client/sdk.client';
import { FeeConfigStatusEnum } from '../../src/dto/fee-config/fee-config-status.enum';
import { PaymentMethod } from '../../src/dto/deposit-request/pix/payment-method.enum';
import type { FeeConfigResponse } from '../../src/dto/fee-config/fee-config-response.interface';
import type { PaginatedListResponse } from '../../src/dto/common/pagination.interface';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeSdk(): TsdTechSdk {
  return new TsdTechSdk({
    bankingApiKey: 'test-api-key',
    bankingOrgId: 'test-org-id',
    environment: 'hml',
  });
}

function makeFeeConfigResponse(overrides: Partial<FeeConfigResponse> = {}): FeeConfigResponse {
  return {
    id: 'fee-config-uuid-1',
    organizationId: 'org-uuid-1',
    paymentMethod: PaymentMethod.PIX,
    percentageFee: 0.02,
    fixedFee: 0.5,
    minFee: 0.1,
    maxFee: 50,
    status: FeeConfigStatusEnum.ACTIVE,
    createdAtUtc: new Date('2024-01-01T00:00:00Z'),
    updatedAtUtc: new Date('2024-06-01T00:00:00Z'),
    ...overrides,
  };
}

function makePaginatedResponse(
  items: FeeConfigResponse[] = [makeFeeConfigResponse()]
): PaginatedListResponse<FeeConfigResponse> {
  return {
    items,
    pageCount: 1,
    totalItems: items.length,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('TsdTechSdk.getFeeConfigs()', () => {
  let sdk: TsdTechSdk;

  beforeEach(() => {
    sdk = makeSdk();
  });

  describe('chamada HTTP', () => {
    it('deve chamar GET /fee-configs/api-key sem parâmetros quando filters e pagination são omitidos', async () => {
      const expectedResponse = makePaginatedResponse();
      const getSpy = vi
        .spyOn((sdk as any).http, 'get')
        .mockResolvedValueOnce({ data: expectedResponse });

      const result = await sdk.getFeeConfigs();

      expect(getSpy).toHaveBeenCalledOnce();
      const [url, config] = getSpy.mock.calls[0];
      expect(url).toContain('/fee-configs/api-key');
      expect(config.params).toEqual({});
      expect(result).toEqual(expectedResponse);
    });

    it('deve passar filtros como query params corretamente', async () => {
      const expectedResponse = makePaginatedResponse();
      const getSpy = vi
        .spyOn((sdk as any).http, 'get')
        .mockResolvedValueOnce({ data: expectedResponse });

      const filters = {
        ids: ['uuid-1', 'uuid-2'],
        paymentMethods: [PaymentMethod.PIX, PaymentMethod.SLIP],
        status: [FeeConfigStatusEnum.ACTIVE],
      };

      await sdk.getFeeConfigs(filters);

      const [, config] = getSpy.mock.calls[0];
      expect(config.params).toMatchObject(filters);
    });

    it('deve passar parâmetros de paginação corretamente', async () => {
      const expectedResponse = makePaginatedResponse();
      const getSpy = vi
        .spyOn((sdk as any).http, 'get')
        .mockResolvedValueOnce({ data: expectedResponse });

      const pagination = { page: 2, pageSize: 10 };

      await sdk.getFeeConfigs(undefined, pagination);

      const [, config] = getSpy.mock.calls[0];
      expect(config.params).toMatchObject(pagination);
    });

    it('deve mesclar filtros e paginação nos params', async () => {
      const expectedResponse = makePaginatedResponse();
      const getSpy = vi
        .spyOn((sdk as any).http, 'get')
        .mockResolvedValueOnce({ data: expectedResponse });

      const filters = { status: [FeeConfigStatusEnum.INACTIVE] };
      const pagination = { page: 1, pageSize: 5 };

      await sdk.getFeeConfigs(filters, pagination);

      const [, config] = getSpy.mock.calls[0];
      expect(config.params).toMatchObject({ ...filters, ...pagination });
    });
  });

  describe('resposta', () => {
    it('deve retornar PaginatedListResponse<FeeConfigResponse> com items, pageCount e totalItems', async () => {
      const feeConfigs = [
        makeFeeConfigResponse({ id: 'fee-1', paymentMethod: PaymentMethod.PIX }),
        makeFeeConfigResponse({ id: 'fee-2', paymentMethod: PaymentMethod.SLIP }),
      ];
      const expectedResponse = makePaginatedResponse(feeConfigs);

      vi.spyOn((sdk as any).http, 'get').mockResolvedValueOnce({ data: expectedResponse });

      const result = await sdk.getFeeConfigs();

      expect(result.items).toHaveLength(2);
      expect(result.pageCount).toBe(1);
      expect(result.totalItems).toBe(2);
      expect(result.items[0].id).toBe('fee-1');
      expect(result.items[1].id).toBe('fee-2');
    });

    it('deve retornar lista vazia quando não há fee-configs', async () => {
      const expectedResponse = makePaginatedResponse([]);
      vi.spyOn((sdk as any).http, 'get').mockResolvedValueOnce({ data: expectedResponse });

      const result = await sdk.getFeeConfigs();

      expect(result.items).toHaveLength(0);
      expect(result.totalItems).toBe(0);
    });

    it('deve preservar todos os campos de FeeConfigResponse', async () => {
      const feeConfig = makeFeeConfigResponse({
        id: 'fee-uuid',
        organizationId: 'org-uuid',
        paymentMethod: PaymentMethod.SLIP,
        percentageFee: 0.015,
        fixedFee: 1.0,
        minFee: 0.5,
        maxFee: 100,
        status: FeeConfigStatusEnum.INACTIVE,
      });
      vi.spyOn((sdk as any).http, 'get').mockResolvedValueOnce({
        data: makePaginatedResponse([feeConfig]),
      });

      const result = await sdk.getFeeConfigs();
      const item = result.items[0];

      expect(item.id).toBe('fee-uuid');
      expect(item.organizationId).toBe('org-uuid');
      expect(item.paymentMethod).toBe(PaymentMethod.SLIP);
      expect(item.percentageFee).toBe(0.015);
      expect(item.fixedFee).toBe(1.0);
      expect(item.minFee).toBe(0.5);
      expect(item.maxFee).toBe(100);
      expect(item.status).toBe(FeeConfigStatusEnum.INACTIVE);
    });

    it('deve funcionar com campos opcionais (minFee e maxFee) ausentes', async () => {
      const feeConfig: FeeConfigResponse = {
        id: 'fee-no-optional',
        organizationId: 'org-uuid',
        paymentMethod: PaymentMethod.PIX,
        percentageFee: 0.01,
        fixedFee: 0,
        status: FeeConfigStatusEnum.ACTIVE,
        createdAtUtc: new Date(),
        updatedAtUtc: new Date(),
      };
      vi.spyOn((sdk as any).http, 'get').mockResolvedValueOnce({
        data: makePaginatedResponse([feeConfig]),
      });

      const result = await sdk.getFeeConfigs();
      const item = result.items[0];

      expect(item.minFee).toBeUndefined();
      expect(item.maxFee).toBeUndefined();
    });
  });

  describe('FeeConfigStatusEnum', () => {
    it('deve conter os valores ACTIVE e INACTIVE', () => {
      expect(FeeConfigStatusEnum.ACTIVE).toBe('ACTIVE');
      expect(FeeConfigStatusEnum.INACTIVE).toBe('INACTIVE');
    });
  });

  describe('filtro por status', () => {
    it('deve aceitar array com múltiplos status', async () => {
      const expectedResponse = makePaginatedResponse();
      const getSpy = vi
        .spyOn((sdk as any).http, 'get')
        .mockResolvedValueOnce({ data: expectedResponse });

      await sdk.getFeeConfigs({
        status: [FeeConfigStatusEnum.ACTIVE, FeeConfigStatusEnum.INACTIVE],
      });

      const [, config] = getSpy.mock.calls[0];
      expect(config.params.status).toContain(FeeConfigStatusEnum.ACTIVE);
      expect(config.params.status).toContain(FeeConfigStatusEnum.INACTIVE);
    });
  });
});
