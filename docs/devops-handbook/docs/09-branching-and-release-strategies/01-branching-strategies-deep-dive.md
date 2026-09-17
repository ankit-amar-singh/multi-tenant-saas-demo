# 01. Git Branching Strategies Deep Dive

A comprehensive operational guide to software branching models, branch lifecycles, merge rules, and team workflow mechanics.

---

## 🗺️ Executive Overview & Architecture Comparison

Selecting the right Git branching model dictates software velocity, deployment safety, integration friction, and release frequency. There is no single "best" strategy—the optimal choice depends on team size, release cadence, artifact type (SaaS web service vs. desktop/mobile app), and regulatory compliance requirements.

```
                  ┌────────────────────────────────────────────────────────┐
                  │                 Git Branching Models                   │
                  └──────────────────────────┬─────────────────────────────┘
                                             │
         ┌───────────────────────────────────┼───────────────────────────────────┐
         ▼                                   ▼                                   ▼
┌─────────────────┐                 ┌─────────────────┐                 ┌─────────────────┐
│   Trunk-Based   │                 │     GitFlow     │                 │   Environment   │
│   Development   │                 │ (Classic/Strict)│                 │   / Flow Models │
└────────┬────────┘                 └────────┬────────┘                 └────────┬────────┘
         │                                   │                                   │
         ├── Short-lived feature branches    ├── main + develop branches         ├── GitHub Flow (Deploy on Merge)
         ├── Main always deployable          ├── feature/*, release/*, hotfix/*  ├── GitLab Flow (Env/Version Branches)
         └── Decoupled via Feature Flags     └── Scheduled batch releases        └── Maintenance / LTS Branching
```

---

## 1. Trunk-Based Development (TBD)

### Core Mechanics
In **Trunk-Based Development**, all developers check in code directly to a single core branch (typically `main` or `trunk`) or merge via short-lived feature branches (lasting hours to a maximum of 1–2 days).

- **Trunk Integrity**: The trunk must remain in a constant **buildable and deployable** state. Automated CI pipelines execute on every commit or pull request.
- **Short Branch Lifespans**: Branches live for a maximum of 24–48 hours to minimize merge drift and eliminate long-lived integration pain ("merge hell").
- **Feature Flags / Toggles**: Incomplete or experimental features are hidden behind feature flags at runtime rather than isolated in unmerged git branches.

### ASCII Workflow Diagram

```
main  ───●───────●───────────●──────────────●───────────●───────────●─────────► (Deploy to Prod)
          \     /           /              /           /           /
feat-A     └───●─── (PR #1)  │             │           │          │   [Branch lifetime < 24h]
                            \             /           │          │
feat-B                       └───●───────●─── (PR #2) │          │
                                                      \         /
feat-C                                                 └───●───●─── (PR #3)
```

### Operational Rules & Branch Policy
1. **Branch Naming**: `feat/description-jira-id`, `fix/description-jira-id`, or `chore/description`.
2. **Merge Strategy**: **Squash & Merge** or **Rebase & Merge** to maintain a linear git history on `main`. Avoid 3-way merge commits on feature branch merges.
3. **CI Requirement**: Merging to `main` requires a passing pipeline: unit tests, integration tests, linting, security scans, and clean static analysis.
4. **Code Review**: Short PRs (< 300 lines of diff) reviewed and merged within 2 to 4 hours.

### Advantages & Disadvantages

| Strengths | Limitations |
| :--- | :--- |
| Eliminates merge debt and long-lived branch drift | Requires high test coverage (>80%) and mature CI/CD |
| Enables continuous deployment (CD) and multiple daily releases | Heavy dependency on Feature Flag infrastructure |
| Encourages small, incremental, low-risk code changes | Requires disciplined engineers who refrain from merging broken code |

---

## 2. GitFlow Architecture

### Core Mechanics
**GitFlow** is a strict, structured branching model designed around scheduled batch releases. It relies on two long-lived core branches (`main` and `develop`) alongside three supporting branch types (`feature/*`, `release/*`, `hotfix/*`).

- **`main` Branch**: Reflects official production state. Every commit on `main` represents a tagged release.
- **`develop` Branch**: Serves as the integration branch for completed features.
- **`feature/*` Branches**: Derived from `develop`, merged back into `develop`.
- **`release/*` Branches**: Forked from `develop` when a release scope freezes; updated only with bug fixes/docs before merging into BOTH `main` and `develop`.
- **`hotfix/*` Branches**: Forked directly from `main` to address production outages; merged back into BOTH `main` and `develop`.

### ASCII Workflow Diagram

