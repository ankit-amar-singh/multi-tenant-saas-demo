import { Injectable } from '@nestjs/common';
import { User, Workspace, WorkspaceMember, AuditLogEntry, UsageMetrics, SubscriptionTier, WorkspaceRole } from '@repo/types';

@Injectable()
export class DatabaseService {
  public users: User[] = [
    {
      id: 'usr-1',
      email: 'owner@skyport.io',
      name: 'Ankit Kumar (Owner)',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
      createdAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'usr-2',
      email: 'admin@skyport.io',
      name: 'Sarah Connor (Admin)',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80',
      createdAt: '2026-01-02T00:00:00.000Z',
    },
    {
      id: 'usr-3',
      email: 'member@skyport.io',
      name: 'David Miller (Member)',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
      createdAt: '2026-01-03T00:00:00.000Z',
    },
  ];

  public workspaces: Workspace[] = [
    {
      id: 'ws-1',
      name: 'Acme Global Cloud',
      slug: 'acme-global',
      tier: 'ENTERPRISE',
      ownerId: 'usr-1',
      logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=250&q=80',
      createdAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'ws-2',
      name: 'Stark Industries',
      slug: 'stark-labs',
      tier: 'PRO',
      ownerId: 'usr-1',
      logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=250&q=80',
      createdAt: '2026-01-15T00:00:00.000Z',
    },
  ];

  public members: WorkspaceMember[] = [
    {
      id: 'wm-1',
      workspaceId: 'ws-1',
      userId: 'usr-1',
      user: this.users[0]!,
      role: 'OWNER',
      joinedAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'wm-2',
      workspaceId: 'ws-1',
      userId: 'usr-2',
      user: this.users[1]!,
      role: 'ADMIN',
      joinedAt: '2026-01-02T00:00:00.000Z',
    },
    {
      id: 'wm-3',
      workspaceId: 'ws-1',
      userId: 'usr-3',
      user: this.users[2]!,
      role: 'MEMBER',
      joinedAt: '2026-01-03T00:00:00.000Z',
    },
    {
      id: 'wm-4',
      workspaceId: 'ws-2',
      userId: 'usr-1',
      user: this.users[0]!,
      role: 'OWNER',
      joinedAt: '2026-01-15T00:00:00.000Z',
    },
  ];

  public auditLogs: AuditLogEntry[] = [
    {
      id: 'al-1',
      workspaceId: 'ws-1',
      actorEmail: 'owner@skyport.io',
      actorName: 'Ankit Kumar',
      action: 'WORKSPACE_CREATED',
      resource: 'Workspace: Acme Global Cloud',
      ipAddress: '192.168.1.100',
      timestamp: '2026-09-16T10:00:00.000Z',
    },
    {
      id: 'al-2',
      workspaceId: 'ws-1',
      actorEmail: 'owner@skyport.io',
      actorName: 'Ankit Kumar',
      action: 'MEMBER_INVITED',
      resource: 'User: admin@skyport.io (Role: ADMIN)',
      ipAddress: '192.168.1.100',
      timestamp: '2026-09-16T11:15:00.000Z',
    },
    {
      id: 'al-3',
      workspaceId: 'ws-1',
      actorEmail: 'admin@skyport.io',
      actorName: 'Sarah Connor',
      action: 'MEMBER_INVITED',
      resource: 'User: member@skyport.io (Role: MEMBER)',
      ipAddress: '10.0.4.12',
      timestamp: '2026-09-16T14:30:00.000Z',
    },
  ];

  public getWorkspaceMetrics(workspaceId: string): UsageMetrics {
    const wsMembers = this.members.filter((m) => m.workspaceId === workspaceId);
    const ws = this.workspaces.find((w) => w.id === workspaceId);
    const maxUsers = ws?.tier === 'ENTERPRISE' ? 100 : ws?.tier === 'PRO' ? 25 : 5;
    const apiLimit = ws?.tier === 'ENTERPRISE' ? 100000 : ws?.tier === 'PRO' ? 25000 : 5000;
    const storageLimit = ws?.tier === 'ENTERPRISE' ? 50000 : ws?.tier === 'PRO' ? 10000 : 2000;

    return {
      workspaceId,
      activeUsersCount: wsMembers.length,
      maxUsersQuota: maxUsers,
      apiRequestsToday: Math.floor(apiLimit * 0.42),
      apiRequestsLimit: apiLimit,
      storageUsedMb: Math.floor(storageLimit * 0.28),
      storageLimitMb: storageLimit,
      monthlyQuotaPercent: 42,
      lastUpdated: new Date().toISOString(),
    };
  }

  public logAudit(workspaceId: string, actorEmail: string, actorName: string, action: string, resource: string, ip = '127.0.0.1') {
    const entry: AuditLogEntry = {
      id: `al-${Date.now()}`,
      workspaceId,
      actorEmail,
      actorName,
      action,
      resource,
      ipAddress: ip,
      timestamp: new Date().toISOString(),
    };
    this.auditLogs.unshift(entry);
    return entry;
  }
}
