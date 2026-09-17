# DevSecOps & Shift-Left Security

**DevSecOps** integrates security practices into every phase of the software development lifecycle (SDLC), from initial design to production operations. Rather than treating security as an afterthought or a final gatekeeping audit, DevSecOps "shifts security left"—embedding automated security guardrails directly into developer workflows.

---

## 🛡️ The DevSecOps Security Pipeline

```
+-----------------------------------------------------------------------------------+
|                           DEVSECOPS SHIFT-LEFT PIPELINE                           |
+---------------+-------------------+-------------------+-------------------+-------+
|  IDE / PRE-COMMIT| BUILD & CI STAGE| CONTAINER REGISTRY| GITOPS DEPLOYMENT | PROD  |
+---------------+-------------------+-------------------+-------------------+-------+
| • Gitleaks    | • SonarQube SAST  | • Trivy Image     | • Kyverno / OPA   | • Cilium|
| • Pre-commit  | • Dependency-Check|   Vulnerability   |   Admission Ctrl  |   mTLS|
|   secrets scan| • Checkov IaC Scan| • Cosign Image    | • HashiCorp Vault | • Falco|
|               | • DAST Scan       |   Signing (SLSA)  |   Secret Injection|   Runtime|
+---------------+-------------------+-------------------+-------------------+-------+
```

---

## 🔍 Core Security Testing Categories

### 1. Static Application Security Testing (SAST)
- **Concept**: Analyzes source code for security flaws (e.g., SQL injection, XSS, insecure deserialization) without executing the code.
- **Top Tools**: SonarQube, Semgrep, CodeQL, Veracode.

### 2. Software Composition Analysis (SCA) & Dependency Scanning
- **Concept**: Identifies vulnerable open-source third-party packages, libraries, and licenses in application manifests (e.g., `package.json`, `pom.xml`, `go.mod`).
- **Top Tools**: Trivy, Snyk, OWASP Dependency-Check, Grype.

### 3. Secret Detection & Prevention
- **Concept**: Prevents API keys, database passwords, and private tokens from leaking into Git history.
- **Top Tools**: Gitleaks, Trufflehog, Git-secrets.

### 4. Infrastructure as Code (IaC) Security Scanning
- **Concept**: Scans Terraform, CloudFormation, Helm, and K8s manifests for misconfigurations (e.g., open S3 buckets, exposed SSH ports, unencrypted volumes).
- **Top Tools**: Checkov, Tfsec, Kube-bench, Terrascan.

### 5. Container & Image Security
- **Concept**: Inspects base OS layers and packages inside container images for CVEs and unprivileged execution.
- **Top Tools**: Trivy, Clair, Anchore Grype, Docker Scout.

### 6. Dynamic Application Security Testing (DAST)
- **Concept**: Tests running application endpoints from the outside in real-time, simulating external malicious attacks.
- **Top Tools**: OWASP ZAP, Burp Suite Enterprise, Nuclei.

---

## 🔐 Supply Chain Security & SLSA Framework

To prevent supply chain attacks (e.g., SolarWinds, Codecov), DevSecOps adopts **Supply-chain Levels for Software Artifacts (SLSA)**:
- **Cryptographic Image Signing**: Sign images with `cosign` (Sigstore) during CI build.
- **Software Bill of Materials (SBOM)**: Generate standardized SPDX/CycloneDX SBOMs for every build artifact.
- **Verification Gate**: Enforce Kubernetes admission controllers (Kyverno) to reject unsigned or non-compliant container images at deployment time.
