# Case Study 1: Scaling a Multi-Cloud SaaS Startup with ArgoCD, OpenTofu & EKS/GKE

## Executive Summary
This case study documents how a fast-growing B2B SaaS company scaled its infrastructure from 5 manual EC2 instances to a multi-region, multi-cloud GitOps architecture across AWS (EKS) and GCP (GKE) serving 500,000 active daily users.

---

## 🛑 Problem Statement & Initial Challenges
- **Manual Overhead**: Developers manually ran `ssh` scripts to deploy application updates.
- **Environment Drift**: Staging and production configurations diverged drastically.
- **Single Point of Failure**: Lack of automated infrastructure provisioning led to a 14-hour outage during an AWS region degradation.

---

## 🏛️ Target Architecture & Solution Design

```
+---------------------------------------------------------------------------------+
|                        MULTI-CLOUD GITOPS ARCHITECTURE                          |
+---------------------------------------------------------------------------------+
| Git Repository (Single Source of Truth)                                         |
|   └── terraform-modules/ (OpenTofu AWS EKS + GCP GKE provisioning)              |
|   └── k8s-manifests/    (ArgoCD ApplicationSets for multi-cluster workloads)    |
+---------------------------------------------------------------------------------+
| GitHub Actions (CI & Security)                                                  |
|   ├── Gitleaks secret scan                                                      |
|   ├── Trivy container image CVE scan                                            |
|   └── Push container image to AWS ECR & GCP Artifact Registry                   |
+---------------------------------------------------------------------------------+
| GitOps Continuous Delivery (ArgoCD)                                             |
|   ├── ArgoCD Instance on AWS EKS (Primary Control Cluster)                     |
|   └── Syncs workloads automatically to AWS us-east-1 EKS & GCP us-central1 GKE  |
+---------------------------------------------------------------------------------+
```

---

## 📈 Key Results & Impact

- **Deployment Frequency**: Increased from **1 release / 2 weeks** to **18 automated releases / day**.
- **Change Failure Rate**: Reduced from **28%** to **0.4%**.
- **Mean Time to Restore (MTTR)**: Dropped from **4.5 hours** to **4 minutes** (automated ArgoCD rollback).
- **RTO / RPO**: Reduced Disaster Recovery RTO from **12 hours** to **< 10 minutes** via OpenTofu multi-region failover.
