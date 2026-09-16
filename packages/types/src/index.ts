export type WorkspaceRole = 'OWNER' | 'ADMIN' | 'MEMBER';

export type SubscriptionTier = 'FREE' | 'PRO' | 'ENTERPRISE';

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  tier: SubscriptionTier;
  ownerId: string;
  logoUrl?: string;
  createdAt: string;
}

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  user: User;
  role: WorkspaceRole;
  joinedAt: string;
}

export interface AuditLogEntry {
  id: string;
  workspaceId: string;
  actorEmail: string;
  actorName: string;
  action: string;
  resource: string;
  ipAddress: string;
  timestamp: string;
}

export interface UsageMetrics {
  workspaceId: string;
  activeUsersCount: number;
  maxUsersQuota: number;
  apiRequestsToday: number;
  apiRequestsLimit: number;
  storageUsedMb: number;
  storageLimitMb: number;
  monthlyQuotaPercent: number;
  lastUpdated: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
  workspaces: {
    workspace: Workspace;
    role: WorkspaceRole;
  }[];
}

export interface CreateWorkspaceDto {
  name: string;
  slug: string;
}

export interface UpdateWorkspaceDto {
  name?: string;
  tier?: SubscriptionTier;
}

export interface InviteMemberDto {
  email: string;
  role: WorkspaceRole;
}

export interface LoginDto {
  email: string;
  password?: string;
}
