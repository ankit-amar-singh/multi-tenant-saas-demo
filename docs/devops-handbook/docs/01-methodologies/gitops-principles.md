# GitOps Principles & Operating Model

**GitOps** is an operational framework that takes DevOps best practices used for application development—such as version control, code review, continuous integration, and automated deployments—and applies them to infrastructure and application configuration management.

---

## 📜 The OpenGitOps Core Principles

According to the **OpenGitOps Working Group (CNCF)**, a system strictly conforms to GitOps if it satisfies four core principles:

```
+-----------------------------------------------------------------+
|                       THE 4 GITOPS PRINCIPLES                   |
+-------------------+-------------------+-------------------+-----+-------------------+
| 1. DECLARATIVE    | 2. VERSIONED      | 3. AUTOMATED      | 4. CONTINUOUS     |
|    SYSTEM STATE   |    & IMMUTABLE    |    PULL SYNC      |    RECONCILIATION |
+-------------------+-------------------+-------------------+-------------------+
| Entire system state| Stored in Git    | Software agents   | Agents continuously|
| expressed in code | with full audit   | pull changes from | drift detect and   |
| (K8s YAML / IaC)  | history & diffs   | repository to K8s | auto-reconcile    |
+-------------------+-------------------+-------------------+-------------------+
```

1. **Declarative**: The desired state of the entire system (infrastructure, networking, workloads, secrets policies) is defined declaratively (e.g., Kubernetes YAML, Helm charts, Kustomize overlays).
2. **Versioned and Immutable**: Desired state is stored in a canonical version control system (Git) that serves as the single source of truth. Every change is an immutable commit with full auditability.
3. **Pulled Automatically**: Software agents (e.g., ArgoCD, Flux) running directly inside the target environment continuously pull the desired state from Git rather than accepting external `kubectl apply` pushes.
4. **Continuously Reconciled**: Software agents monitor the actual state of the cluster in real time. If state drift occurs (e.g., manual intervention or cluster node crash), the agent automatically reconciles the actual state back to the desired Git state.

---

## 🔄 Push-Based CI/CD vs Pull-Based GitOps

| Dimension | Push-Based CI/CD (Jenkins, GitHub Actions) | Pull-Based GitOps (ArgoCD, Flux) |
| :--- | :--- | :--- |
| **Execution Location** | External runner machine / CI server | Inside the target Kubernetes cluster |
| **Security Risk** | Requires high-privilege cluster admin credentials stored in CI secrets | No cluster credentials exposed outside the cluster firewalls |
| **Drift Detection** | None (only acts when pipeline is triggered) | Continuous real-time drift detection and automated remediation |
| **Audit Trail** | Fragmented across CI pipeline execution logs | Clean Git commit history and branch pull request approvals |
| **Multi-Cluster Scaling** | Requires management of dozens of cluster credentials in CI | Centralized GitOps engine managing target workload clusters |

---

## 🔒 GitOps Security Guardrails

- **Branch Protection Rules**: Require mandatory code review approvals (CODEOWNERS) and passing automated status checks (SAST, dry-run linting) before merging to `main`.
- **RBAC & Least Privilege**: Developers only need write access to Git repositories—they no longer require direct `kubectl` access to production clusters.
- **Signed Commits (GPG/SSH)**: Enforce signed commits to prevent malicious unauthorized configuration pushes.
