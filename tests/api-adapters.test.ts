import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ApiClient, ApiError } from '@/services/api/api-client';
import { CatalogApiAdapter } from '@/services/api/catalog.api.adapter';
import { WorkshopJobApiAdapter } from '@/services/api/workshop-job.api.adapter';
import { VehicleHistoryApiAdapter } from '@/services/api/vehicle-history.api.adapter';
import { PosSaleApiAdapter } from '@/services/api/pos-sale.api.adapter';
import { PosShiftApiAdapter } from '@/services/api/pos-shift.api.adapter';
import { FinanceApiAdapter } from '@/services/api/finance.api.adapter';
import { AnalyticsApiAdapter } from '@/services/api/analytics.api.adapter';
import {
  getRepositories,
  catalogApiAdapter,
  workshopJobApiAdapter,
  vehicleHistoryApiAdapter,
  posSaleApiAdapter,
  posShiftApiAdapter,
  financeApiAdapter,
  analyticsApiAdapter,
} from '@/services/api';

describe('Integration Readiness: REST API Adapters & ApiClient Unit Tests', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  describe('1. ApiClient & HTTP Transport Invariants', () => {
    it('normalizes base URL with trailing slashes to avoid double-slash endpoints', async () => {
      let requestedUrl = '';
      globalThis.fetch = vi.fn().mockImplementation(async (url: string) => {
        requestedUrl = url;
        return {
          ok: true,
          status: 200,
          json: async () => ({ status: 'ok' }),
        } as Response;
      });

      const clientWithSlash = new ApiClient({ baseUrl: 'https://api.workshop.lk/api/v1/' });
      await clientWithSlash.get('/catalog');
      expect(requestedUrl).toBe('https://api.workshop.lk/api/v1/catalog');
      expect(requestedUrl).not.toContain('v1//catalog');

      await clientWithSlash.get('pos/sales');
      expect(requestedUrl).toBe('https://api.workshop.lk/api/v1/pos/sales');
    });

    it('injects JWT Bearer authorization header from localStorage', async () => {
      localStorage.setItem('antigravity_auth_token', 'test-jwt-token-12345');
      let capturedHeaders: Record<string, string> = {};

      globalThis.fetch = vi.fn().mockImplementation(async (_url: string, init?: RequestInit) => {
        capturedHeaders = init?.headers as Record<string, string>;
        return {
          ok: true,
          status: 200,
          json: async () => ({ success: true }),
        } as Response;
      });

      const client = new ApiClient();
      await client.get('/test');
      expect(capturedHeaders['Authorization']).toBe('Bearer test-jwt-token-12345');
    });

    it('throws ApiError with server error payload on non-2xx status', async () => {
      globalThis.fetch = vi.fn().mockImplementation(async () => {
        return {
          ok: false,
          status: 400,
          json: async () => ({ message: ['Plate number is required', 'Invalid stage'] }),
        } as Response;
      });

      const client = new ApiClient();
      await expect(client.post('/test', {})).rejects.toThrow(ApiError);
      await expect(client.post('/test', {})).rejects.toThrow(
        'Plate number is required, Invalid stage'
      );
    });

    it('handles HTTP 204 No Content returning empty object without JSON parse crash', async () => {
      globalThis.fetch = vi.fn().mockImplementation(async () => {
        return {
          ok: true,
          status: 204,
        } as Response;
      });

      const client = new ApiClient();
      const res = await client.delete('/catalog/item-123');
      expect(res).toEqual({});
    });
  });

  describe('2. CatalogApiAdapter', () => {
    it('calls GET /catalog with properly serialized query params', async () => {
      let requestedUrl = '';
      globalThis.fetch = vi.fn().mockImplementation(async (url: string) => {
        requestedUrl = url;
        return {
          ok: true,
          status: 200,
          json: async () => ({ items: [{ id: '1', sku: 'SKU-1' }], total: 1 }),
        } as Response;
      });

      const adapter = new CatalogApiAdapter(new ApiClient({ baseUrl: '/api/v1' }));
      const items = await adapter.filter({ search: 'Oil', itemType: 'LUBRICANT', activeOnly: true });

      expect(requestedUrl).toContain('/api/v1/catalog?');
      expect(requestedUrl).toContain('search=Oil');
      expect(requestedUrl).toContain('itemType=LUBRICANT');
      expect(requestedUrl).toContain('activeOnly=true');
      expect(items.length).toBe(1);
    });

    it('returns null gracefully on 404 when item is not found', async () => {
      globalThis.fetch = vi.fn().mockImplementation(async () => {
        return {
          ok: false,
          status: 404,
          json: async () => ({ message: 'Not found' }),
        } as Response;
      });

      const adapter = new CatalogApiAdapter(new ApiClient({ baseUrl: '/api/v1' }));
      const item = await adapter.getById('non-existent-id');
      expect(item).toBeNull();
    });

    it('handles adjustStock with deltaQty and reason', async () => {
      let requestedBody: any;
      globalThis.fetch = vi.fn().mockImplementation(async (_url: string, init?: RequestInit) => {
        requestedBody = JSON.parse(init?.body as string);
        return {
          ok: true,
          status: 200,
          json: async () => ({ id: 'item-1', stockQty: 15 }),
        } as Response;
      });

      const adapter = new CatalogApiAdapter(new ApiClient({ baseUrl: '/api/v1' }));
      const res = await adapter.adjustStock('item-1', -5, 'Used in repair');
      expect(requestedBody).toEqual({ deltaQty: -5, reason: 'Used in repair' });
      expect(res.stockQty).toBe(15);
    });
  });

  describe('3. WorkshopJobApiAdapter', () => {
    it('calls convertStage endpoint according to INTEGRATION_CONTRACT.md', async () => {
      let requestedUrl = '';
      let requestedBody: any;
      globalThis.fetch = vi.fn().mockImplementation(async (url: string, init?: RequestInit) => {
        requestedUrl = url;
        requestedBody = JSON.parse(init?.body as string);
        return {
          ok: true,
          status: 200,
          json: async () => ({ id: 'job-1', docStage: 'JOB_CARD' }),
        } as Response;
      });

      const adapter = new WorkshopJobApiAdapter(new ApiClient({ baseUrl: '/api/v1' }));
      const res = await adapter.convertStage('job-1', 'JOB_CARD', 'Customer signed approval');

      expect(requestedUrl).toBe('/api/v1/workshop/jobs/job-1/convert-stage');
      expect(requestedBody).toEqual({
        targetStage: 'JOB_CARD',
        reason: 'Customer signed approval',
      });
      expect(res.docStage).toBe('JOB_CARD');
    });

    it('records payment via POST /workshop/jobs/:id/payments', async () => {
      let requestedUrl = '';
      let requestedBody: any;
      globalThis.fetch = vi.fn().mockImplementation(async (url: string, init?: RequestInit) => {
        requestedUrl = url;
        requestedBody = JSON.parse(init?.body as string);
        return {
          ok: true,
          status: 200,
          json: async () => ({ id: 'job-1', paymentStatus: 'PARTIALLY_PAID' }),
        } as Response;
      });

      const adapter = new WorkshopJobApiAdapter(new ApiClient({ baseUrl: '/api/v1' }));
      const res = await adapter.recordPayment('job-1', {
        amountRs: 5000,
        paymentType: 'ADVANCE',
        paymentMethod: 'CASH',
        referenceNumber: 'CASH-01',
      });

      expect(requestedUrl).toBe('/api/v1/workshop/jobs/job-1/payments');
      expect(requestedBody.amountRs).toBe(5000);
      expect(res.paymentStatus).toBe('PARTIALLY_PAID');
    });

    it('calls GET /workshop/jobs with correctly mapped query params omitting ALL', async () => {
      let requestedUrl = '';
      globalThis.fetch = vi.fn().mockImplementation(async (url: string) => {
        requestedUrl = url;
        return {
          ok: true,
          status: 200,
          json: async () => ({ jobs: [], total: 0 }),
        } as Response;
      });

      const adapter = new WorkshopJobApiAdapter(new ApiClient({ baseUrl: '/api/v1' }));
      await adapter.filter({ search: 'CAD', stage: 'ALL', status: 'WAITING_FOR_PARTS' });

      expect(requestedUrl).toContain('/api/v1/workshop/jobs?');
      expect(requestedUrl).toContain('search=CAD');
      expect(requestedUrl).toContain('floorStatus=WAITING_FOR_PARTS');
      expect(requestedUrl).not.toContain('stage=ALL');
      expect(requestedUrl).not.toContain('status=');
    });
  });

  describe('4. VehicleHistoryApiAdapter', () => {
    it('returns empty array when plateQuery is empty', async () => {
      const adapter = new VehicleHistoryApiAdapter(new ApiClient({ baseUrl: '/api/v1' }));
      const records = await adapter.lookupByPlate('');
      expect(records).toEqual([]);
    });

    it('calls GET /workshop/jobs/lookup with search parameter', async () => {
      let requestedUrl = '';
      globalThis.fetch = vi.fn().mockImplementation(async (url: string) => {
        requestedUrl = url;
        return {
          ok: true,
          status: 200,
          json: async () => ({
            records: [
              {
                id: 'vh-1',
                vehicleNumber: 'WP CAB-1234',
                customerName: 'Kamal Silva',
              },
            ],
          }),
        } as Response;
      });

      const adapter = new VehicleHistoryApiAdapter(new ApiClient({ baseUrl: '/api/v1' }));
      const records = await adapter.lookupByPlate('CAB-1234');
      expect(requestedUrl).toContain('/api/v1/workshop/jobs/lookup?search=CAB-1234');
      expect(records.length).toBe(1);
      expect(records[0].vehicleNumber).toBe('WP CAB-1234');
    });

    it('calls getByExactPlate with encoded vehicleNumber path param', async () => {
      let requestedUrl = '';
      globalThis.fetch = vi.fn().mockImplementation(async (url: string) => {
        requestedUrl = url;
        return {
          ok: true,
          status: 200,
          json: async () => ({
            id: 'vh-1',
            vehicleNumber: 'WP CAB-1234',
          }),
        } as Response;
      });

      const adapter = new VehicleHistoryApiAdapter(new ApiClient({ baseUrl: '/api/v1' }));
      const record = await adapter.getByExactPlate('WP CAB-1234');
      expect(requestedUrl).toBe('/api/v1/workshop/jobs/lookup/WP%20CAB-1234');
      expect(record?.vehicleNumber).toBe('WP CAB-1234');
    });
  });

  describe('5. PosSaleApiAdapter & PosShiftApiAdapter', () => {
    it('PosShiftApiAdapter sends closing note and actual cash', async () => {
      let requestedUrl = '';
      let requestedBody: any;
      globalThis.fetch = vi.fn().mockImplementation(async (url: string, init?: RequestInit) => {
        requestedUrl = url;
        requestedBody = JSON.parse(init?.body as string);
        return {
          ok: true,
          status: 200,
          json: async () => ({ id: 'shift-1', status: 'CLOSED' }),
        } as Response;
      });

      const adapter = new PosShiftApiAdapter(new ApiClient({ baseUrl: '/api/v1' }));
      const res = await adapter.closeShift('shift-1', 25000, 'Shift ended normally');

      expect(requestedUrl).toBe('/api/v1/pos/shifts/shift-1/close');
      expect(requestedBody).toEqual({
        actualDrawerCashRs: 25000,
        note: 'Shift ended normally',
      });
      expect(res.status).toBe('CLOSED');
    });

    it('PosSaleApiAdapter posts create POS sale transaction', async () => {
      let requestedUrl = '';
      let requestedBody: any;
      globalThis.fetch = vi.fn().mockImplementation(async (url: string, init?: RequestInit) => {
        requestedUrl = url;
        requestedBody = JSON.parse(init?.body as string);
        return {
          ok: true,
          status: 200,
          json: async () => ({ id: 'sale-1', netSalesRs: 4500 }),
        } as Response;
      });

      const adapter = new PosSaleApiAdapter(new ApiClient({ baseUrl: '/api/v1' }));
      const res = await adapter.create({
        shiftId: 'shift-1',
        cashierId: 'c1',
        cashierName: 'Cashier 1',
        paymentMethod: 'CASH',
        amountTenderedRs: 5000,
        items: [
          {
            catalogItemId: 'item-1',
            sku: 'SKU-1',
            description: 'Item 1',
            category: 'LUBRICANTS',
            unitSellingPriceRs: 4500,
            unitBuyingCostRs: 3000,
            qty: 1,
            lineDiscountRs: 0,
          },
        ],
      });

      expect(requestedUrl).toBe('/api/v1/pos/sales');
      expect(requestedBody.items.length).toBe(1);
      expect(res.netSalesRs).toBe(4500);
    });
  });

  describe('6. FinanceApiAdapter & AnalyticsApiAdapter', () => {
    it('FinanceApiAdapter throws descriptive error on synchronous calls', () => {
      const adapter = new FinanceApiAdapter(new ApiClient({ baseUrl: '/api/v1' }));
      expect(() => adapter.getExpensesSync()).toThrow(
        'Synchronous operation not supported in REST API mode'
      );
      expect(() => adapter.getProfitLedgerSummarySync()).toThrow(
        'Synchronous operation not supported in REST API mode'
      );
    });

    it('AnalyticsApiAdapter passes date-range parameters to sales-profit endpoint', async () => {
      let requestedUrl = '';
      globalThis.fetch = vi.fn().mockImplementation(async (url: string) => {
        requestedUrl = url;
        return {
          ok: true,
          status: 200,
          json: async () => ({
            dateRange: { range: 'THIS_MONTH', startDate: '2026-11-01', endDate: '2026-11-30' },
            totalNetSalesRs: 100000,
            totalDirectCostRs: 60000,
            combinedGrossProfitRs: 40000,
            grossMarginPct: 40,
            streams: {
              workshopLabor: { salesRs: 50000, costRs: 20000, profitRs: 30000, marginPct: 60 },
              workshopParts: { salesRs: 30000, costRs: 25000, profitRs: 5000, marginPct: 16.7 },
              counterPosSales: { salesRs: 20000, costRs: 15000, profitRs: 5000, marginPct: 25 },
            },
            invoicedJobsCount: 5,
            posSalesCount: 10,
          }),
        } as Response;
      });

      const adapter = new AnalyticsApiAdapter(new ApiClient({ baseUrl: '/api/v1' }));
      const report = await adapter.getSalesGrossProfitReport({
        range: 'THIS_MONTH',
        startDate: '2026-11-01',
        endDate: '2026-11-30',
      });

      expect(requestedUrl).toContain('/api/v1/analytics/sales-profit?');
      expect(requestedUrl).toContain('range=THIS_MONTH');
      expect(requestedUrl).toContain('startDate=2026-11-01');
      expect(report.totalNetSalesRs).toBe(100000);
    });
  });

  describe('7. getRepositories Registry Swapping Invariant', () => {
    it('returns all mock repositories when VITE_USE_API is not true', () => {
      const repos = getRepositories();
      expect(repos.catalogRepository).toBeDefined();
      expect(repos.workshopJobRepository).toBeDefined();
      expect(repos.vehicleHistoryRepository).toBeDefined();
      expect(repos.posSaleRepository).toBeDefined();
      expect(repos.posShiftRepository).toBeDefined();
      expect(repos.financeRepository).toBeDefined();
      expect(repos.analyticsRepository).toBeDefined();

      // Mock repository supports synchronous methods
      expect(typeof (repos.catalogRepository as { getAllSync?: () => unknown }).getAllSync).toBe('function');
      expect(typeof (repos.workshopJobRepository as { getAllSync?: () => unknown }).getAllSync).toBe('function');
    });

    it('returns all REST API adapter instances when VITE_USE_API is "true"', () => {
      vi.stubEnv('VITE_USE_API', 'true');
      const repos = getRepositories();
      expect(repos.catalogRepository).toBe(catalogApiAdapter);
      expect(repos.workshopJobRepository).toBe(workshopJobApiAdapter);
      expect(repos.vehicleHistoryRepository).toBe(vehicleHistoryApiAdapter);
      expect(repos.posSaleRepository).toBe(posSaleApiAdapter);
      expect(repos.posShiftRepository).toBe(posShiftApiAdapter);
      expect(repos.financeRepository).toBe(financeApiAdapter);
      expect(repos.analyticsRepository).toBe(analyticsApiAdapter);
      vi.unstubAllEnvs();
    });
  });
});
