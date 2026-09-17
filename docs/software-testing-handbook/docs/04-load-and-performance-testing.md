# ⚡ Chapter 4: Load, Stress, & Performance Testing

## 1. Performance Testing Taxonomy

Performance testing evaluates system responsiveness, throughput, resource consumption, and stability under workload scenarios.

```
       Load Test                 Stress Test               Spike Test                Soak Test
  ┌─────────────────┐       ┌─────────────────┐       ┌──────┐                  ┌─────────────────┐
  │   Target SLA    │       │  Push to Break  │       │      │   Sudden Surge   │  Extended Run   │
  │   (Normal VU)   │       │   (Memory/CPU)  │       │      │   (Flash Sale)   │   (24-72 hrs)   │
  └─────────────────┘       └─────────────────┘       └──────┴─────────────────┘└─────────────────┘
```

| Performance Test Type | Primary Objective | Workload Pattern | Key Metric to Monitor |
| :--- | :--- | :--- | :--- |
| **Load Testing** | Validate response times meet SLAs under expected normal peak concurrency. | Constant or stepped Virtual Users (VUs) to target concurrency. | p95 & p99 Latency (ms), Error Rate (<0.1%). |
| **Stress Testing** | Identify system breaking point, graceful degradation, and failure modes. | Linearly increasing VUs until error threshold triggers. | CPU/RAM utilization saturation point, Connection pool exhaustion. |
| **Spike Testing** | Test recovery behavior during sudden extreme traffic surges. | Instantaneous 10x traffic burst for short duration. | Circuit breaker trips, Queue backpressure, Recovery time (MTTR). |
| **Soak (Endurance) Test** | Detect slow memory leaks, database connection leaks, or log disk fill-up. | Sustained moderate workload for 24-72 continuous hours. | Heap memory leak growth, GC pause times, Connection pool degradation. |

---

## 2. Setting Service Level Objectives (SLOs) & Percentiles

Averages (mean response time) mask severe tail latency issues. Performance testing relies on percentile latency metrics:

```
Response Time Distribution Curve
 ───────────────────────────────────────────────────────────► Latency (ms)
 │       80% Requests       │ 15% │  4%  │  1% Tail (p99)  │
 │      Fast (<50ms)        │     │ p95  │ Outliers (>1.5s)│
 └──────────────────────────┴─────┴──────┴─────────────────┘
```

### Standard SLA Thresholds

- **p50 (Median)**: `<50ms` (Optimal user experience).
- **p95 (95th Percentile)**: `<200ms` (95% of users experience response under 200ms).
- **p99 (99th Percentile)**: `<500ms` (Worst-case tail latency for heavy queries).
- **Error Rate Threshold**: `<0.01%` HTTP 5xx failures under SLA load.

---

## 3. Tooling Comparison: k6 vs. JMeter vs. Locust vs. Gatling

| Dimension | Grafana k6 | Apache JMeter | Locust | Gatling |
| :--- | :--- | :--- | :--- | :--- |
| **Core Engine** | Go runtime + JS VM | Java JVM | Python (Gevent) | Scala / Java / Kotlin |
| **Resource Efficiency** | ⚡ **Ultra High** (~10k VUs per node) | 🐢 Moderate (High thread memory overhead) | 🚀 High | ⚡ High (Netty non-blocking IO) |
| **Scripting Language** | JavaScript / TypeScript | GUI XML / Groovy | Pure Python | Scala / Java |
| **Protocol Support** | HTTP/1.1, HTTP/2, gRPC, WebSockets | HTTP, JDBC, FTP, SMTP, JMS | HTTP, Custom protocols | HTTP, WebSockets, gRPC |
| **CI/CD Automation** | Native CLI / Cloud / Prometheus exporter | Requires heavy CLI wrapper | CLI / Web UI | Native CLI / Maven |

---

## 4. Concrete k6 Load Script Implementation

The script below demonstrates a multi-stage load test script evaluating REST metrics APIs with strict threshold assertions.

```javascript
// load-k6/tenant-metrics-load.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 50 },  // Ramp-up to 50 virtual users
    { duration: '1m',  target: 200 }, // Sustained load at 200 VUs
    { duration: '30s', target: 500 }, // Spike test at 500 VUs
    { duration: '30s', target: 0 },   // Ramp-down
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'],    // Error rate must be less than 1%
    http_req_duration: ['p(95)<200'],  // 95% of requests must complete within 200ms
    http_req_duration: ['p(99)<500'],  // 99% of requests must complete within 500ms
  },
};

const BASE_URL = __ENV.API_URL || 'http://localhost:3001';

export default function () {
  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer mock-owner-jwt-token',
      'x-workspace-id': 'ws-skyport-prod',
    },
  };

  const res = http.get(`${BASE_URL}/api/metrics`, params);

  check(res, {
    'status is 200': (r) => r.status === 200,
    'has tenant metrics payload': (r) => r.json('tenantId') === 'ws-skyport-prod',
    'response time < 250ms': (r) => r.timings.duration < 250,
  });

  sleep(1);
}
```

---

## 5. System Observability during Load Tests

During load execution, monitor key infrastructure metrics via Prometheus & Grafana:

1. **CPU & Memory Utilization**: Ensure nodes do not cross 80% CPU saturation.
2. **Database Connection Pool**: Monitor active vs idle connections in PostgreSQL pool.
3. **Garbage Collection (GC) Pauses**: Ensure Node.js event loop lag remains `<10ms`.
