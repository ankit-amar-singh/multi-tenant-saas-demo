import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';

describe('Multi-Tenant Caching Architecture (E2E Integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('GET /metrics/:slug - first request misses cache (isCached: false), second request hits cache (isCached: true)', async () => {
    // Request 1: Fresh calculation (cache miss)
    const res1 = await request(app.getHttpServer())
      .get('/metrics/acme-global')
      .set('x-user-email', 'owner@skyport.io')
      .expect(200);

    expect(res1.body.workspaceId).toBe('ws-1');
    expect(res1.body.isCached).toBe(false);

    // Request 2: Cached response (cache hit)
    const res2 = await request(app.getHttpServer())
      .get('/metrics/acme-global')
      .set('x-user-email', 'owner@skyport.io')
      .expect(200);

    expect(res2.body.workspaceId).toBe('ws-1');
    expect(res2.body.isCached).toBe(true);
  });

  it('GET /metrics/:slug - maintains tenant isolation between Acme Global and Stark Labs', async () => {
    const acmeRes = await request(app.getHttpServer())
      .get('/metrics/acme-global')
      .set('x-user-email', 'owner@skyport.io')
      .expect(200);

    const starkRes = await request(app.getHttpServer())
      .get('/metrics/stark-labs')
      .set('x-user-email', 'owner@skyport.io')
      .expect(200);

    expect(acmeRes.body.workspaceId).toBe('ws-1');
    expect(starkRes.body.workspaceId).toBe('ws-2');
    expect(acmeRes.body.activeUsersCount).toBe(3);
    expect(starkRes.body.activeUsersCount).toBe(1);
  });
});
