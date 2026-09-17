import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class TenantCacheService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {}

  /**
   * Constructs a strictly namespace-isolated cache key for multi-tenant protection.
   * Format: tenant:{workspaceId}:{key}
   */
  public buildKey(tenantId: string, key: string): string {
    if (!tenantId) {
      throw new Error('TenantCacheService: workspaceId/tenantId is required');
    }
    return `tenant:${tenantId}:${key}`;
  }

  /**
   * Retrieves a cached value for a specific tenant and key.
   */
  async get<T>(tenantId: string, key: string): Promise<T | undefined> {
    const fullKey = this.buildKey(tenantId, key);
    return await this.cacheManager.get<T>(fullKey);
  }

  /**
   * Stores a value in the cache bound strictly to a tenant context with optional TTL (in ms).
   */
  async set<T>(tenantId: string, key: string, value: T, ttlMs?: number): Promise<void> {
    const fullKey = this.buildKey(tenantId, key);
    await this.cacheManager.set(fullKey, value, ttlMs);
  }

  /**
   * Invalidates a specific key for a single tenant.
   */
  async invalidateKey(tenantId: string, key: string): Promise<void> {
    const fullKey = this.buildKey(tenantId, key);
    await this.cacheManager.del(fullKey);
  }

  /**
   * Invalidates all cache entries associated with a tenant workspace.
   */
  async invalidateTenant(tenantId: string): Promise<void> {
    const mgr = this.cacheManager as any;
    const store = mgr.store || mgr.stores?.[0];
    const prefix = `tenant:${tenantId}:`;

    if (store && typeof store.keys === 'function') {
      const keys: string[] = await store.keys(`${prefix}*`);
      for (const key of keys) {
        await this.cacheManager.del(key);
      }
    }
  }
}

