import { Controller, Get, Post, Put, Delete, Param, Body, Headers, ForbiddenException, NotFoundException, Inject } from '@nestjs/common';
import { DatabaseService } from '../database.service';
import { CreateWorkspaceDto, InviteMemberDto, UpdateWorkspaceDto, WorkspaceRole } from '@repo/types';

@Controller('workspaces')
export class WorkspacesController {
  constructor(@Inject(DatabaseService) private readonly db: DatabaseService) {}

  private extractActor(userEmailHeader?: string) {
    const email = userEmailHeader || 'owner@skyport.io';
    const user = this.db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) throw new ForbiddenException('User context invalid');
    return user;
  }

  private checkRole(workspaceId: string, userId: string, allowedRoles: WorkspaceRole[]) {
    const membership = this.db.members.find((m) => m.workspaceId === workspaceId && m.userId === userId);
    if (!membership || !allowedRoles.includes(membership.role)) {
      throw new ForbiddenException(`Insufficient permissions. Required role: ${allowedRoles.join(' or ')}`);
    }
    return membership;
  }

  @Get()
  listWorkspaces(@Headers('x-user-email') userEmail?: string) {
    const user = this.extractActor(userEmail);
    const userMemberships = this.db.members.filter((m) => m.userId === user.id);
    return userMemberships.map((m) => {
      const workspace = this.db.workspaces.find((w) => w.id === m.workspaceId)!;
      return { workspace, role: m.role };
    });
  }

  @Post()
  createWorkspace(@Body() dto: CreateWorkspaceDto, @Headers('x-user-email') userEmail?: string) {
    const user = this.extractActor(userEmail);
    const slug = dto.slug.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const existing = this.db.workspaces.find((w) => w.slug === slug);

    if (existing) {
      throw new ForbiddenException(`Workspace slug '${slug}' is already taken`);
    }

    const newWs = {
      id: `ws-${Date.now()}`,
      name: dto.name,
      slug,
      tier: 'FREE' as const,
      ownerId: user.id,
      createdAt: new Date().toISOString(),
    };
    this.db.workspaces.push(newWs);

    const membership = {
      id: `wm-${Date.now()}`,
      workspaceId: newWs.id,
      userId: user.id,
      user,
      role: 'OWNER' as const,
      joinedAt: new Date().toISOString(),
    };
    this.db.members.push(membership);

    this.db.logAudit(newWs.id, user.email, user.name, 'WORKSPACE_CREATED', `Workspace '${newWs.name}' created`);

    return { workspace: newWs, role: 'OWNER' };
  }

  @Get(':slug')
  getWorkspaceBySlug(@Param('slug') slug: string, @Headers('x-user-email') userEmail?: string) {
    const user = this.extractActor(userEmail);
    const workspace = this.db.workspaces.find((w) => w.slug === slug);
    if (!workspace) throw new NotFoundException('Workspace not found');

    const membership = this.db.members.find((m) => m.workspaceId === workspace.id && m.userId === user.id);
    if (!membership) throw new ForbiddenException('Access denied to this workspace');

    return { workspace, role: membership.role };
  }

  @Get(':slug/members')
  getMembers(@Param('slug') slug: string, @Headers('x-user-email') userEmail?: string) {
    const user = this.extractActor(userEmail);
    const workspace = this.db.workspaces.find((w) => w.slug === slug);
    if (!workspace) throw new NotFoundException('Workspace not found');

    this.checkRole(workspace.id, user.id, ['OWNER', 'ADMIN', 'MEMBER']);
    return this.db.members.filter((m) => m.workspaceId === workspace.id);
  }

  @Post(':slug/members/invite')
  inviteMember(@Param('slug') slug: string, @Body() dto: InviteMemberDto, @Headers('x-user-email') userEmail?: string) {
    const user = this.extractActor(userEmail);
    const workspace = this.db.workspaces.find((w) => w.slug === slug);
    if (!workspace) throw new NotFoundException('Workspace not found');

    // CASL / RBAC Check: Only OWNER or ADMIN can invite
    this.checkRole(workspace.id, user.id, ['OWNER', 'ADMIN']);

    let targetUser = this.db.users.find((u) => u.email.toLowerCase() === dto.email.toLowerCase().trim());
    if (!targetUser) {
      const email = dto.email.trim();
      const userName = email.split('@')[0] || email;
      targetUser = {
        id: `usr-${Date.now()}`,
        email,
        name: userName,
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
        createdAt: new Date().toISOString(),
      };
      this.db.users.push(targetUser);
    }

    const existingMember = this.db.members.find((m) => m.workspaceId === workspace.id && m.userId === targetUser.id);
    if (existingMember) {
      throw new ForbiddenException('User is already a member of this workspace');
    }

    const newMember = {
      id: `wm-${Date.now()}`,
      workspaceId: workspace.id,
      userId: targetUser.id,
      user: targetUser,
      role: dto.role || 'MEMBER',
      joinedAt: new Date().toISOString(),
    };
    this.db.members.push(newMember);

    this.db.logAudit(
      workspace.id,
      user.email,
      user.name,
      'MEMBER_INVITED',
      `Invited ${targetUser.email} as ${dto.role || 'MEMBER'}`
    );

    return newMember;
  }

  @Put(':slug')
  updateWorkspace(@Param('slug') slug: string, @Body() dto: UpdateWorkspaceDto, @Headers('x-user-email') userEmail?: string) {
    const user = this.extractActor(userEmail);
    const workspace = this.db.workspaces.find((w) => w.slug === slug);
    if (!workspace) throw new NotFoundException('Workspace not found');

    // Only OWNER can update workspace settings/tier
    this.checkRole(workspace.id, user.id, ['OWNER']);

    if (dto.name) workspace.name = dto.name;
    if (dto.tier) workspace.tier = dto.tier;

    this.db.logAudit(workspace.id, user.email, user.name, 'WORKSPACE_UPDATED', `Updated settings (Tier: ${workspace.tier})`);

    return workspace;
  }
}
