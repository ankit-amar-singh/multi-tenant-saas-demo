# Pulumi: Real Programming Languages for IaC

**Pulumi** is an infrastructure as code platform that allows software engineers to declare cloud infrastructure using general-purpose programming languages (TypeScript, Python, Go, C#, Java, YAML) instead of proprietary domain-specific languages (DSLs) like HCL or JSON.

---

## 💻 Pulumi TypeScript Code Example

```typescript
import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

// Create an AWS S3 Bucket with automated tags and encryption
const appBucket = new aws.s3.BucketV2("app-data-bucket", {
    tags: {
        Environment: pulumi.getStack(),
        ManagedBy: "Pulumi",
    },
});

// Enable Server-Side Encryption
const bucketEncryption = new aws.s3.BucketServerSideEncryptionConfigurationV2("bucket-enc", {
    bucket: appBucket.id,
    rules: [{
        applyServerSideEncryptionByDefault: {
            sseAlgorithm: "AES256",
        },
    }],
});

// Export the bucket endpoint URL
export const bucketName = appBucket.id;
export const bucketArn = appBucket.arn;
```

---

## 📊 Terraform/OpenTofu vs Pulumi Comparison

| Feature | HashiCorp HCL (Terraform/OpenTofu) | Pulumi |
| :--- | :--- | :--- |
| **Language Paradigm** | Declarative Domain-Specific Language (HCL) | Imperative / Declarative in TS, Python, Go, C#, Java |
| **Abstractions & Logic** | Limited (`for_each`, dynamic blocks, modules) | Full programming power (loops, classes, async, npm/pip libraries) |
| **Unit Testing** | Basic `terraform test` framework | Standard test runners (`jest`, `pytest`, `go test`) |
| **IDE Support** | Basic syntax highlighting & LSP | Autocompletion, inline docs, refactoring, type checking |
| **State Engine** | S3/GCS backend or Terraform Cloud | Pulumi Service SaaS backend or self-managed S3 backend |

---

## 🎯 When to Choose Pulumi
- **Choose Pulumi** when your infrastructure team consists of software developers who want full language power, strong type-checking, npm/pip package sharing across services, and integration with standard software unit testing frameworks.
