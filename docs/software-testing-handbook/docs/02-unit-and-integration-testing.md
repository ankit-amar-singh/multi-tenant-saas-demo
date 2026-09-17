# ⚡ Chapter 2: Unit & Integration Testing Strategy

## 1. Overview & Fundamentals

Unit and Integration testing form the core foundation of developer velocity. Unit tests verify pure functions, state machines, and business domain logic in total isolation. Integration tests verify interactions between code modules, ORM database layers, HTTP controllers, and middleware authorization guards.

---

## 2. Test Doubles Taxonomy: Mocks vs. Spies vs. Stubs vs. Fakes

Understanding test doubles prevents brittle test suites and over-mocking.

```
                  ┌────────────────────────┐
                  │      Test Double       │
                  └───────────┬────────────┘
                              │
       ┌──────────────┬───────┴──────┬──────────────┐
       ▼              ▼              ▼              ▼
  ┌────────┐     ┌────────┐     ┌────────┐     ┌────────┐
  │ Dummy  │     │  Stub  │     │  Spy   │     │  Fake  │
  └────────┘     └────────┘     └────────┘     └────────┘
```

| Double Type | Definition | Example Use Case | Vitest/Jest Equivalent |
| :--- | :--- | :--- | :--- |
| **Dummy** | Objects passed around but never actually used. | Required parameter in constructor not under test. | `{}` or `null as any` |
| **Stub** | Provides canned answers to calls made during test. | Returning a fixed user profile object from DB call. | `vi.fn().mockReturnValue(userData)` |
| **Spy** | Wraps real methods and records invocation arguments/counts. | Asserting that audit logger was invoked with IP & userId. | `vi.spyOn(auditLogger, 'logAction')` |
| **Fake** | Working implementation with a shortcut (not production ready). | In-memory database or fake email transport service. | `InMemoryWorkspaceRepository` |
| **Mock** | Pre-programmed with expectations of calls it should receive. | Express response object expecting `.status(403)`. | `vi.mock('./audit.service')` |

---

## 3. NestJS Integration Testing with Supertest

In NestJS architectures (like [`apps/api`](file:///home/empkhets0/Documents/Ankit/multi-tenant-saas-demo/README.md)), integration tests execute full HTTP requests against `TestingModule` instances without needing a live network port binding.

### Architecture Flow

```mermaid
sequenceDiagram
    participant TestRunner as Vitest / Supertest
    participant NestApp as NestJS TestingModule
    participant Guard as CASL RBAC Guard
    participant Controller as WorkspaceController
    participant DB as Prisma In-Memory / PostgreSQL

    TestRunner->>NestApp: POST /api/workspaces (x-workspace-id, Bearer JWT)
    NestApp->>Guard: Validate User Role & Tenant Scope
    alt Unauthorized Role (e.g. MEMBER trying to delete)
        Guard-->>TestRunner: HTTP 403 Forbidden
    else Authorized Role (OWNER)
        Guard->>Controller: Route Execution
        Controller->>DB: Prisma Query
        DB-->>Controller: Created Entity
        Controller-->>TestRunner: HTTP 201 Created (JSON Payload)
    end
```

### Code Example: NestJS Controller Integration Test

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Workspace API Integration Suite', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should enforce 403 Forbidden when MEMBER attempts to update tenant tier', async () => {
    const response = await request(app.getHttpServer())
      .patch('/api/workspaces/ws-100/tier')
      .set('Authorization', 'Bearer mock-member-jwt-token')
      .set('x-workspace-id', 'ws-100')
      .send({ tier: 'ENTERPRISE' });

    expect(response.status).toBe(HttpStatus.FORBIDDEN);
    expect(response.body.message).toContain('Insufficient RBAC permissions');
  });

  it('should allow OWNER to update tenant tier and record audit log', async () => {
    const response = await request(app.getHttpServer())
      .patch('/api/workspaces/ws-100/tier')
      .set('Authorization', 'Bearer mock-owner-jwt-token')
      .set('x-workspace-id', 'ws-100')
      .send({ tier: 'ENTERPRISE' });

    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body.tier).toBe('ENTERPRISE');
  });
});
```

---

## 4. Vitest vs. Jest Architecture Benchmark

| Feature / Metric | Vitest | Jest |
| :--- | :--- | :--- |
| **Transformation Engine** | Vite / Esbuild (Native ESM, TypeScript native) | Babel / ts-jest (CommonJS transpilation) |
| **Cold Start Performance** | ⚡ **~200ms - 500ms** | 🐢 **2.5s - 6.0s** |
| **Watch Mode Re-run** | Instant HMR dependency graph resolution | Re-parses abstract syntax trees |
| **Monorepo Compatibility** | Native Turborepo / pnpm workspace integration | Requires custom `moduleNameMapper` configs |
| **In-Studio Debugging** | Built-in UI web runner (`vitest --ui`) | Requires third-party plugins |

---

## 5. Best Practices for Deterministic Unit Tests

1. **AAA Pattern (Arrange-Act-Assert)**: Structure every test clearly into setup, execution, and verification steps.
2. **Avoid Shared State**: Never rely on test execution order. Reset all mocks and in-memory databases in `beforeEach()`.
3. **Assert Behavior, Not Implementation Details**: Test inputs and outputs rather than internal private method variables.
