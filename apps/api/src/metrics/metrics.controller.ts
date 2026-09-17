import { Controller, Get, Param, Headers, NotFoundException, ForbiddenException, Inject } from '@nestjs/common';
import { DatabaseService } from '../database.service';
import { TenantCacheService } from '../cache/tenant-cache.service';
import { UsageMetrics } from '@repo/types';

@Controller('metrics')
export class MetricsController {
  constructor(
    @Inject(DatabaseService) private readonly db: DatabaseService,
    @Inject(TenantCacheService) private readonly cache: TenantCacheService
  ) {}

  @Get(':slug')
  async getMetrics(@Param('slug') slug: string, @Headers('x-user-email') userEmail?: string): Promise<UsageMetrics & { isCached?: boolean }> {
    const email = userEmail || 'owner@skyport.io';
    const user = this.db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) throw new ForbiddenException('User context invalid');

    const workspace = this.db.workspaces.find((w) => w.slug === slug);
    if (!workspace) throw new NotFoundException('Workspace not found');

    const membership = this.db.members.find((m) => m.workspaceId === workspace.id && m.userId === user.id);
    if (!membership) throw new ForbiddenException('Access denied to workspace metrics');

    const cacheKey = 'metrics:summary';
    const cachedMetrics = await this.cache.get<UsageMetrics>(workspace.id, cacheKey);
    if (cachedMetrics) {
      return {
        ...cachedMetrics,
        isCached: true,
      };
    }

    const freshMetrics = this.db.getWorkspaceMetrics(workspace.id);
    await this.cache.set(workspace.id, cacheKey, freshMetrics, 60000);

    return {
      ...freshMetrics,
      isCached: false,
    };
  }
}

