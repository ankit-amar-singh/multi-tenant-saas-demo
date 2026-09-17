# OpenTelemetry: The Vendor-Neutral Telemetry Standard

**OpenTelemetry (OTel)** is a vendor-neutral CNCF project that provides a single, unified set of APIs, SDKs, and tooling to generate, collect, transform, and export telemetry data (Metrics, Logs, Traces) to any observability backend (Prometheus, Jaeger, Datadog, Dynatrace, Grafana Tempo).

---

## 🏛️ OpenTelemetry Collector Architecture

```
+---------------------------------------------------------------------------------+
|                          OPENTELEMETRY COLLECTOR PIPELINE                       |
+---------------------------------------------------------------------------------+
| RECEIVERS    : Receives telemetry (OTLP, Prometheus, Jaeger, Zipkin, Fluentbit)  |
+---------------------------------------------------------------------------------+
| PROCESSORS   : Filters, batches, sanitizes PII secrets, enriches K8s metadata   |
+---------------------------------------------------------------------------------+
| EXPORTERS    : Exports clean telemetry to target backends (Prometheus, OTLP)    |
+---------------------------------------------------------------------------------+
```

---

## ⚙️ OpenTelemetry Collector Configuration Example

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318

processors:
  memory_limiter:
    check_interval: 1s
    limit_percentage: 75
    spike_limit_percentage: 15
  batch:
    send_batch_size: 8192
    timeout: 5s
  resourcedetection:
    detectors: [env, gcp, ecs, ec2, k8snode]

exporters:
  prometheus:
    endpoint: "0.0.0.0:8889"
  otlp/tempo:
    endpoint: "tempo.observability.svc.cluster.local:4317"
    tls:
      insecure: true

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [memory_limiter, batch, resourcedetection]
      exporters: [otlp/tempo]
    metrics:
      receivers: [otlp]
      processors: [memory_limiter, batch]
      exporters: [prometheus]
```
