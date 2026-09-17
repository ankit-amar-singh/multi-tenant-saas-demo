/**
 * Level 5 Database Caching: Prisma Client Extension Interceptor
 * Caches static metadata and repetitive read queries at the ORM abstraction boundary.
 */

export interface CacheOptions {
  ttlMs?: number;
}

export function createPrismaCacheExtension() {
  const inMemoryQueryCache = new Map<string, { data: any; expiresAt: number }>();

  return {
    name: 'prisma-query-cache',
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }: any) {
          // Only intercept read queries (findUnique, findFirst, findMany)
          const isReadOperation = ['findUnique', 'findFirst', 'findMany'].includes(operation);
          
          if (!isReadOperation) {
            return query(args);
          }

          const cacheKey = `${model}:${operation}:${JSON.stringify(args)}`;
          const cached = inMemoryQueryCache.get(cacheKey);
          const now = Date.now();

          if (cached && cached.expiresAt > now) {
            return cached.data;
          }

          const result = await query(args);

          // Cache query result with 30s TTL
          inMemoryQueryCache.set(cacheKey, {
            data: result,
            expiresAt: now + 30000,
          });

          return result;
        },
      },
    },
  };
}
