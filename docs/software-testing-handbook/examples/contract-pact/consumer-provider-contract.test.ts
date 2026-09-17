/**
 * Runnable Consumer-Driven API Contract Test Example
 * Location: docs/software-testing-handbook/examples/contract-pact/consumer-provider-contract.test.ts
 */

import { describe, it, expect } from 'vitest';

describe('Consumer-Driven Contract Validation: Web App -> REST API', () => {
  const expectedContractSchema = {
    tenantId: 'string',
    activeUsers: 'number',
    monthlyQuotaLimit: 'number',
    tier: ['STARTER', 'PRO', 'ENTERPRISE'],
  };

  it('Provider API response must strictly match Consumer schema contract', () => {
    const mockApiResponse = {
      tenantId: 'ws-skyport-prod',
      activeUsers: 154,
      monthlyQuotaLimit: 100000,
      tier: 'ENTERPRISE',
    };

    expect(typeof mockApiResponse.tenantId).toBe(expectedContractSchema.tenantId);
    expect(typeof mockApiResponse.activeUsers).toBe(expectedContractSchema.activeUsers);
    expect(typeof mockApiResponse.monthlyQuotaLimit).toBe(expectedContractSchema.monthlyQuotaLimit);
    expect(expectedContractSchema.tier).toContain(mockApiResponse.tier);
  });
});
