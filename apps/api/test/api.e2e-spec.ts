import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';

describe('Multi-Tenant SaaS API (E2E Integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('POST /auth/login - authenticates seed owner user and returns workspaces', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'owner@skyport.io' })
      .expect(201);

    expect(res.body.user.email).toBe('owner@skyport.io');
    expect(res.body.workspaces.length).toBeGreaterThan(0);
    expect(res.body.accessToken).toBeDefined();
  });

  it('GET /workspaces - returns user tenant list', async () => {
    const res = await request(app.getHttpServer())
      .get('/workspaces')
      .set('x-user-email', 'owner@skyport.io')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].workspace.slug).toBe('acme-global');
  });

  it('GET /workspaces/:slug/members - retrieves members with RBAC permission', async () => {
    const res = await request(app.getHttpServer())
      .get('/workspaces/acme-global/members')
      .set('x-user-email', 'owner@skyport.io')
      .expect(200);

    expect(res.body.length).toBe(3);
  });

  it('POST /workspaces/:slug/members/invite - rejects invitation attempt from MEMBER role (RBAC assertion)', async () => {
    await request(app.getHttpServer())
      .post('/workspaces/acme-global/members/invite')
      .set('x-user-email', 'member@skyport.io')
      .send({ email: 'newdev@skyport.io', role: 'MEMBER' })
      .expect(403);
  });

  it('GET /metrics/:slug - calculates usage metrics & quota percentage', async () => {
    const res = await request(app.getHttpServer())
      .get('/metrics/acme-global')
      .set('x-user-email', 'owner@skyport.io')
      .expect(200);

    expect(res.body.monthlyQuotaPercent).toBeDefined();
    expect(res.body.activeUsersCount).toBe(3);
  });
});
