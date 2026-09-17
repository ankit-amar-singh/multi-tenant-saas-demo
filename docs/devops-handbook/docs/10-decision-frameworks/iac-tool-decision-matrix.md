# IaC Tool Decision Matrix: What to Choose When

Choosing the right Infrastructure as Code (IaC) tool depends on organizational size, existing team skill sets, regulatory requirements, cloud footprint, and licensing constraints.

---

## 🧭 Algorithmic IaC Decision Tree

```
                                  [Start IaC Selection]
                                            |
                         Is Open-Source Licensing mandatory?
                                   /                 \
                                (Yes)               (No)
                                 /                     \
        Are engineers writing real code (TS/Py)?   Invested in HashiCorp Enterprise?
                   /              \                      /                  \
                (Yes)             (No)                (Yes)                 (No)
                 /                  \                  /                      \
             [Pulumi]           [OpenTofu]   [HashiCorp Terraform]         [Pulumi / OpenTofu]
```

---

## 📊 Comprehensive Trade-off Evaluation Matrix

| Evaluation Criteria | OpenTofu | HashiCorp Terraform | Pulumi | Crossplane | Ansible |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Licensing** | 100% Open Source (MPL v2) | BUSL 1.1 Commercial | Apache 2.0 (Open Source core) | Apache 2.0 (CNCF) | GPL v3 (Open Source) |
| **Primary Paradigm** | Declarative HCL | Declarative HCL | Imperative TS/Py/Go/C# | Declarative K8s CRDs | Procedural/Declarative YAML |
| **State Drift Detection**| On-demand (`tofu plan`) | On-demand (`terraform plan`)| On-demand (`pulumi preview`)| Continuous (K8s controller loop)| On-demand playbook run |
| **Primary Use Case** | Cloud Infra Provisioning | Enterprise Cloud Infra | Developer-centric Infra | GitOps IDP Control Plane | OS Config / VM Fleet Mgmt |
| **Steepness of Curve** | Low (Standard HCL) | Low (Standard HCL) | Medium (Requires Programming) | High (Requires K8s Expertise)| Low (YAML Playbooks) |
