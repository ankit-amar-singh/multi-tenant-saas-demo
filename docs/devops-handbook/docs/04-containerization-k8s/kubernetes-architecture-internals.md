# Kubernetes Architecture & Internals Deep Dive

**Kubernetes** (K8s) is an open-source container orchestration engine that automates application deployment, scaling, networking, and cluster management.

---

## 🏗️ Kubernetes Control Plane & Worker Node Internals

```
+---------------------------------------------------------------------------------+
|                          KUBERNETES CLUSTER ARCHITECTURE                        |
+---------------------------------------------------------------------------------+
| CONTROL PLANE NODES                                                             |
|   • kube-apiserver          : REST API gateway & validation hub                 |
|   • etcd                    : Distributed HA key-value store (cluster state)   |
|   • kube-scheduler          : Assigns un-scheduled pods to worker nodes       |
|   • kube-controller-manager : Runs core loops (Node, Deployment, ReplicaSet)   |
|   • cloud-controller-mgr    : Interfaces with cloud provider APIs               |
+---------------------------------------------------------------------------------+
| WORKER NODES                                                                    |
|   • kubelet                 : Agent enforcing pod specs with container runtime  |
|   • kube-proxy              : Maintains network proxy rules & IPVS/iptables     |
|   • Container Runtime       : containerd / CRI-O (OCI execution engine)        |
+---------------------------------------------------------------------------------+
```

---

## ⚙️ Core Control Loops & Declarative Reconciliation

Kubernetes operates on a **continuous reconciliation loop** pattern:

$$\text{Current State} \xrightarrow[\text{Reconcile Controller}]{\text{Observe \& Compare}} \text{Desired State (etcd)}$$

1. User submits a `Deployment` YAML to `kube-apiserver`.
2. `kube-apiserver` validates schema and authentication/authorization, then persists resource to `etcd`.
3. `kube-controller-manager` detects new `Deployment` and creates matching `ReplicaSet`.
4. `kube-scheduler` selects optimal worker nodes based on resource requests, taints, and affinity rules.
5. `kubelet` on target worker node receives Pod spec, communicates via CRI (Container Runtime Interface) to `containerd` to pull image and spawn containers, and binds CNI networking.
