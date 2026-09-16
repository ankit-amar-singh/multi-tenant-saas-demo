import { describe, it, expect, beforeEach } from 'vitest';
import { WorkspacesController } from './workspaces.controller';
import { DatabaseService } from '../database.service';

describe('WorkspacesController', () => {
  let controller: WorkspacesController;
  let db: DatabaseService;

  beforeEach(() => {
    db = new DatabaseService();
    controller = new WorkspacesController(db);
  });

  it('should list workspaces for user', () => {
    const result = controller.listWorkspaces('owner@skyport.io');
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]?.workspace.ownerId).toBe('usr-1');
  });

  it('should create a new workspace and log audit entry', () => {
    const initialLogCount = db.auditLogs.length;
    const res = controller.createWorkspace(
      { name: 'Test Corp', slug: 'test-corp' },
      'owner@skyport.io'
    );

    expect(res.workspace.slug).toBe('test-corp');
    expect(res.role).toBe('OWNER');
    expect(db.auditLogs.length).toBe(initialLogCount + 1);
  });

  it('should enforce RBAC when inviting members', () => {
    expect(() =>
      controller.inviteMember(
        'acme-global',
        { email: 'guest@skyport.io', role: 'MEMBER' },
        'member@skyport.io' // Member cannot invite
      )
    ).toThrowError(/Insufficient permissions/);
  });
});
