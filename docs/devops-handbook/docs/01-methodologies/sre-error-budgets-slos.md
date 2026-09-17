# Site Reliability Engineering (SRE): SLIs, SLOs & Error Budgets

Site Reliability Engineering (SRE) is a discipline that applies software engineering principles to infrastructure and operations problems. Pioneered by Google, SRE bridges the gap between software development and production operations.

---

## 📐 Core Principles: SLI, SLO, SLA & Error Budgets

```
+-------------------------------------------------------------------------+
|                          SRE SERVICE LEVEL STACK                        |
+-------------------------------------------------------------------------+
| SLA (Service Level Agreement)   : Legal/Business contract with customer  |
|                                   Example: 99.9% availability ($ back)  |
+-------------------------------------------------------------------------+
| SLO (Service Level Objective)   : Internal engineering reliability target|
|                                   Example: 99.95% successful requests   |
+-------------------------------------------------------------------------+
| SLI (Service Level Indicator)   : Real-time quantitative measurement  |
|                                   Example: Good Requests / Total Requests|
+-------------------------------------------------------------------------+
| ERROR BUDGET                     : Allowed unreliability (100% - SLO)   |
|                                   Example: 0.05% = 21.6 mins downtime/mo |
+-------------------------------------------------------------------------+
```

### Definitions & Formulas

1. **Service Level Indicator (SLI)**: A quantifiable metric measuring service performance in real time.
   $$\text{SLI} = \frac{\text{Good Events}}{\text{Total Events}} \times 100$$
   *Example*: Percentage of HTTP requests that return status code 200/204 within 200ms latency.

2. **Service Level Objective (SLO)**: The target reliability goal agreed upon by product and engineering teams.
   *Example*: $99.95\%$ of API requests must be successful over a rolling 30-day window.

3. **Service Level Agreement (SLA)**: A business contract defining penalties or credits if reliability falls below a threshold. SLAs are usually looser than internal SLOs (e.g., SLA of $99.9\%$ vs. SLO of $99.95\%$).

4. **Error Budget**: The mathematical allowance for unreliability.
   $$\text{Error Budget} = 100\% - \text{SLO}$$
   For an SLO of $99.9\%$, the Error Budget is $0.1\%$. Over 30 days ($43,200$ minutes), this permits **43.2 minutes of total allowable downtime**.

---

## ⏱️ Availability vs Downtime Table

| Availability SLO | Permissible Downtime / Year | Permissible Downtime / Month | Permissible Downtime / Week |
| :--- | :--- | :--- | :--- |
| **99% ("Two Nines")** | 3.65 days | 7.31 hours | 1.68 hours |
| **99.9% ("Three Nines")** | 8.76 hours | 43.8 minutes | 10.1 minutes |
| **99.95% ("Three and a half Nines")**| 4.38 hours | 21.9 minutes | 5.04 minutes |
| **99.99% ("Four Nines")** | 52.6 minutes | 4.38 minutes | 1.01 minutes |
| **99.999% ("Five Nines")** | 5.26 minutes | 25.9 seconds | 6.05 seconds |

---

## 🛑 How to Enforce Error Budget Policies

An Error Budget is not just a reporting metric—it is an operational policy mechanism for balancing velocity and stability:

- **Budget > 0% (Healthy)**: Product teams have greenlight permission to deploy new features, run experimental A/B tests, and push frequent releases.
- **Budget Exhausted (= 0%)**: Feature freezes are triggered automatically:
  - All feature deployments are paused.
  - Engineering sprints shift 100% focus to reliability engineering, tech debt reduction, bug fixes, and infrastructure hardening.
  - Releases resume only when the rolling error budget recovers.

---

## 🚨 Burn Rate Alerting Strategies

Relying on simple threshold alerts (e.g., "Alert if error rate > 1%") leads to alert fatigue or delayed notifications for slow burns. SREs implement **Multi-Window Multi-Burn-Rate Alerting** based on Prometheus/OpenTelemetry:

```yaml
# Prometheus Alert Rule for 14.4x Burn Rate (Consumes 2% of budget in 1 hour)
groups:
  - name: SRE_SLO_Alerts
    rules:
      - alert: HighErrorBudgetBurnRate
        expr: |
          (
            sum(rate(http_requests_total{status=~"5.."}[5m]))
            /
            sum(rate(http_requests_total[5m]))
          ) > (1 - 0.999) * 14.4
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "Error budget burning at 14.4x rate (Fast Burn)"
          description: "Service will exhaust 100% of 30-day error budget in under 50 hours if unmitigated."
```
