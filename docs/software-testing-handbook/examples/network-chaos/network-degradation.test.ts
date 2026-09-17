/**
 * Runnable Network Degradation & Resilience Test Example
 * Location: docs/software-testing-handbook/examples/network-chaos/network-degradation.test.ts
 */

import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { http, HttpResponse, delay } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Network Chaos & Resilience Verification', () => {
  it('Client Retry: Retries API request upon 2000ms latency timeout', async () => {
    let attempts = 0;

    server.use(
      http.get('http://localhost:3001/api/telemetry', async () => {
        attempts++;
        if (attempts === 1) {
          // Simulate network latency spike on first try
          await delay(2500);
          return HttpResponse.error();
        }
        return HttpResponse.json({ status: 'HEALTHY', metrics: [10, 20, 30] });
      })
    );

    // Simulated fetch call with 1000ms timeout & 1 retry
    let data;
    try {
      data = await fetchWithTimeoutAndRetry('http://localhost:3001/api/telemetry', 1000, 2);
    } catch (err) {
      // Fallback path
    }

    expect(attempts).toBe(2);
    expect(data.status).toBe('HEALTHY');
  });
});

async function fetchWithTimeoutAndRetry(url: string, timeoutMs: number, maxAttempts: number) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timer);
      if (res.ok) return await res.json();
    } catch (err) {
      if (i === maxAttempts - 1) throw err;
    }
  }
}
