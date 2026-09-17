# 04. Automation & Pipeline Blueprints

A collection of production-grade CI/CD pipelines, automated versioning configurations, and branch protection blueprints.

---

## 🛠️ Automated Semantic Release & Versioning Blueprint

Using **Conventional Commits** paired with **`semantic-release`** eliminates manual versioning and automatically generates release notes, tags, and changelogs.

```
[Developer Commit: feat(auth): add OAuth2 provider] 
                     │
                     ▼
             [Push to main]
                     │
                     ▼
          [CI Pipeline Executes]
                     │
         ┌───────────┴───────────┐
         ▼                       ▼
 [Analyzes Commits]    [Determines Version Bump]
 (Conventional Commit)   (feat -> MINOR bump v1.3.0)
                         │
                         ▼
               [Creates Git Tag v1.3.0]
               [Generates CHANGELOG.md]
               [Publishes Container/Package]
```

### 1. Conventional Commits Spec Reference

| Commit Prefix | SemVer Release Impact | Example Commit Message |
| :--- | :--- | :--- |
| `fix:` | **PATCH** bump | `fix(cache): resolve tenant cache invalidation race condition` |
| `feat:` | **MINOR** bump | `feat(api): add multi-region read replica configuration` |
| `feat!:` or `BREAKING CHANGE:` | **MAJOR** bump | `feat!(auth): migrate session tokens to JWT RS256 algorithm` |
| `chore:`, `docs:`, `style:` | No Release Bump | `docs(readme): update deployment prerequisites` |

---

### 2. GitHub Actions Automated Release Workflow (`.github/workflows/release.yml`)

```yaml
name: Automated Semantic Release & Tagging

on:
  push:
    branches:
      - main

permissions:
  contents: write
  packages: write
  pull-requests: write

jobs:
  release:
    name: Run Semantic Release
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
          token: ${{ secrets.GITHUB_TOKEN }}

      - name: Setup Node.js Environment
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install Release Dependencies
        run: |
          npm install -g \
            semantic-release \
            @semantic-release/changelog \
            @semantic-release/git \
            @semantic-release/github \
            @semantic-release/exec

      - name: Execute Semantic Release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: npx semantic-release
```

#### `.releaserc.json` Configuration
```json
{
  "branches": ["main"],
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    [
      "@semantic-release/changelog",
      {
        "changelogFile": "CHANGELOG.md"
      }
    ],
    [
      "@semantic-release/git",
      {
        "assets": ["CHANGELOG.md", "package.json"],
        "message": "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}"
      }
    ],
    "@semantic-release/github"
  ]
}
```

---

## 🔒 Branch Protection Infrastructure as Code (Terraform)

Enforce branch protection policies programmatically across all organization repositories using the Terraform GitHub Provider.

```hcl
# terraform/branch_protection.tf

terraform {
  required_providers {
    github = {
      source  = "integrations/github"
      version = "~> 6.0"
    }
  }
}

resource "github_branch_protection" "protect_main" {
  repository_id = "multi-tenant-saas-demo"
  pattern       = "main"

  # Enforce pull request reviews before merging
  required_pull_request_reviews {
    dismiss_stale_reviews           = true
    restrict_dismissals             = true
    required_approving_review_count = 2
    require_code_owner_reviews      = true
  }

  # Require status checks to pass before merging
  required_status_checks {
    strict   = true # Branch must be up to date before merging
    contexts = [
      "ci/unit-tests",
      "ci/integration-tests",
      "security/trivy-scan",
      "lint/eslint"
    ]
  }

  # Enforce linear history (prevents merge commits on main)
  required_linear_history = true

  # Block force pushes and branch deletion
  allows_force_pushes = false
  allows_deletions    = false

  # Enforce protection policies for administrators as well
  enforce_admins = true
}
```

---

## 🚀 Progressive Delivery Pipeline Snippet (GitLab CI)

```yaml
# .gitlab-ci.yml - Canary Progressive Delivery

stages:
  - test
  - build
  - deploy-canary
  - promote-production

deploy_canary_5percent:
  stage: deploy-canary
  script:
    - echo "Deploying Canary build (v${CI_COMMIT_TAG}) to 5% live traffic..."
    - kubectl set image deployment/api-service api=${CI_REGISTRY_IMAGE}:${CI_COMMIT_TAG}
    - kubectl annotate rollout/api-service-rollout rollouts.argoproj.io/weight=5 --overwrite
  only:
    - tags

run_canary_health_analysis:
  stage: deploy-canary
  needs: [deploy_canary_5percent]
  script:
    - echo "Evaluating Prometheus error budget during 15-minute observation window..."
    - python3 scripts/eval_canary_prometheus.py --metric latency_p99 --threshold-ms 150
  only:
    - tags

promote_to_100percent:
  stage: promote-production
  needs: [run_canary_health_analysis]
  script:
    - echo "Promoting Canary build to 100% production traffic..."
    - kubectl argo rollouts promote api-service-rollout
  only:
    - tags
  when: manual # Requires manual operator approval for 100% final promotion
```
