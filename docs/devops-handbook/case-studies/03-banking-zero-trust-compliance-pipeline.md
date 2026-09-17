# Case Study 3: High-Compliance Banking Pipeline (Zero Trust & SOC2/ISO27001)

## Executive Summary
How a licensed digital bank built a zero-trust, continuous compliance DevSecOps deployment pipeline adhering to strict SOC2 Type II, ISO27001, and PCI-DSS 4.0 regulations.

---

## 🔒 Security Architecture Highlights

1. **Zero Standing Privileges (ZSP)**: Developers have 0 permanent SSH or `kubectl` production credentials. All operations are mediated through ephemeral Teleport / HashiCorp Vault tokens with 15-minute TTLs.
2. **Cryptographic Supply Chain Provenance**:
   - Every commit is signed via GPG/SSH keys.
   - GitHub Actions builds container images in isolated, ephemeral runners.
   - Container images are cryptographically signed using `cosign` and attested with SLSA Level 3 provenance.
   - Kyverno admission controller in Kubernetes blocks any image that lacks a valid signature from the internal KMS key.
3. **Policy-as-Code Enforcer (OPA & Kyverno)**:
   - Mandatory non-root container user (`runAsNonRoot: true`).
   - Read-only root file systems (`readOnlyRootFilesystem: true`).
   - Block `privileged` container flags and raw socket access.
   - Enforce resource limits (CPU/Memory) on all pod definitions.
4. **Secrets Encryption at Rest**: HashiCorp Vault Enterprise integrated with Kubernetes via External Secrets Operator (ESO), injecting dynamic database credentials rotated every 8 hours.

---

## 📋 Compliance Audit Metrics

- **Audit Preparation Time**: Reduced from **3 weeks of manual log collection** to **Instant automated evidence export** (Git history + Cosign attestations + Vault access logs).
- **Vulnerability Remediation SLA**: High/Critical CVEs patched automatically in CI within **24 hours**.
