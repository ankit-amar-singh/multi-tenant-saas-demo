import { Module } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { AuthController } from './auth/auth.controller';
import { WorkspacesController } from './workspaces/workspaces.controller';
import { MetricsController } from './metrics/metrics.controller';
import { AuditController } from './audit/audit.controller';
import { TenantCacheModule } from './cache/tenant-cache.module';

@Module({
  imports: [TenantCacheModule],
  controllers: [AuthController, WorkspacesController, MetricsController, AuditController],
  providers: [DatabaseService],
})
export class AppModule {}

