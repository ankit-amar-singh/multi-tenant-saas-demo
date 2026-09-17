import { describe, it, expect, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { TenantCacheService } from './tenant-cache.service';
import { TenantCacheModule } from './tenant-cache.module';

describe('TenantCacheService', () => {
  let service: TenantCacheService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TenantCacheModule],
    }).compile();

    service = module.get<TenantCacheService>(TenantCacheService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should construct key with tenant prefix', () => {
    const key = service.buildKey('ws-100', 'user:profile');
    expect(key).toBe('tenant:ws-100:user:profile');
  });

  it('should throw error if workspaceId is missing in buildKey', () => {
    expect(() => service.buildKey('', 'key')).toThrowError('TenantCacheService: workspaceId/tenantId is required');
  });

  it('should set and get cached item under tenant key', async () => {
    const tenantId = 'ws-acme';
    const key = 'dashboard:stats';
    const payload = { activeUsers: 42, revenue: 10000 };

    await service.set(tenantId, key, payload, 10000);
    const result = await service.get<typeof payload>(tenantId, key);

    expect(result).toEqual(payload);
  });

  it('should maintain isolation between different tenants for the same key', async () => {
    const key = 'config';
    await service.set('tenant-A', key, { theme: 'dark' });
    await service.set('tenant-B', key, { theme: 'light' });

    const resA = await service.get<{ theme: string }>('tenant-A', key);
    const resB = await service.get<{ theme: string }>('tenant-B', key);

    expect(resA?.theme).toBe('dark');
    expect(resB?.theme).toBe('light');
  });

  it('should invalidate specific key for a tenant', async () => {
    const tenantId = 'ws-test';
    const key = 'metrics';

    await service.set(tenantId, key, { value: 123 });
    await service.invalidateKey(tenantId, key);
    const result = await service.get(tenantId, key);

    expect(result).toBeUndefined();
  });
});
