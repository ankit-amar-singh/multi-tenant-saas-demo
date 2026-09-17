# 03. Decision Framework: "What to Choose When"

A comprehensive selection framework, trade-off evaluation matrix, and domain-specific case strategies for Git branching and release patterns.

---

## 🧭 Interactive Selection Decision Tree

Use this decision tree to determine the optimal branching strategy and release pattern for your team and codebase.

```
Start Here: What type of software artifact are you building & deploying?
│
├──► [A] Cloud SaaS / Web APIs (Continuous Deployments)
│    │
│    ├── Does your team have >80% automated test coverage & Feature Flag infrastructure?
│    │    ├── YES ──► Recommended: TRUNK-BASED DEVELOPMENT + CANARY DEPLOYMENTS
│    │    └── NO  ──► Recommended: GITHUB FLOW + ROLLING / BLUE-GREEN DEPLOYMENTS
│    │
│    └── Do you enforce strict environment promotion gates (Dev -> Staging -> Prod)?
│         └── YES ──► Recommended: GITLAB FLOW (ENVIRONMENT BRANCHES)
│
├──► [B] Distributed Packages / Libraries / SDKs (Multiple Active Versions)
│    │
│    └── Must you support backports for older major/minor versions (LTS)?
│         └── YES ──► Recommended: RELEASE / MAINTENANCE BRANCHING (SEMVER 2.0)
│
└──► [C] Native Desktop, Mobile (iOS/Android), or On-Premise Enterprise Releases
     │
     └── Are releases scheduled in fixed sprint batches with formal QA freeze periods?
          ├── YES ──► Recommended: GITFLOW or RELEASE BRANCHING
          └── NO  ──► Recommended: TRUNK-BASED DEVELOPMENT + FEATURE FLAGS
```

---

## 📊 Comprehensive Trade-off Matrix

| Metric / Dimension | Trunk-Based Dev | GitHub Flow | GitLab Flow | GitFlow |
| :--- | :--- | :--- | :--- | :--- |
| **Team Size Fit** | 1 to 1000+ engineers | 1 to 50 engineers | 1 to 200 engineers | 5 to 50 engineers |
| **Deployment Frequency** | 10–100+ / day | Daily / On-Merge | Weekly / Monthly | Monthly / Quarterly |
| **Testing Overhead Required** | Extremely High (Automated) | High | Medium | High (Manual/Batched QA) |
| **Merge Friction** | Zero to Low | Low | Moderate | High (Merge debt) |
| **Feature Isolation Method** | Feature Flags / Toggles | Feature Branches | Feature/Env Branches | Git Feature Branches |
| **Rollback Complexity** | Low (Toggle Flag OFF) | Medium (Revert PR) | Medium (Redeploy tag) | High (Cherry-pick fixes) |
| **Compliance & Audit Overhead** | Automated via CI Policy | PR Approval tracking | Gate environment merges | Formal Release sign-off |

---

## 📂 Domain-Specific Case Strategies

### Case Strategy A: High-Velocity Cloud SaaS (50+ Deployments/Day)

#### Target Profile
Fast-paced SaaS companies, microservices architectures, continuous deployment culture, high automation maturity.

#### Architecture Blueprint
- **Branching Strategy**: Trunk-Based Development with short-lived feature branches (< 24 hours).
- **Versioning**: Semantic Versioning automated via Git commit SHAs and build timestamps (`v1.4.0+sha.a1b2c3d`).
- **Release Strategy**: Feature Flag Gating (OpenFeature / Unleash) combined with Automated Canary Deployments (Argo Rollouts).

#### Step-by-Step Execution Workflow
1. Engineers write small, incremental changes behind a feature flag.
2. PR created, automated tests pass, peer code review completed, merged to `main`.
3. CI automatically builds container artifact and updates GitOps target (ArgoCD).
4. Argo Rollouts deploys to 5% live traffic in production.
5. Prometheus monitors 5xx HTTP error rates and latency for 10 minutes.
6. Auto-promotes to 100% traffic if metrics remain green; auto-rolls back to 0% on anomaly.

---

### Case Strategy B: Regulated Enterprise, Banking & Healthcare

