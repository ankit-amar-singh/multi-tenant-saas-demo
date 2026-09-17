# 02. Release Planning & Deployment Patterns

A comprehensive operational manual for software versioning schemes, release planning workflows, progressive delivery patterns, and feature management.

---

## 🗺️ Versioning Architectures

Establishing a deterministic versioning taxonomy is critical for software dependencies, API contracts, deployment tracking, and customer communication.

```
                         ┌──────────────────────────────────────┐
                         │       Software Versioning Taxonomy   │
                         └──────────────────┬───────────────────┘
                                            │
               ┌────────────────────────────┴────────────────────────────┐
               ▼                                                         ▼
    ┌──────────────────────┐                                  ┌──────────────────────┐
    │  Semantic Versioning │                                  │  Calendar Versioning │
    │    (SemVer 2.0.0)    │                                  │       (CalVer)       │
    └──────────┬───────────┘                                  └──────────┬───────────┘
               │                                                         │
               ├── MAJOR: Breaking changes                               ├── YYYY.MM.MICRO (e.g., 2026.09.1)
               ├── MINOR: Backward-compatible features                   ├── Used by Ubuntu, Datadog, PyTorch
               └── PATCH: Backward-compatible fixes                      └── High-velocity time-driven releases
```

### 1. Semantic Versioning (SemVer 2.0.0)
Format: `MAJOR.MINOR.PATCH[-PRERELEASE][+BUILDMETADATA]` (e.g., `v2.4.1-rc.2+sha.8f9b2c3`)

- **MAJOR (2.x.x)**: Incremented when making incompatible API changes, removing endpoints, or breaking database schemas.
- **MINOR (x.4.x)**: Incremented when adding functionality in a backward-compatible manner.
- **PATCH (x.x.1)**: Incremented when making backward-compatible bug fixes or security patches.
- **Prerelease Tags (`-rc.1`, `-alpha.3`)**: Denotes build candidates prior to General Availability (GA).
- **Build Metadata (`+sha.8f9b2c3`, `+build.1042`)**: Informational metadata that does not affect version precedence.

### 2. Calendar Versioning (CalVer)
Format: `YYYY.MM.MICRO` or `YY.MINOR.MICRO` (e.g., `26.9.0`)

- Ideal for applications, CLI tools, and SaaS services released on a strict time-based schedule (e.g., monthly releases).
- Examples: Ubuntu (`24.04`), PyTorch (`2.2.0`), Terraform Provider releases.

---

## 🚀 Decoupling Deployment from Release

Modern software engineering separates **Deployment** from **Release**:

- **Deployment**: The technical act of installing a new build artifact or container onto production infrastructure.
- **Release**: The business/operational act of exposing new functionality to end users.

```
[Code Commit] ──► [CI Pipeline] ──► [Deploy Container to Prod] ──► [Feature Flag OFF] (Users see V1)
                                                                            │
                                                                  [Toggle Flag ON]
                                                                            │
                                                                            ▼
                                                                 (Users instantly see V2)
```

### Feature Flag Architecture (OpenFeature Standard)

Feature flags (toggles) allow code to be deployed to production in an inactive state and toggled on dynamically per tenant, user, or percentage rollout without requiring redeployments or restarts.

```typescript
// Production Feature Flag Evaluation Example using OpenFeature standard
import { OpenFeature } from '@openfeature/web-sdk';

const featureClient = OpenFeature.getClient();

async function renderCheckoutPage(userId: string, tenantId: string) {
  const context = { targetingKey: userId, tenantId };
  
  // Evaluate dynamic feature flag with default fallback
  const isNewPaymentGatewayEnabled = await featureClient.getBooleanValue(
    'enable-stripe-v2',
    false,
    context
  );

  if (isNewPaymentGatewayEnabled) {
    return <StripeV2CheckoutForm />;
  } else {
    return <LegacyCheckoutForm />;
  }
}
```

---

## 🔄 Progressive Delivery Patterns

Progressive delivery expands on Continuous Delivery by combining dynamic traffic control, real-time observability metrics, and automated canary analysis.

### 1. Canary Deployment Architecture

Canary deployment routes a tiny fraction of live user traffic (e.g., 2% -> 10% -> 50% -> 100%) to a new release version while monitoring key golden signals (HTTP 5xx rate, latency p99, CPU utilization). If metrics breach acceptable SLO thresholds, traffic instantly reverts back to the stable version.

