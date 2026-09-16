import { AuthResponse, CreateWorkspaceDto, InviteMemberDto, UpdateWorkspaceDto } from '@repo/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export class ApiClient {
  private static getHeaders(userEmail?: string): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (userEmail) {
      headers['x-user-email'] = userEmail;
    }
    return headers;
  }

  public static async login(email: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ email }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Login failed' }));
      throw new Error(err.message || 'Login failed');
    }
    return res.json();
  }

  public static async getWorkspaces(userEmail: string) {
    const res = await fetch(`${API_BASE_URL}/workspaces`, {
      headers: this.getHeaders(userEmail),
    });
    if (!res.ok) throw new Error('Failed to fetch workspaces');
    return res.json();
  }

  public static async getWorkspaceBySlug(slug: string, userEmail: string) {
    const res = await fetch(`${API_BASE_URL}/workspaces/${slug}`, {
      headers: this.getHeaders(userEmail),
    });
    if (!res.ok) throw new Error('Failed to fetch workspace details');
    return res.json();
  }

  public static async createWorkspace(dto: CreateWorkspaceDto, userEmail: string) {
    const res = await fetch(`${API_BASE_URL}/workspaces`, {
      method: 'POST',
      headers: this.getHeaders(userEmail),
      body: JSON.stringify(dto),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to create workspace');
    }
    return res.json();
  }

  public static async getMembers(slug: string, userEmail: string) {
    const res = await fetch(`${API_BASE_URL}/workspaces/${slug}/members`, {
      headers: this.getHeaders(userEmail),
    });
    if (!res.ok) throw new Error('Failed to fetch members');
    return res.json();
  }

  public static async inviteMember(slug: string, dto: InviteMemberDto, userEmail: string) {
    const res = await fetch(`${API_BASE_URL}/workspaces/${slug}/members/invite`, {
      method: 'POST',
      headers: this.getHeaders(userEmail),
      body: JSON.stringify(dto),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to invite member');
    }
    return res.json();
  }

  public static async updateWorkspace(slug: string, dto: UpdateWorkspaceDto, userEmail: string) {
    const res = await fetch(`${API_BASE_URL}/workspaces/${slug}`, {
      method: 'PUT',
      headers: this.getHeaders(userEmail),
      body: JSON.stringify(dto),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to update workspace');
    }
    return res.json();
  }

  public static async getMetrics(slug: string, userEmail: string) {
    const res = await fetch(`${API_BASE_URL}/metrics/${slug}`, {
      headers: this.getHeaders(userEmail),
    });
    if (!res.ok) throw new Error('Failed to fetch metrics');
    return res.json();
  }

  public static async getAuditLogs(slug: string, userEmail: string) {
    const res = await fetch(`${API_BASE_URL}/audit-logs/${slug}`, {
      headers: this.getHeaders(userEmail),
    });
    if (!res.ok) throw new Error('Failed to fetch audit logs');
    return res.json();
  }
}
