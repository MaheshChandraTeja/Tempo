import { DEBUG_TAGS } from '@/utils/logger/debugTags';
import { localLogger } from '@/utils/logger/localLogger';
import { createManagedOcrAdapter } from '@/vision/ocr/ocr.adapter';
import type { OcrAdapter, OcrImageSource } from '@/vision/ocr/ocr.types';
import {
    createPipelineMetricsTracker,
    type PipelineMetrics,
} from '@/vision/pipeline/pipeline.metrics';
import type { TreadmillParserResult } from '@/vision/treadmill/treadmill.fields';
import { parseTreadmillOcr } from '@/vision/treadmill/treadmill.parser';

export type ScanPipelineCaptureInput = Readonly<{
  source: OcrImageSource;
  captureDebugLabel?: string;
}>;

export type ScanPipelineResult =
  | Readonly<{
      ok: true;
      source: OcrImageSource;
      parsed: TreadmillParserResult;
      metrics: PipelineMetrics;
      debug: Readonly<{
        captureDebugLabel?: string;
        ocrWarnings: string[];
      }>;
    }>
  | Readonly<{
      ok: false;
      source: OcrImageSource | null;
      error: string;
      metrics: PipelineMetrics;
    }>;

export type ScanPipelineDependencies = Readonly<{
  ocrAdapter: OcrAdapter;
  now?: () => number;
  logger?: {
    debug: (message: string, details?: unknown) => void;
    info: (message: string, details?: unknown) => void;
    error: (message: string, details?: unknown) => void;
  };
}>;

export type ScanPipeline = Readonly<{
  run: (input: ScanPipelineCaptureInput) => Promise<ScanPipelineResult>;
}>;

function getLogger(deps: ScanPipelineDependencies) {
  return (
    deps.logger ?? {
      debug: (message: string, details?: unknown) =>
        localLogger.debug(DEBUG_TAGS.SCAN, message, details),
      info: (message: string, details?: unknown) =>
        localLogger.info(DEBUG_TAGS.SCAN, message, details),
      error: (message: string, details?: unknown) =>
        localLogger.error(DEBUG_TAGS.SCAN, message, details),
    }
  );
}

export function createScanPipeline(
  dependencies: ScanPipelineDependencies,
): ScanPipeline {
  const logger = getLogger(dependencies);
  const managedOcr = createManagedOcrAdapter(dependencies.ocrAdapter);

  return Object.freeze({
    async run(input: ScanPipelineCaptureInput): Promise<ScanPipelineResult> {
      const metricsTracker = createPipelineMetricsTracker(
        dependencies.now ?? (() => Date.now()),
      );

      metricsTracker.start('total');

      try {
        logger.debug('Scan pipeline started.', {
          sourceKind: input.source.kind,
          captureDebugLabel: input.captureDebugLabel,
        });

        metricsTracker.start('ocr');
        const ocrResult = await managedOcr.run(input.source, {
          uppercase: true,
          preserveLineBreaks: true,
          includeDebugMetadata: true,
        });
        metricsTracker.end('ocr');

        if (!ocrResult.ok) {
          metricsTracker.end('total');

          const metrics = metricsTracker.finalize();

          logger.error('Scan pipeline OCR stage failed.', {
            error: ocrResult.error,
            metrics,
          });

          return {
            ok: false,
            source: input.source,
            error: ocrResult.error.message,
            metrics,
          };
        }

        metricsTracker.start('parse');
        const parsed = parseTreadmillOcr(ocrResult.normalized);
        metricsTracker.end('parse');

        metricsTracker.start('score');
        // Confidence scoring already happens inside parseTreadmillOcr.
        metricsTracker.end('score');

        metricsTracker.end('total');
        const metrics = metricsTracker.finalize();

        logger.info('Scan pipeline completed.', {
          confidence: parsed.confidence,
          warnings: parsed.warnings,
          metrics,
        });

        return {
          ok: true,
          source: input.source,
          parsed,
          metrics,
          debug: {
            captureDebugLabel: input.captureDebugLabel,
            ocrWarnings: ocrResult.normalized.warnings,
          },
        };
      } catch (error) {
        metricsTracker.end('total');
        const metrics = metricsTracker.finalize();

        const message =
          error instanceof Error && error.message.trim().length > 0
            ? error.message
            : 'Unexpected scan pipeline failure.';

        logger.error('Scan pipeline crashed.', {
          error: message,
          metrics,
        });

        return {
          ok: false,
          source: input.source,
          error: message,
          metrics,
        };
      }
    },
  });
}