```
                              ┌────────────────────────┐
                              │  Ingress / API Gateway │
                              └───────────┬────────────┘
                                          │
                         ┌────────────────┴────────────────┐
                         │   Traffic Splitter (95% / 5%)   │
                         └────────┬───────────────┬────────┘
                                  │               │
                            (95% Traffic)    (5% Canary Traffic)
                                  │               │
                                  ▼               ▼
                           ┌──────────────┐┌──────────────┐
                           │ v1.4.0 Stable││ v1.5.0 Canary│
                           └──────────────┘└──────┬───────┘
                                                  │
                                         [Prometheus Monitor]
                                         - Error Rate < 0.1%?
                                         - Latency p99 < 150ms?
                                         ├── PASS: Increase to 20%
                                         └── FAIL: Immediate 0% Rollback
```

#### Argo Rollouts Canary Specification Blueprint
```yaml
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: api-service-rollout
spec:
  replicas: 10
  strategy:
    canary:
      analysis:
        templates:
          - templateName: success-rate-prometheus-check
        args:
          - name: service-name
            value: api-service
      steps:
        - setWeight: 5
        - pause: { duration: 10m } # Hold 5% traffic for 10 minutes to observe metrics
        - setWeight: 20
        - pause: { duration: 30m }
        - setWeight: 50
        - pause: { duration: 1h }
```

---

### 2. Blue/Green Deployment Pattern

Blue/Green deployment maintains two identical, isolated production environments:
- **Blue (Active)**: Currently serving 100% of production user traffic.
- **Green (Idle/Staging)**: Deployed with the new release candidate, tested thoroughly via synthetic health probes.

Once verified, the load balancer cutover updates the routing target from Blue to Green in milliseconds.

```
                      ┌────────────────────────────────┐
                      │    Load Balancer / Ingress     │
                      └───────────────┬────────────────┘
                                      │
                        (Cutover via Router Config)
                                  /       \
                                 /         \
                         (Current 100%)    (New Build)
                               /             \
                              ▼               ▼
                      ┌──────────────┐ ┌──────────────┐
                      │  Blue Stack  │ │  Green Stack │
                      │   (v1.0.0)   │ │   (v1.1.0)   │
                      └──────────────┘ └──────────────┘
```

#### Comparison of Deployment Strategies

| Deployment Strategy | Downtime Risk | Infrastructure Cost | Rollback Speed | Traffic Control |
| :--- | :--- | :--- | :--- | :--- |
| **Rolling Update** | Low | Low (Shares existing cluster capacity) | Slow (Sequential pod replacement) | Pod count granularity |
| **Blue/Green** | Zero | High (Requires 2x infrastructure during deploy) | Instant (Router switch) | All-or-nothing (0% or 100%) |
| **Canary Deployment** | Minimal | Medium (Small canary overhead) | Automated & Fast | Precise percentage weighting |
| **Shadow / Dark** | Zero | High (Duplicate requests sent to secondary) | N/A (Users unaffected) | Mirroring traffic payload |

---

## 🏢 Multi-Tenant SaaS Ring Deployment Model

In enterprise multi-tenant SaaS environments, releases proceed through sequential **Deployment Rings** to minimize blast radius across tenant organizations:

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│     Ring 0      │────►│     Ring 1      │────►│     Ring 2      │────►│     Ring 3      │
│ Internal Staff  │     │ Beta/Early      │     │ Standard        │     │ Enterprise/LTS  │
│ (Canary Tenants)│     │ Adopters        │     │ Tenants         │     │ Tenants         │
└─────────────────┘     └─────────────────┘     └─────────────────┘     └─────────────────┘
    [Hold 24 Hours]         [Hold 48 Hours]         [Standard Rollout]       [Scheduled Window]
```

1. **Ring 0 (Internal)**: Deployed automatically to internal company tenants and staging test suites. Held for 24 hours.
2. **Ring 1 (Opt-in / Early Access)**: Non-critical tenants who opt in for early features. Held for 48 hours.
3. **Ring 2 (Standard Tenants)**: Standard commercial tenants rolled out in progressive batches.
4. **Ring 3 (Mission-Critical / Regulated Tenants)**: Deployed during customer-specified maintenance windows with strict SLA guarantees.