#### Target Profile
Financial institutions, health tech (HIPAA/FDA regulated), government defense software requiring strict segregation of duties, audit trails, and formal approval gates.

#### Architecture Blueprint
- **Branching Strategy**: GitFlow or Environment-Driven GitLab Flow.
- **Versioning**: Strict SemVer 2.0.0 with cryptographically signed release tags (GPG / Cosign / SLSA Level 3).
- **Release Strategy**: Blue/Green Deployment with mandatory Change Approval Board (CAB) sign-off.

#### Compliance & Security Controls
- **Dual Approval PR Enforcement**: Minimum of two senior reviewers required to merge into `develop` or `main`.
- **Signed Commits & Artifacts**: Every commit and container image must be signed via `cosign` and validated by Kyverno in Kubernetes before execution.
- **Audit Logging**: Immutable deployment logs pushed to secure SIEM (Elasticsearch / Splunk).

---

### Case Strategy C: Mobile Applications (iOS & Android)

#### Target Profile
Mobile app development teams subject to Apple App Store & Google Play Store review delays, un-upgradeable client instances, and fragmented user app versions.

#### Architecture Blueprint
- **Branching Strategy**: Release Branching off `main`.
- **Versioning**: Dual Versioning (Public Version `2.4.0` + Internal Build Number `10482`).
- **Release Strategy**: Phased Store Rollout (1% -> 5% -> 20% -> 100% over 7 days) paired with Remote Config / Feature Toggles.

#### Handling Critical Mobile Hotfixes
```
main ─────────────●──────────────────────●──────► [Ongoing Development]
                   \                    /
release/v2.4.0      └──●───[Store Cut]─┼────────► [App Store Review]
                       \               │
hotfix/v2.4.1           └──●──(Fix)────┴────────► [Emergency Patch v2.4.1]
```

1. Cut `release/v2.4.0` from `main` two days before release freeze.
2. If a critical crash is discovered in QA or initial store rollout:
   - Create `hotfix/v2.4.1` off `release/v2.4.0`.
   - Apply fix, test, bump internal build number.
   - Resubmit patch to stores and cherry-pick fix back into `main`.

---

### Case Strategy D: Multi-Tenant Enterprise SaaS

#### Target Profile
B2B Enterprise SaaS applications hosting multi-tenant databases, shared services, and custom tenant tiers (Free, Professional, Enterprise).

#### Architecture Blueprint
- **Branching Strategy**: Trunk-Based Development with Conventional Commits.
- **Versioning**: SemVer 2.0.0 automated via `semantic-release` / `release-please`.
- **Release Strategy**: Ring-Based Progressive Delivery with Tenant Feature Gating.

#### Tenant Feature Gating Rules
- **Ring 0 (Internal/Staff Tenants)**: Immediately receives all new feature flag variants.
- **Ring 1 (Early Access / Beta Tenants)**: Evaluates feature flags set to `Beta` tier.
- **Ring 2 (General Tenants)**: Features enabled after 72 hours of zero error budget consumption in Ring 1.
- **Ring 3 (Dedicated / Isolation Tenants)**: Released strictly during customer maintenance windows.

---

## 🛑 Limitations & Anti-Patterns to Avoid

1. **Anti-Pattern 1: Long-Lived Feature Branches (> 3 Days)**
   - *Consequence*: Massive merge friction, duplicate bug fixes, context switching, high probability of regression bugs.
   - *Remediation*: Break work down into smaller sub-tasks; use Feature Flags to merge incomplete features safely.

2. **Anti-Pattern 2: Branching per Customer / Tenant**
   - *Consequence*: Exponential code drift, impossible maintenance overhead, failure to scale engineering operations.
   - *Remediation*: Maintain a single unified codebase; handle customer-specific behavior via runtime configurations and tenant settings.

3. **Anti-Pattern 3: Manual Versioning & Changelogs**
   - *Consequence*: Human error, version drift between tags and code artifacts, missing changelog notes.
   - *Remediation*: Adopt Conventional Commits (`feat:`, `fix:`, `feat!:`) and automate versioning using `semantic-release`.
