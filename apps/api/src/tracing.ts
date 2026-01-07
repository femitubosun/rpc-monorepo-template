import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { IORedisInstrumentation } from '@opentelemetry/instrumentation-ioredis';
import { CompressionAlgorithm } from '@opentelemetry/otlp-exporter-base';
import {
  envDetector,
  hostDetector,
  osDetector,
  processDetector,
} from '@opentelemetry/resources';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { PrismaInstrumentation } from '@prisma/instrumentation';
import Env from '@template/env';

const traceExporter = new OTLPTraceExporter({
  url: Env.OTEL_EXPORTER_OTLP_ENDPOINT
    ? `${Env.OTEL_EXPORTER_OTLP_ENDPOINT}/v1/traces`
    : 'http://localhost:4318/v1/traces',
  compression: CompressionAlgorithm.GZIP,
});

const metricExporter = new OTLPMetricExporter({
  url: Env.OTEL_EXPORTER_OTLP_ENDPOINT
    ? `${Env.OTEL_EXPORTER_OTLP_ENDPOINT}/v1/metrics`
    : 'http://localhost:4318/v1/metrics',
  compression: CompressionAlgorithm.GZIP,
});

const sdk = new NodeSDK({
  resourceDetectors: [envDetector, processDetector, osDetector, hostDetector],
  serviceName: 'collabscape-api',
  traceExporter,
  metricReader: new PeriodicExportingMetricReader({
    exporter: metricExporter,
    exportIntervalMillis: 60_000,
  }),
  instrumentations: [
    new PrismaInstrumentation(),
    new IORedisInstrumentation({
      dbStatementSerializer: (cmdName, cmdArgs) => {
        return `${cmdName} ${cmdArgs.slice(0, 2).join(' ')}`;
      },
    }),
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-fs': {
        enabled: false,
      },
      '@opentelemetry/instrumentation-ioredis': {
        enabled: false,
      },
    }),
  ],
});

sdk.start();

export async function shutdownTracing() {
  await sdk.shutdown();
  console.log('Tracing terminated');
}
