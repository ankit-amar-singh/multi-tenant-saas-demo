# Terraform vs OpenTofu: Deep Technical Comparison

In August 2023, HashiCorp transitioned Terraform from the open-source Mozilla Public License (MPL v2) to the commercial Business Source License (BUSL v1.1). In response, the Linux Foundation launched **OpenTofu** as a 100% open-source, community-governed fork.

---

## ⚖️ Technical Feature Breakdown

| Architectural Dimension | HashiCorp Terraform | OpenTofu (Linux Foundation) |
| :--- | :--- | :--- |
| **Licensing** | Business Source License (BUSL 1.1) - Non-compete restriction | Mozilla Public License 2.0 (MPL v2) - 100% Free Open Source |
| **Governance** | HashiCorp / IBM Corporate Control | Linux Foundation / OpenTofu Technical Steering Committee |
| **State File Compatibility**| Fully compatible up to v1.5; diverging features in v1.6+ | 100% drop-in replacement for Terraform <= v1.5; independent v1.6+ features |
| **Key Exclusive Features** | HashiCorp Cloud Platform (HCP) integrations, HCP Sentinel | Native Client-Side State Encryption, Parameterized Providers, Extended `testing` framework |
| **Registry** | HashiCorp Registry (`registry.terraform.io`) | OpenTofu Registry (`registry.opentofu.org`) mirroring public providers |
| **Ecosystem Ecosystem** | Spacelift, env0, Scalr, HashiCorp Cloud | Spacelift, env0, Scalr, Harness, Digger |

---

## 🏗️ OpenTofu Key Feature Innovations

### 1. Native Client-Side State Encryption
OpenTofu introduces built-in state file encryption key management natively without relying on external cloud KMS abstractions:

```hcl
# OpenTofu Native State Encryption Configuration
tofu {
  encryption {
    key_provider "aws_kms" "main" {
      kms_key_id = "arn:aws:kms:us-east-1:123456789012:key/abc-123"
      region     = "us-east-1"
    }

    method "aes_gcm" "default" {
      keys = key_provider.aws_kms.main
    }

    state {
      method = method.aes_gcm.default
    }
  }
}
```

### 2. Migration Path: Switching from Terraform to OpenTofu

Transitioning an existing repository from Terraform to OpenTofu is designed to be seamless:

```bash
# Step 1: Install OpenTofu CLI
curl --proto '=https' --tlsv1.2 -fsSL https://get.opentofu.org/install-opentofu.sh | sh -s -- --install-method deb

# Step 2: In your Terraform directory, initialize OpenTofu
tofu init

# Step 3: Run plan and apply using OpenTofu
tofu plan
tofu apply
```

---

## 🎯 What to Choose When (Terraform vs OpenTofu)

- **Choose OpenTofu** if:
  - Your organization requires open-source license compliance (avoiding vendor lock-in or BUSL non-compete clauses).
  - You want native state encryption and rapid community-driven feature additions.
  - You are building commercial developer platforms or SaaS wrappers around IaC engines.

- **Choose HashiCorp Terraform** if:
  - You are already deeply invested in HashiCorp Cloud Platform (HCP) enterprise contracts and Sentinel policy engines.
  - Your team requires vendor support directly from HashiCorp/IBM.
