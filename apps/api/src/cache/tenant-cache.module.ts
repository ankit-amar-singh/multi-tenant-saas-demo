import { Module, Global } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { TenantCacheService } from './tenant-cache.service';

@Global()
@Module({
  imports: [
    CacheModule.register({
      ttl: 60 * 1000, // Default TTL 60 seconds
      max: 1000,      // Maximum number of items in in-memory LRU cache
      isGlobal: true,
    }),
  ],
  providers: [TenantCacheService],
  exports: [TenantCacheService, CacheModule],
})
export class TenantCacheModule {}
