# Crossplane: Kubernetes-Native Infrastructure Control Planes

**Crossplane** is an open-source Kubernetes extension (CNCF Incubating) that transforms a Kubernetes cluster into a universal cloud control plane. Crossplane enables platform teams to assemble cloud infrastructure resources from multiple providers (AWS, GCP, Azure) into custom, developer-friendly Custom Resource Definitions (CRDs).

---

## 🏛️ How Crossplane Works

```
+---------------------------------------------------------------------------------+
|                               CROSSPLANE ARCHITECTURE                           |
+---------------------------------------------------------------------------------+
| Application Developer : Submits clean Claim manifest (e.g. PostgreSQLInstance)  |
+---------------------------------------------------------------------------------+
| Composite Resource (XR): Maps custom abstraction to cloud provider resources    |
+---------------------------------------------------------------------------------+
| Managed Resources (MR) : Crossplane Providers (Provider-AWS, Provider-GCP)      |
+---------------------------------------------------------------------------------+
| Cloud Infrastructure  : Provisions AWS RDS, GCP Cloud SQL, Azure Database       |
+---------------------------------------------------------------------------------+
```

---

## 🚀 Key Advantages of Crossplane for GitOps

1. **GitOps Native**: Infrastructure resources are managed as standard Kubernetes manifests (`kubectl apply` / ArgoCD).
2. **Continuous Drift Reconciliation**: Kubernetes controllers constantly monitor and reconcile cloud resource drift every few seconds (unlike static `terraform apply` executions).
3. **Abstraction for IDPs**: Allows platform teams to expose simple `DatabaseClaim` manifests to app developers while hiding VPC, IAM, security groups, and encryption keys underneath.
