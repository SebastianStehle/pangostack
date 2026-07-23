import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { TypeormInstrumentation } from 'opentelemetry-instrumentation-typeorm';

const DEFAULT_SERVICE_NAME = 'pangostack-backend';

// OpenTelemetry is the open standard we use for traces and metrics. It is opt-in: the SDK only starts
// when an OTLP collector endpoint is configured, so local development and setups without a collector
// are unaffected. Enable it by setting OTEL_EXPORTER_OTLP_ENDPOINT (e.g. http://localhost:4318).
//
// This file must be imported before anything else in main.ts: the auto-instrumentations patch modules
// (http, express, pg, ...) at require time, so the SDK has to start before those modules are loaded.
if (process.env.OTEL_EXPORTER_OTLP_ENDPOINT) {
  if (!process.env.OTEL_SERVICE_NAME) {
    process.env.OTEL_SERVICE_NAME = DEFAULT_SERVICE_NAME;
  }

  const sdk = new NodeSDK({
    traceExporter: new OTLPTraceExporter(),
    metricReader: new PeriodicExportingMetricReader({ exporter: new OTLPMetricExporter() }),
    instrumentations: [
      getNodeAutoInstrumentations({
        // File-system spans are extremely noisy and rarely useful for a service like this.
        '@opentelemetry/instrumentation-fs': { enabled: false },
      }),
      // TypeORM is not part of the auto-instrumentation bundle. This adds ORM-level spans (entity,
      // method, SQL) on top of the raw pg driver spans, so a slow query is traceable to its repository.
      new TypeormInstrumentation(),
    ],
  });

  sdk.start();

  const shutdown = () => {
    sdk.shutdown().catch((error) => console.error('Failed to shut down OpenTelemetry SDK', error));
  };

  process.once('SIGTERM', shutdown);
  process.once('SIGINT', shutdown);
}
