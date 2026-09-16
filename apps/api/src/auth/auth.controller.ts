import { Controller, Post, Body, UnauthorizedException, Get, Headers, Inject } from '@nestjs/common';
import { DatabaseService } from '../database.service';
import { AuthResponse, LoginDto } from '@repo/types';

@Controller('auth')
export class AuthController {
  constructor(@Inject(DatabaseService) private readonly db: DatabaseService) {}

  @Post('login')
  login(@Body() dto: LoginDto): AuthResponse {
    const email = dto.email?.toLowerCase().trim();
    const user = this.db.users.find((u) => u.email.toLowerCase() === email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials. Preset emails available: owner@skyport.io, admin@skyport.io, member@skyport.io');
    }

    const memberships = this.db.members.filter((m) => m.userId === user.id);
    const workspaceList = memberships.map((m) => {
      const workspace = this.db.workspaces.find((w) => w.id === m.workspaceId)!;
      return { workspace, role: m.role };
    });

    const fakeJwtToken = `mock-jwt-token-${user.id}-${Date.now()}`;

    return {
      accessToken: fakeJwtToken,
      user,
      workspaces: workspaceList,
    };
  }

  @Post('register')
  register(@Body() body: { email: string; name: string }): AuthResponse {
    const existing = this.db.users.find((u) => u.email.toLowerCase() === body.email.toLowerCase().trim());
    if (existing) {
      throw new UnauthorizedException('User with this email already exists');
    }

    const newUser = {
      id: `usr-${Date.now()}`,
      email: body.email.trim(),
      name: body.name.trim(),
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
      createdAt: new Date().toISOString(),
    };
    this.db.users.push(newUser);

    // Create default personal workspace
    const newWs = {
      id: `ws-${Date.now()}`,
      name: `${body.name}'s Workspace`,
      slug: `${body.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-ws`,
      tier: 'FREE' as const,
      ownerId: newUser.id,
      createdAt: new Date().toISOString(),
    };
    this.db.workspaces.push(newWs);

    const membership = {
      id: `wm-${Date.now()}`,
      workspaceId: newWs.id,
      userId: newUser.id,
      user: newUser,
      role: 'OWNER' as const,
      joinedAt: new Date().toISOString(),
    };
    this.db.members.push(membership);

    return {
      accessToken: `mock-jwt-token-${newUser.id}-${Date.now()}`,
      user: newUser,
      workspaces: [{ workspace: newWs, role: 'OWNER' }],
    };
  }
}
