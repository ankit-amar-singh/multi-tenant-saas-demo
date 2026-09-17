# Secrets Management: HashiCorp Vault & External Secrets Operator

Managing sensitive credentials (database passwords, API tokens, TLS certificates) securely in Kubernetes without committing plain-text secrets to Git is a critical requirement of modern DevSecOps.

---

## 🏛️ External Secrets Operator (ESO) + HashiCorp Vault Pattern

```
+---------------------------------------------------------------------------------+
|                    VAULT + EXTERNAL SECRETS OPERATOR ARCHITECTURE               |
+---------------------------------------------------------------------------------+
| 1. HashiCorp Vault        : Centralized secret engine (encryption at rest, ACLs) |
+---------------------------------------------------------------------------------+
| 2. ExternalSecret CRD     : K8s manifest referencing Vault path (Committed to Git)|
+---------------------------------------------------------------------------------+
| 3. ESO Controller         : Authenticates via K8s SA, fetches secret from Vault |
+---------------------------------------------------------------------------------+
| 4. Native K8s Secret      : ESO automatically generates & syncs standard K8s Secret|
+---------------------------------------------------------------------------------+
```

---

## 📄 Manifest Example: ExternalSecret Definition

```yaml
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: database-credentials
  namespace: production
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: vault-backend
    kind: ClusterSecretStore
  target:
    name: db-app-secret
    creationPolicy: Owner
  data:
    - secretKey: DB_PASSWORD
      remoteRef:
        key: secret/data/production/database
        property: password
    - secretKey: DB_USERNAME
      remoteRef:
        key: secret/data/production/database
        property: username
```
