/**
 * Runnable Grafana k6 Load Testing Script Example
 * Location: docs/software-testing-handbook/examples/load-k6/tenant-metrics-load.js
 * Run command: k6 run docs/software-testing-handbook/examples/load-k6/tenant-metrics-load.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '15s', target: 20 },  // Ramp-up to 20 VUs
    { duration: '30s', target: 100 }, // Sustained load at 100 VUs
    { duration: '15s', target: 0 },   // Ramp-down
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'],    // <1% errors allowed
    http_req_duration: ['p(95)<200'],  // 95% of requests under 200ms
    http_req_duration: ['p(99)<500'],  // 99% of requests under 500ms
  },
};

const BASE_URL = __ENV.API_URL || 'http://localhost:3001';

export default function () {
  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer mock-owner-jwt-token',
      'x-workspace-id': 'ws-skyport-demo',
    },
  };

  const res = http.get(`${BASE_URL}/api/metrics`, params);

  check(res, {
    'status is 200 OK': (r) => r.status === 200,
    'latency is under 200ms': (r) => r.timings.duration < 200,
  });

  sleep(0.5);
}
