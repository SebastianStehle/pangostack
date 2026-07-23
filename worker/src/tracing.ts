import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { NodeSDK } from '@opentelemetry/sdk-node';

const DEFAULT_SERVICE_NAME = 'pangostack-worker';

// OpenTelemetry is the open standard we use for traces and metrics. It is opt-in: the SDK only starts
// when an OTLP collector endpoint is configured. Because the backend calls the worker over HTTP and
// both are instrumented, a deployment is traced end to end (backend -> worker) once a collector is set.
//
// This file must be imported before anything else in main.ts: the auto-instrumentations patch modules
// (http, express, ...) at require time, so the SDK has to start before those modules are loaded.
if (process.env.OTEL_EXPORTER_OTLP_ENDPOINT) {
  if (!process.env.OTEL_SERVICE_NAME) {
    process.env.OTEL_SERVICE_NAME = DEFAULT_SERVICE_NAME;
  }

  const sdk = new NodeSDK({
    traceExporter: new OTLPTraceExporter(),
    metricReader: new PeriodicExportingMetricReader({ exporter: new OTLPMetricExporter() }),
    instrumentations: [
      getNodeAutoInstrumentations({
        '@opentelemetry/instrumentation-fs': { enabled: false },
      }),
    ],
  });

  sdk.start();

  const shutdown = () => {
    sdk.shutdown().catch((error) => console.error('Failed to shut down OpenTelemetry SDK', error));
  };

  process.once('SIGTERM', shutdown);
  process.once('SIGINT', shutdown);
}
