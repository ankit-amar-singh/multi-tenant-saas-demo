# Cilium eBPF: Next-Generation Kubernetes CNI & Networking

**Cilium** is an open-source software (CNCF Graduated) for providing, securing, and observing network connectivity between container workloads. Driven by **eBPF** (Extended Berkeley Packet Filter), Cilium dynamically injects security and networking logic into the Linux kernel without needing sidecar proxies.

---

## 🚀 Why eBPF Outperforms Traditional Sidecar & IPtables Architectures

```
+---------------------------------------------------------------------------------+
|                       TRADITIONAL KUBE-PROXY VS CILIUM EBPF                     |
+--------------------------------------------------+------------------------------+
| TRADITIONAL IPTABLES / SIDECAR (Envoy)           | CILIUM EBPF (Kernel Hook)    |
+--------------------------------------------------+------------------------------+
| • O(N) sequential iptables packet traversal      | • O(1) eBPF map hash lookup  |
| • High CPU overhead for sidecar proxy containers  | • Zero-sidecar mesh option   |
| • L4 packet inspection only (without Envoy sidecar)| Native L3/L4/L7 visibility |
+--------------------------------------------------+------------------------------+
```

---

## 🔒 Cilium NetworkPolicy Manifest Example

```yaml
apiVersion: "cilium.io/v2"
kind: CiliumNetworkPolicy
metadata:
  name: restrict-database-access
  namespace: production
spec:
  endpointSelector:
    matchLabels:
      app: postgres-db
  ingress:
    - fromEndpoints:
        - matchLabels:
            app: api-service
      toPorts:
        - ports:
            - port: "5432"
              protocol: TCP
```