```
main    ───●─────────────────────────────────────────────────●─────────●─────► [Tag v1.0.0]
            \                                               /         /
release      \                                 ┌──●───●────/─────────┐│        [Freeze & QA]
              \                               /           /          ││
develop ───────●───────●───────●─────────────●───────────●───────────┼┼──────► [Integration]
                \     /       /             /                        ││
feature          └───●───●───/             /                         ││        [Feature Dev]
                            \             /                          ││
hotfix                       └───────────/───────────────────────────┴┴──●───► [Production Fix]
```

### Step-by-Step Branch Operations

#### A. Starting & Finishing a Feature
```bash
# Start feature off develop
git checkout -b feature/user-auth develop

# Complete feature and merge back to develop (with merge commit to preserve history)
git checkout develop
git merge --no-ff feature/user-auth
git branch -d feature/user-auth
```

#### B. Cutting & Finalizing a Release Branch
```bash
# Cut release candidate from develop
git checkout -b release/v1.2.0 develop

# Perform version bumps, documentation updates, and bug fixes on release/v1.2.0...
# Finalize release: Merge to main and tag
git checkout main
git merge --no-ff release/v1.2.0
git tag -a v1.2.0 -m "Release v1.2.0"

# Backport release fixes to develop
git checkout develop
git merge --no-ff release/v1.2.0
git branch -d release/v1.2.0
```

#### C. Urgent Production Hotfix Workflow
```bash
# Fork hotfix directly from main
git checkout -b hotfix/v1.2.1 main

# Commit emergency fix...
# Merge hotfix into both main and develop
git checkout main
git merge --no-ff hotfix/v1.2.1
git tag -a v1.2.1 -m "Hotfix v1.2.1"

git checkout develop
git merge --no-ff hotfix/v1.2.1
git branch -d hotfix/v1.2.1
```

---

## 3. GitHub Flow (Deploy-on-Merge)

### Core Mechanics
**GitHub Flow** is a lightweight, pull-request-centric model optimized for Continuous Deployment (CD). It eliminates `develop`, `release/*`, and `hotfix/*` branches in favor of a single persistent branch: `main`.

- Anything in the `main` branch is **deployable at all times**.
- To work on something new, create a descriptive branch off `main` (e.g., `add-stripe-webhooks`).
- Open a Pull Request (PR) early for discussion and automated CI validation.
- Once approved and CI passes, deploy the branch to a staging or canary environment.
- Merge the PR into `main`—which automatically triggers production deployment.

```
main  ───●────────────────────────●───────────────────────●──────► (Auto Deploy to Prod)
          \                      /                       /
branch     └───●───●───[Deploy Staging]───●───[Approve]───────┘
```

---

## 4. GitLab Flow (Environment & Release Branches)

GitLab Flow bridges the gap between Trunk-Based simplicity and complex deployment environments by introducing explicit **Environment Branches** or **Version/Release Branches**.

### A. Environment Branches Model
Used when code moves sequentially through distinct infrastructure tiers (e.g., `main` -> `staging` -> `production`).

```
main     ───●───────●───────●────────────────────────────────► [Dev/Internal]
             \     /       /
staging       └───●───────/─────────●────────────────────────► [Staging Env]
                         /         /
production              └─────────●──────────────────────────► [Production Env]
```

### B. Release / Version Branches Model (LTS Maintenance)
Used for software products (packages, mobile apps, on-premise software) that must support multiple active software versions in production simultaneously.

```
main             ───●───────●───────●───────●───────► [v3.0 Unreleased]
                    │       │
v1-stable           └──●────┼───────────────●───────► [v1.2.4 Patch Support]
                            │
v2-stable                   └──●────────────●───────► [v2.0.1 Patch Support]
```

---

## 5. Summary & Model Comparison

| Characteristic | Trunk-Based Development | GitFlow | GitHub Flow | GitLab Flow |
| :--- | :--- | :--- | :--- | :--- |
| **Main Branch Stability** | High (Always deployable) | High (Tagged releases only) | High (Always deployable) | High (Integrates main) |
| **Number of Long-Lived Branches** | 1 (`main`) | 2 (`main`, `develop`) | 1 (`main`) | 1 + Env/Version branches |
| **Release Frequency** | Multiple times per day | Scheduled (Bi-weekly, Monthly) | Continuous (On PR merge) | Environment/Tier-driven |
| **Merge Friction** | Lowest | Highest (Merge conflicts on release) | Low | Low to Moderate |
| **Required Engineering Maturity** | High (Automation & Flags) | Moderate | Moderate | Moderate |
