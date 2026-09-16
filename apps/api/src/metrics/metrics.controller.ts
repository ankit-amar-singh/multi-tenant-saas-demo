import { Controller, Get, Param, Headers, NotFoundException, ForbiddenException, Inject } from '@nestjs/common';
import { DatabaseService } from '../database.service';

@Controller('metrics')
export class MetricsController {
  constructor(@Inject(DatabaseService) private readonly db: DatabaseService) {}

  @Get(':slug')
  getMetrics(@Param('slug') slug: string, @Headers('x-user-email') userEmail?: string) {
    const email = userEmail || 'owner@skyport.io';
    const user = this.db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) throw new ForbiddenException('User context invalid');

    const workspace = this.db.workspaces.find((w) => w.slug === slug);
    if (!workspace) throw new NotFoundException('Workspace not found');

    const membership = this.db.members.find((m) => m.workspaceId === workspace.id && m.userId === user.id);
    if (!membership) throw new ForbiddenException('Access denied to workspace metrics');

    return this.db.getWorkspaceMetrics(workspace.id);
  }
}
